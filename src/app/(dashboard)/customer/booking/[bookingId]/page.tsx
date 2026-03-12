import { ChatInterface } from '@/components/features/ChatInterface';
import { currentUser } from '@clerk/nextjs/server';
import { Lock, AlertTriangle, CheckCircle, ShieldCheck } from 'lucide-react';
import Link from 'next/link';

export default async function CustomerBookingPage({ params }: { params: Promise<{ bookingId: string }> }) {
  const { bookingId } = await params;
  const user = await currentUser();
  const currentUserId = user?.id || 'mock-customer-uuid'; // Mapped to our users table ID

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8 mt-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center mb-1">
            Job Details <span className="ml-3 px-3 py-1 bg-green-100 text-green-800 text-xs font-bold rounded-full uppercase tracking-widest">In Progress</span>
          </h1>
          <p className="text-muted-foreground text-sm flex items-center">
            <Lock className="w-4 h-4 mr-1 text-green-600"/> Escrow Funded - Protected by ServiceBridge
          </p>
        </div>
        
        <div className="space-x-3 flex items-center">
           <a href={`/customer/booking/${bookingId}/payment`} className="px-5 py-2 border border-primary text-primary bg-primary/5 rounded-md font-semibold font-medium hover:bg-primary/10 shadow-sm transition-colors cursor-pointer">
             View Payment Receipt
           </a>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Chat Section */}
        <div className="md:col-span-2">
           <ChatInterface bookingId={bookingId} currentUserId={currentUserId} />
        </div>

        {/* Info Sidebar */}
        <div className="space-y-6">
          <div className="bg-card border rounded-lg p-5 shadow-sm space-y-4">
             <h3 className="font-semibold border-b pb-2 flex items-center uppercase tracking-wide text-xs text-muted-foreground">
                <CheckCircle className="w-4 h-4 mr-2 text-primary" /> Lifecycle Status
             </h3>
             <ul className="space-y-4 text-sm font-medium">
               <li className="flex items-center text-foreground">
                 <span className="w-2.5 h-2.5 rounded-full bg-green-500 mr-3 shadow-[0_0_8px_rgba(34,197,94,0.6)]"></span> Provider Accepted
               </li>
               <li className="flex items-center text-foreground">
                 <span className="w-2.5 h-2.5 rounded-full bg-green-500 mr-3 shadow-[0_0_8px_rgba(34,197,94,0.6)]"></span> Escrow Secured
               </li>
               <li className="flex items-center text-primary border border-primary/20 bg-primary/5 p-2 rounded-md">
                 <span className="w-2.5 h-2.5 rounded-full bg-primary mr-3 animate-pulse"></span> Job Started
               </li>
               <li className="flex items-center text-muted-foreground/50 opacity-50 pl-2">
                 <span className="w-2.5 h-2.5 rounded-full bg-border mr-3"></span> Sign Off & Review
               </li>
             </ul>
          </div>
          
          <div className="bg-card border rounded-lg p-5 shadow-sm text-center">
             <ShieldCheck className="w-10 h-10 text-primary mx-auto mb-3" />
             <h4 className="font-bold text-sm mb-2">Platform Protection</h4>
             <p className="text-xs text-muted-foreground leading-relaxed">
               Funds will only be released exactly when you confirm you are completely satisfied with the work.
             </p>
             <button className="mt-5 w-full py-2 bg-red-50 text-red-600 border border-red-200 text-xs font-bold rounded-md hover:bg-red-100 flex items-center justify-center transition-colors">
               <AlertTriangle className="w-3 h-3 mr-2" /> Open Dispute
             </button>
          </div>
        </div>
      </div>
    </div>
  );
}
