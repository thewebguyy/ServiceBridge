import { currentUser } from '@clerk/nextjs/server';
import { bookingService } from '@/services/bookingService';
import Link from 'next/link';

export default async function CustomerDashboardPage() {
  const user = await currentUser();
  const clerkId = user?.id || '';

  // Real world: we'd map clerkId to the users table internal UUID first.
  const customerId = 'mock-customer-uuid'; 

  let activeBookings = [];
  try {
    // This will fetch from DB, ignoring errors for mockup view purpose
    activeBookings = await bookingService.getCustomerBookings(customerId);
  } catch (error) {}

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8">
      <div className="flex justify-between items-center mb-8">
         <h1 className="text-3xl font-bold">My Dashboard</h1>
         <Link href="/providers" className="px-4 py-2 border rounded-md text-sm font-medium hover:bg-muted shadow-sm">
           Find a Professional
         </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
         <div className="lg:col-span-3 space-y-6">
            <h2 className="text-xl font-semibold border-b pb-2">Active Service Requests</h2>
            
            {activeBookings.length === 0 ? (
               <div className="bg-card border border-dashed rounded-lg p-12 text-center shadow-sm">
                  <p className="text-muted-foreground font-medium mb-4">You have no active bookings.</p>
                  <Link href="/providers" className="px-6 py-2 bg-primary text-primary-foreground rounded-md text-sm font-semibold shadow-sm hover:bg-primary/90">
                    Book a Service Today
                  </Link>
               </div>
            ) : (
               <div className="space-y-4">
                  {/* Bookings mapped here in reality */}
               </div>
            )}
         </div>

         <div className="space-y-6">
            <div className="bg-card border rounded-lg p-5 shadow-sm space-y-3 text-sm">
               <h3 className="font-semibold text-lg border-b pb-2">Summary</h3>
               <div className="flex justify-between">
                  <span className="text-muted-foreground">Ongoing Jobs</span>
                  <span className="font-bold">0</span>
               </div>
               <div className="flex justify-between">
                  <span className="text-muted-foreground">Completed</span>
                  <span className="font-bold">0</span>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
}
