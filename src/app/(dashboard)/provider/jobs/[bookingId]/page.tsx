import { ChatInterface } from '@/components/features/ChatInterface';
import { currentUser } from '@clerk/nextjs/server';

export default async function ProviderJobDetailsPage({ params }: { params: Promise<{ bookingId: string }> }) {
  const { bookingId } = await params;
  const user = await currentUser();
  const currentUserId = user?.id || 'mock-provider-uuid'; // Mapped to our providers table ID

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8 mt-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Job Management</h1>
        <div className="space-x-2">
           <button className="px-4 py-2 border border-primary text-primary rounded-md text-sm font-medium hover:bg-muted shadow-sm">
             Update Status
           </button>
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
             <h3 className="font-semibold border-b pb-2">Customer Details</h3>
             <ul className="space-y-2 text-sm text-muted-foreground">
               <li className="flex justify-between">
                 <span>Location</span>
                 <span className="font-medium text-foreground">Lagos</span>
               </li>
               <li className="flex justify-between mt-2 pt-2 border-t">
                 <span>Escrow</span>
                 <span className="font-medium text-green-600">Funded</span>
               </li>
               <li className="flex justify-between">
                 <span>Est Payout</span>
                 <span className="font-medium text-foreground">₦13,500</span>
               </li>
             </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
