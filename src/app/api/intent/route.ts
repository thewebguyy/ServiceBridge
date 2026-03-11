import { NextResponse } from 'next/server';
import { aiMatchingService, ParsedJobIntent } from '@/services/aiMatchingService';
import { providerService } from '@/services/providerService';
import { analyticsService } from '@/services/analyticsService';

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

    // 1. Natural Language Parse using Anthropic Claude
    const parsedIntent = await aiMatchingService.parseUserIntent(prompt);

    // 2. Fetch Base Set from DB using inferred category
    let internalDBResults: any[] = [];
    if (parsedIntent.service_category) {
       const res = await providerService.getProvidersByCategory(parsedIntent.service_category);
       internalDBResults = res.data;
    } else {
       internalDBResults = await providerService.getTopRatedProviders(10);
    }

    // 3. AI Ranks the Providers based on Trust Score + Intent bounds
    const rankings = await aiMatchingService.rankProvidersForJob(parsedIntent, internalDBResults);
    
    // 4. Generate the Suggestion Package
    const topProviderId = rankings.length > 0 ? rankings[0].provider_id : internalDBResults[0]?.id;
    const topProvider = internalDBResults.find(p => p.id === topProviderId);
    
    const suggestionPackage = aiMatchingService.generateSuggestedBooking(parsedIntent, topProvider);

    // 5. Fire Telemetry Tracking to PostHog server side (non-blocking simulation)
    // In production we fire posthog-node events here.
    // analyticsService.trackEvent('ai_search_executed', { category: parsedIntent.service_category });

    return NextResponse.json({
      intent: parsedIntent,
      ranked_providers: rankings,
      suggestion: suggestionPackage
    });

  } catch (error) {
    console.error('AI Intent API Error', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
