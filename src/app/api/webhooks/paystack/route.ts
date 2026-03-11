import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';

// Required for raw body parsing in some setups to verify signatures, but Next.js standard JSON is often enough if we use standard headers.
export async function POST(req: Request) {
  try {
    const bodyText = await req.text();
    const headers = req.headers;
    const signature = headers.get('x-paystack-signature');

    // 1. Verify Paystack Signature
    const hash = crypto
        .createHmac('sha512', process.env.PAYSTACK_SECRET_KEY as string)
        .update(bodyText)
        .digest('hex');

    if (hash !== signature) {
      return NextResponse.json({ error: 'Unauthorized signature' }, { status: 401 });
    }

    const event = JSON.parse(bodyText);

    // We MUST use the Service Role key here to bypass RLS since webhooks run on the server unauthenticated.
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // 2. Handle Charge Success (Customer Paid into Escrow)
    if (event.event === 'charge.success') {
      const reference = event.data.reference;
      const bookingId = event.data.metadata?.booking_id;

      if (!bookingId) return NextResponse.json({ status: 'ignored - missing metadata' });

      // Update the payment record securely
      const { data: payment, error: updateError } = await supabaseAdmin
        .from('payments')
        .update({ payment_status: 'successful' })
        .eq('paystack_reference', reference)
        .select('*')
        .single();

      if (updateError || !payment) {
        console.error('Webhook error processing payment update', updateError);
        return NextResponse.json({ error: 'Failed to update payment' }, { status: 500 });
      }

      // Link payment to booking
      await supabaseAdmin
        .from('bookings')
        .update({ payment_id: payment.id })
        .eq('id', bookingId);
        
      return NextResponse.json({ status: 'Charge success handled' });
    }

    // 3. Handle Transfer Success (Escrow Payout to Provider Cleared)
    if (event.event === 'transfer.success') {
      const reference = event.data.reference;
      // Extract original payment reference if structured as escrow_{original}_timestamp
      const paymentRef = reference.split('_')[1];

      // We can update the provider dashboard notification / billing history here
      return NextResponse.json({ status: 'Transfer success handled' });
    }
    
    // 4. Handle Transfer Failed (Escrow Payout failed)
    if (event.event === 'transfer.failed' || event.event === 'transfer.reversed') {
      // Revert escrow_released flag so admin can retry
      const reference = event.data.reference;
      // Requires custom logic to map transfer reference back to booking
    }

    return NextResponse.json({ status: 'Event ignored' });
    
  } catch (error) {
    console.error('Webhook processing failed:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
