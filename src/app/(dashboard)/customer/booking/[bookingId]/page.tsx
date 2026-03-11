import { ChatInterface } from '@/components/features/ChatInterface';
import { currentUser } from '@clerk/nextjs/server';

export default async function CustomerBookingPage({ params }: { params: { bookingId: string } }) {
  const user = await currentUser();
  const currentUserId = user?.id || 'mock-customer-uuid'; // Mapped to our users table ID

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8 mt-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Booking Details</h1>
        <div className="space-x-2">
           <a href={`/customer/booking/${params.bookingId}/payment`} className="px-4 py-2 border border-primary text-primary rounded-md text-sm font-medium hover:bg-muted shadow-sm">
             Open Payment Escrow
           </a>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Chat Section */}
        <div className="md:col-span-2">
           <ChatInterface bookingId={params.bookingId} currentUserId={currentUserId} />
        </div>

        {/* Info Sidebar */}
        <div className="space-y-6">
          <div className="bg-card border rounded-lg p-5 shadow-sm space-y-4">
             <h3 className="font-semibold border-b pb-2">Status tracker</h3>
             <ul className="space-y-3 text-sm text-muted-foreground">
               <li className="flex items-center text-primary font-medium">
                 <span className="w-2 h-2 rounded-full bg-primary mr-2"></span> Provider Accepted
               </li>
               <li className="flex items-center">
                 <span className="w-2 h-2 rounded-full bg-border mr-2"></span> Customer Paid (Escrow)
               </li>
               <li className="flex items-center">
                 <span className="w-2 h-2 rounded-full bg-border mr-2"></span> Job In Progress
               </li>
             </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
