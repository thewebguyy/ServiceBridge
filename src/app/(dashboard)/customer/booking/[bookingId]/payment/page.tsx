import { currentUser } from '@clerk/nextjs/server';
import { createClient } from '@/lib/supabase/client';
import { paymentService } from '@/services/paymentService';
import { Lock, ShieldCheck, CheckCircle } from 'lucide-react';

export default async function PaymentPage({ params }: { params: Promise<{ bookingId: string }> }) {
  const { bookingId } = await params;
  const user = await currentUser();
  const customerId = user?.id || 'mock-customer-uuid';
  const supabase = createClient();

  // Retrieve Booking details
  const { data: booking, error } = await supabase
    .from('bookings')
    .select('*, providers!inner(display_name), payments(payment_status, paystack_reference)')
    .eq('id', bookingId)
    .single();

  if (error || !booking) {
    return <div className="p-12 text-center text-red-500 font-bold">Booking not found or unavailable for payment.</div>;
  }

  // Safety Check: We only allow payment on 'ACCEPTED' bookings
  if (booking.status !== 'ACCEPTED') {
    return (
      <div className="max-w-xl mx-auto p-12 mt-12 text-center border rounded-lg bg-card shadow-sm">
        <h2 className="text-xl font-bold mb-4">Payment Unavailable</h2>
        <p className="text-muted-foreground">This booking is currently <span className="font-semibold">{booking.status}</span>. You can only make payments when a provider has accepted your request.</p>
        <a href="/customer/dashboard" className="inline-block mt-6 px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium">Return to Dashboard</a>
      </div>
    );
  }

  const existingPayment = booking.payments[0];

  // If already paid, show success
  if (existingPayment?.payment_status === 'successful') {
    return (
      <div className="max-w-xl mx-auto p-12 mt-12 text-center border rounded-lg bg-card shadow-sm border-green-200 bg-green-50/10">
        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
        <h2 className="text-xl font-bold mb-2">Payment Secured</h2>
        <p className="text-muted-foreground">Your funds are safely held in escrow. The provider can now begin the job.</p>
        <p className="text-xs text-muted-foreground mt-4">Ref: {existingPayment.paystack_reference}</p>
        <a href="/customer/dashboard" className="inline-block mt-6 px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90">Go to Dashboard</a>
      </div>
    );
  }

  // Server Action to initialize Paystack checkout securely
  async function handleCheckout() {
    'use server';
    const email = user?.emailAddresses[0]?.emailAddress;
    if (!email) throw new Error('User email required');

    const paymentUrl = await paymentService.initializePayment(bookingId, email, booking.estimated_price);
    // In next 15 we'd use `redirect(paymentUrl)`, but returning string for simplicity across layouts
    return paymentUrl;
  }

  return (
    <div className="max-w-3xl mx-auto p-4 md:p-8 mt-6">
      <h1 className="text-3xl font-bold mb-8">Secure Payment Checkout</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="bg-card border rounded-lg p-6 shadow-sm">
             <h2 className="text-lg font-bold border-b pb-3 mb-4">Job Summary</h2>
             <div className="space-y-3 text-sm">
               <div className="flex justify-between">
                 <span className="text-muted-foreground">Provider</span>
                 <span className="font-medium">{(booking.providers as any).display_name}</span>
               </div>
               <div className="flex justify-between">
                 <span className="text-muted-foreground">Service</span>
                 <span className="font-medium">{booking.service_category}</span>
               </div>
               <div className="flex justify-between">
                 <span className="text-muted-foreground">Location</span>
                 <span className="font-medium">{booking.location}</span>
               </div>
             </div>
             <div className="mt-6 pt-4 border-t flex justify-between items-center text-xl font-bold">
               <span>Total Due</span>
               <span>₦{booking.estimated_price.toLocaleString()}</span>
             </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-card border rounded-lg p-6 shadow-sm flex flex-col items-center text-center">
             <ShieldCheck className="w-12 h-12 text-primary mb-4" />
             <h3 className="font-bold text-lg mb-2">Escrow Protection</h3>
             <p className="text-sm text-muted-foreground mb-6">
               Your money is held safely by ServiceBridge and will only be released to the provider once you confirm the job is <b>COMPLETED</b>.
             </p>
             
             {/* Note: This is a simplfied form wrapper for Server Actions in a RSC layer */}
             <form action={async () => {
               "use server";
               const url = await handleCheckout();
               // We utilize Next.js redirect to jump client securely over to Paystack
               const { redirect } = await import('next/navigation');
               redirect(url);
             }} className="w-full">
               <button type="submit" className="w-full px-6 py-4 bg-primary text-primary-foreground rounded-lg font-bold shadow-md hover:bg-primary/90 flex items-center justify-center">
                 <Lock className="w-4 h-4 mr-2" /> Pay securely with Paystack
               </button>
             </form>
             <p className="text-xs text-muted-foreground mt-4">Secured by PCIDSS Grade encryption.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
