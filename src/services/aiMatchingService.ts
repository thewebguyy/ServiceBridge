import Anthropic from '@anthropic-ai/sdk';
import { providerService } from './providerService';

// Initialize server-side only Anthropic client
const getAnthropicClient = () => {
  return new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY || 'dummy_key', // Handled via env
  });
};

export interface ParsedJobIntent {
  service_category: string | null;
  location: string | null;
  urgency: 'low' | 'medium' | 'high';
  estimated_budget: string | null;
  reasoning: string;
}

export interface AIRankedProvider {
  provider_id: string;
  display_name: string;
  match_score: number; // 0-100 indicating AI's confidence in fit
  reasoning: string; // Explaining why the AI chose this provider
}

export const aiMatchingService = {
  /**
   * Natural Language Parsing: Transforms "I need a plumber in Lekki..." into structured filters
   */
  async parseUserIntent(prompt: string): Promise<ParsedJobIntent> {
    const anthropic = getAnthropicClient();
    
    const request = `
      You are an AI Assistant for "ServiceBridge", a local services marketplace.
      Extract structured data from the following customer request.
      
      Customer Request: "${prompt}"
      
      Output MUST be exactly valid JSON, obeying this schema:
      {
        "service_category": "Standardized category string like 'Plumber', 'Electrician', 'Cleaner', or null if unclear",
        "location": "City or neighborhood name, or null",
        "urgency": "low", "medium", or "high",
        "estimated_budget": "Extracted budget constraint or null",
        "reasoning": "One sentence explaining logic."
      }
    `;

    try {
      const response = await anthropic.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 300,
        temperature: 0,
        messages: [{ role: 'user', content: request }]
      });

      // Anthropic format output mapping
      const textBlock = response.content.find(c => c.type === 'text');
      const text = textBlock?.type === 'text' ? textBlock.text : '';
      
      // Parse out JSON
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error('AI returned malformed JSON');
      
      return JSON.parse(jsonMatch[0]) as ParsedJobIntent;
      
    } catch (error) {
      console.error('AI Intent Parsing Failed:', error);
      // Fallback
      return { service_category: null, location: null, urgency: 'medium', estimated_budget: null, reasoning: 'Fallback executed.' };
    }
  },

  /**
   * AI Provider Ranking: Takes database candidates and applies a LLM heuristic match
   */
  async rankProvidersForJob(intent: ParsedJobIntent, rawProviders: any[]): Promise<AIRankedProvider[]> {
    if (rawProviders.length === 0) return [];
    
    // Safety subset constraint
    const candidates = rawProviders.slice(0, 10).map(p => ({
      id: p.id,
      name: p.display_name,
      rating: p.avg_rating,
      jobs: p.completed_jobs,
      trust_score: p.trust_score,
      rate: p.hourly_rate,
      location: p.service_area
    }));

    const anthropic = getAnthropicClient();
    
    const request = `
      You are the ranking engine for "ServiceBridge". 
      Rank these provider candidates based on the customer's intent.
      
      Intent:
      Category: ${intent.service_category}
      Location: ${intent.location}
      Urgency: ${intent.urgency}
      
      Candidates:
      ${JSON.stringify(candidates, null, 2)}
      
      Return valid JSON matching this schema:
      {
        "rankings": [
          {
            "provider_id": "string",
            "match_score": number (0-100),
            "reasoning": "Short sentence justifying rank based on proximity, trust_score, rating, and rate."
          }
        ]
      }
    `;

    try {
      const response = await anthropic.messages.create({
        model: 'claude-3-sonnet-20240229', // We can use HAIKU/SONNET for speed/cost
        max_tokens: 500,
        temperature: 0,
        messages: [{ role: 'user', content: request }]
      });

      const textBlock = response.content.find(c => c.type === 'text');
      const text = textBlock?.type === 'text' ? textBlock.text : '';
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      
      if (!jsonMatch) throw new Error('AI ranking malformed');
      const parsed = JSON.parse(jsonMatch[0]);
      
      // Re-map back names to the output for ease of UI
      return parsed.rankings.map((r: any) => {
         const p = candidates.find(c => c.id === r.provider_id);
         return { ...r, display_name: p?.name || 'Unknown' };
      });
      
    } catch (error) {
      console.error('AI Ranking Engine Failed:', error);
      return [];
    }
  },

  /**
   * Generates a structural booking recommendation context
   */
  generateSuggestedBooking(intent: ParsedJobIntent, topProvider: any) {
    if (!topProvider) return null;
    
    let hoursEstimate = intent.urgency === 'high' ? 2 : 4;
    let cost = hoursEstimate * topProvider.hourly_rate;

    return {
      provider: topProvider,
      suggestion_note: `Based on your request, ${topProvider.display_name} is the best match in ${intent.location || 'your area'}. Highly rated (${topProvider.avg_rating} ⭐) with a trust score of ${topProvider.trust_score}.`,
      estimated_price: cost,
      estimated_hours: hoursEstimate
    };
  }
};
