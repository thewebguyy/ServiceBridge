"use client";

import { useState } from 'react';
import { Search, Loader2, Sparkles } from 'lucide-react';

export function SmartSearchAssistant() {
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<any>(null);

  const handleSmartSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setIsLoading(true);
    setAiAnalysis(null);

    // Simulated API call wrapping aiMatchingService on the server edge route
    try {
      const resp = await fetch('/api/intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: query })
      });
      
      if (!resp.ok) throw new Error('AI Service failed');
      
      const data = await resp.json();
      setAiAnalysis(data);
    } catch (error) {
      console.error(error);
      setAiAnalysis({ error: "Booking assistant is currently unavailable." });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-2xl text-left bg-gradient-to-r from-primary/10 via-background to-primary/5 p-6 rounded-2xl border mb-10 shadow-sm relative overflow-hidden">
       {/* Background Decoration */}
       <Sparkles className="absolute -top-4 -right-4 w-24 h-24 text-primary opacity-[0.03] rotate-12" />

       <h2 className="text-xl font-bold flex items-center mb-3">
         <Sparkles className="w-5 h-5 mr-2 text-primary fill-primary/30" />
         AI Booking Assistant
       </h2>
       <p className="text-sm text-muted-foreground mb-4">
         Describe what you need in plain English. I'll find the perfect provider and calculate an estimate.
       </p>

       <form onSubmit={handleSmartSearch} className="flex gap-2 relative z-10">
         <div className="relative flex-1">
           <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
           <input 
             type="text" 
             value={query}
             onChange={(e) => setQuery(e.target.value)}
             placeholder="e.g. I need a plumber in Lekki to fix a leaking pipe this weekend..." 
             className="w-full pl-10 pr-4 py-3 rounded-xl border border-input bg-card shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-shadow"
             disabled={isLoading}
           />
         </div>
         <button 
           type="submit" 
           disabled={isLoading || !query.trim()}
           className="px-6 py-3 bg-primary text-primary-foreground font-semibold rounded-xl flex items-center shadow-md disabled:opacity-50 transition-colors"
         >
           {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Find Match'}
         </button>
       </form>

       {/* AI Results Dropdown Area */}
       {aiAnalysis && !aiAnalysis.error && (
         <div className="mt-6 p-4 bg-background border rounded-lg shadow-inner text-sm space-y-4 animate-in fade-in slide-in-from-top-4 duration-300">
            <div>
               <h4 className="font-semibold text-muted-foreground uppercase text-[10px] tracking-wider mb-2">Parsed Intent</h4>
               <div className="flex gap-2 flex-wrap">
                 {aiAnalysis.intent.service_category && <span className="px-2 py-1 bg-muted rounded border text-xs">{aiAnalysis.intent.service_category}</span>}
                 {aiAnalysis.intent.location && <span className="px-2 py-1 bg-muted rounded border text-xs">📍 {aiAnalysis.intent.location}</span>}
                 <span className="px-2 py-1 bg-red-50 text-red-700 border border-red-200 rounded text-xs capitalize">{aiAnalysis.intent.urgency} Urgency</span>
               </div>
               <p className="mt-3 text-muted-foreground">{aiAnalysis.intent.reasoning}</p>
            </div>

            {aiAnalysis.suggestion && (
               <div className="pt-4 border-t">
                 <h4 className="font-semibold text-muted-foreground uppercase text-[10px] tracking-wider mb-3 flex items-center">
                   <Sparkles className="w-3 h-3 mr-1 text-yellow-500 fill-yellow-500"/>
                   Top Recommended Provider
                 </h4>
                 
                 <div className="flex items-center justify-between bg-card p-3 rounded-lg border shadow-sm">
                   <div className="flex items-center">
                     <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center font-bold text-primary mr-3">
                       {aiAnalysis.suggestion.provider.display_name.charAt(0)}
                     </div>
                     <div>
                       <span className="font-semibold block">{aiAnalysis.suggestion.provider.display_name}</span>
                       <span className="text-xs text-muted-foreground block">₦{aiAnalysis.suggestion.provider.hourly_rate} / hr • {aiAnalysis.suggestion.provider.avg_rating} ⭐</span>
                     </div>
                   </div>
                   <div className="text-right">
                     <span className="block text-xs text-muted-foreground">Est. Cost</span>
                     <span className="font-bold text-primary">₦{aiAnalysis.suggestion.estimated_price.toLocaleString()}</span>
                   </div>
                 </div>

                 <p className="text-xs text-muted-foreground italic mt-3">"{aiAnalysis.suggestion.suggestion_note}"</p>
                 
                 <a href={`/providers/${aiAnalysis.suggestion.provider.id}`} className="block mt-4 w-full text-center px-4 py-2 bg-primary text-primary-foreground rounded shadow font-medium hover:bg-primary/90">
                   View Profile & Book
                 </a>
               </div>
            )}
         </div>
       )}
    </div>
  );
}
