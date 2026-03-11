import { createClient } from '@/lib/supabase/client';
import { PaymentStatus, Payment } from '@/types';

// In Server Components/Actions, we'll instantiate our own headers.
const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY as string;

export const paymentService = {
  /**
   * Initialize Escobar (Escrow) Payment Link for Customer
   */
  async initializePayment(bookingId: string, customerEmail: string, amount: number) {
    // 1. Hit Paystack API to generate checkout link
    const response = await fetch('https://api.paystack.co/transaction/initialize', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: customerEmail,
        amount: amount * 100, // Kobo
        metadata: { booking_id: bookingId },
        callback_url: `${process.env.NEXT_PUBLIC_APP_URL}/customer/dashboard`,
      }),
    });

    const data = await response.json();
    if (!data.status) throw new Error(data.message);

    // 2. We do NOT create the payment record here. We wait for the webhook,
    // or we create it as 'initialized' to track intent.
    const supabase = createClient();
    const { data: booking } = await supabase.from('bookings').select('customer_id, provider_id').eq('id', bookingId).single();

    if (booking) {
      await supabase.from('payments').insert({
        booking_id: bookingId,
        customer_id: booking.customer_id,
        provider_id: booking.provider_id,
        amount: amount,
        paystack_reference: data.data.reference,
        payment_status: 'initialized',
      });
    }

    return data.data.authorization_url; // Send user here
  },

  /**
   * Verify Payment (Server-Side verification, bypasses client entirely)
   */
  async verifyPayment(reference: string) {
    const response = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET}`,
      },
    });
    
    const data = await response.json();
    return data;
  },

  /**
   * Creates a Paystack Transfer Recipient for the Provider
   */
  async createTransferRecipient(name: string, accountNumber: string, bankCode: string) {
    const response = await fetch('https://api.paystack.co/transferrecipient', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type: 'nuban',
        name,
        account_number: accountNumber,
        bank_code: bankCode,
        currency: 'NGN',
      }),
    });

    const data = await response.json();
    if (!data.status) throw new Error('Failed to create transfer recipient');
    return data.data.recipient_code;
  },

  /**
   * Disburse Escrow Funds to Provider via Paystack Transfer API
   */
  async releaseEscrow(bookingId: string) {
    const supabase = createClient();

    // 1. Validate Booking is COMPLETED and Escrow not already released
    const { data: booking, error } = await supabase
      .from('bookings')
      .select('*, providers(paystack_recipient_code), payments!inner(amount, paystack_reference)')
      .eq('id', bookingId)
      .single();

    if (error || !booking) throw new Error('Booking not found');
    if (booking.status !== 'COMPLETED') throw new Error('Booking must be COMPLETED to release funds');
    if (booking.escrow_released) throw new Error('Funds have already been released');
    
    const recipientCode = (booking.providers as any)?.paystack_recipient_code;
    const payment = (booking.payments as any)[0]; // Since 1 payment per booking in this model
    
    if (!recipientCode) throw new Error('Provider has no payout configuration');

    // 2. Deduct Platform Fee (e.g., 10%)
    const payoutAmount = Math.floor(payment.amount * 0.90 * 100);

    // 3. Initiate Transfer
    const transferResponse = await fetch('https://api.paystack.co/transfer', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        source: 'balance',
        amount: payoutAmount,
        recipient: recipientCode,
        reason: `ServiceBridge Payout - Booking ${bookingId}`,
        reference: `escrow_${payment.paystack_reference}_${Date.now()}` // Unique deduplication
      }),
    });

    const transferData = await transferResponse.json();
    if (!transferData.status) throw new Error(`Transfer failed: ${transferData.message}`);

    // 4. Temporarily mark escrow as released pending Transfer Webhook success
    await supabase.from('bookings').update({ escrow_released: true }).eq('id', bookingId);
    
    return transferData.data;
  }
};
