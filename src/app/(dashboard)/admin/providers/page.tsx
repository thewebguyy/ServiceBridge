import { ShieldAlert, UserCheck, AlertTriangle } from 'lucide-react';

export default async function AdminProvidersVerificationPage() {
  // Real implementation will fetch pending providers from DB using Admin Auth.
  const pendingProviders = [
    { id: 'mock-1', name: 'John Doe', category: 'Plumber', documents: ['/doc1.pdf'], requested_at: '2026-03-10' }
  ];

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8 mt-6">
      <div className="flex justify-between items-center mb-8 border-b pb-4">
         <h1 className="text-3xl font-bold flex items-center">
           <UserCheck className="w-8 h-8 mr-3 text-primary" />
           Provider Verification Queue
         </h1>
      </div>

      <div className="bg-card border rounded-lg overflow-hidden shadow-sm">
         <table className="w-full text-sm text-left">
           <thead className="bg-muted text-muted-foreground uppercase">
             <tr>
               <th className="px-6 py-4">Provider Name</th>
               <th className="px-6 py-4">Service Category</th>
               <th className="px-6 py-4">Documents Provided</th>
               <th className="px-6 py-4">Requested At</th>
               <th className="px-6 py-4 text-right">Actions</th>
             </tr>
           </thead>
           <tbody>
             {pendingProviders.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">
                    No pending verifications. All providers processed.
                  </td>
                </tr>
             ) : (
                pendingProviders.map(p => (
                  <tr key={p.id} className="border-t hover:bg-muted/50 transition">
                    <td className="px-6 py-4 font-medium">{p.name}</td>
                    <td className="px-6 py-4">{p.category}</td>
                    <td className="px-6 py-4">
                       <a href="#" className="font-semibold text-primary underline">{p.documents.length} File(s)</a>
                    </td>
                    <td className="px-6 py-4">{new Date(p.requested_at).toLocaleDateString()}</td>
                    <td className="px-6 py-4 text-right space-x-2">
                       <button className="px-3 py-1 bg-green-50 text-green-700 border border-green-200 rounded text-xs font-semibold hover:bg-green-100">
                         Approve
                       </button>
                       <button className="px-3 py-1 bg-red-50 text-red-700 border border-red-200 rounded text-xs font-semibold hover:bg-red-100">
                         Reject
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
