import { Scale, Lock, RefreshCcw } from 'lucide-react';

export default async function AdminDisputesPage() {
  // Real implementation fetches from `disputes` where status != resolved
  const activeDisputes = [
    { id: '123-abc', bookingId: 'booking-xyz', customerName: 'Alice', providerName: 'Bob the Plumber', reason: 'Unfinished Work', status: 'open', escrow: '₦24,000' }
  ];

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8 mt-6">
      <div className="flex justify-between items-center mb-8 border-b pb-4">
         <h1 className="text-3xl font-bold flex items-center">
           <Scale className="w-8 h-8 mr-3 text-red-600" />
           Trust & Safety: Disputes
         </h1>
      </div>

      <div className="bg-card border rounded-lg overflow-hidden shadow-sm">
         <table className="w-full text-sm text-left">
           <thead className="bg-muted text-muted-foreground uppercase">
             <tr>
               <th className="px-6 py-4">Dispute ID</th>
               <th className="px-6 py-4">Parties</th>
               <th className="px-6 py-4">Escrow Locked</th>
               <th className="px-6 py-4">Reported Issue</th>
               <th className="px-6 py-4">Status</th>
               <th className="px-6 py-4 text-right">Moderation</th>
             </tr>
           </thead>
           <tbody>
             {activeDisputes.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">
                    Escrow is flowing cleanly. Top-tier trust metrics detected.
                  </td>
                </tr>
             ) : (
                activeDisputes.map(d => (
                  <tr key={d.id} className="border-t hover:bg-muted/50 transition">
                    <td className="px-6 py-4 font-mono text-xs text-muted-foreground">{d.id}</td>
                    <td className="px-6 py-4 flex flex-col">
                       <span className="font-semibold">{d.customerName} (C)</span>
                       <span className="text-muted-foreground text-xs mt-1">vs. {d.providerName} (P)</span>
                    </td>
                    <td className="px-6 py-4 font-semibold text-orange-600 flex items-center">
                       <Lock className="w-3 h-3 mr-1" /> {d.escrow}
                    </td>
                    <td className="px-6 py-4">{d.reason}</td>
                    <td className="px-6 py-4">
                       <span className="px-2 py-1 bg-red-100 text-red-800 text-[10px] font-bold uppercase rounded-full tracking-wider">
                         {d.status}
                       </span>
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                       <button className="px-3 py-1 bg-primary text-primary-foreground rounded text-xs font-semibold shadow-sm hover:bg-primary/90">
                         Investigate Chat
                       </button>
                    </td>
                  </tr>
                ))
             )}
           </tbody>
         </table>
      </div>
    </div>
  );
}
