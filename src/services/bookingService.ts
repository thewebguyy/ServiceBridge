import { createClient } from '@/lib/supabase/client';
import { Booking, BookingStatus } from '@/types';
import { messagingService } from '@/services/messagingService';

const supabase = createClient();

type CreateBookingParams = Omit<Booking, 'id' | 'status' | 'created_at' | 'updated_at'>;

export const bookingService = {
  /**
   * Helper: Validate State Transition
   */
  _validateTransition(currentStatus: BookingStatus, newStatus: BookingStatus): boolean {
    const validTransitions: Record<BookingStatus, BookingStatus[]> = {
      'PENDING': ['ACCEPTED', 'DECLINED', 'CANCELLED'],
      'ACCEPTED': ['IN_PROGRESS', 'CANCELLED'],
      'IN_PROGRESS': ['COMPLETED', 'DISPUTED'],
      'COMPLETED': ['PAID', 'DISPUTED'],
      'PAID': [],
      'DECLINED': [],
      'CANCELLED': [],
      'DISPUTED': ['RESOLVED'],
      'RESOLVED': ['PAID']
    };
    return validTransitions[currentStatus]?.includes(newStatus) ?? false;
  },

  /**
   * Helper: Update Status securely
   */
  async _updateBookingStatus(bookingId: string, currentStatus: BookingStatus, newStatus: BookingStatus): Promise<Booking> {
    if (!this._validateTransition(currentStatus, newStatus)) {
      throw new Error(`Invalid state transition from ${currentStatus} to ${newStatus}`);
    }

    const { data, error } = await supabase
      .from('bookings')
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq('id', bookingId)
      // Check the current status in DB to prevent race conditions
      .eq('status', currentStatus)
      .select('*')
      .single();

    if (error) throw error;
    if (!data) throw new Error('Booking status could not be updated. It may have already changed.');

    // Notification Event Dispatch (Simulated for future implementation)
    // await this._dispatchNotificationEvent(data, `booking_${newStatus.toLowerCase()}`);

    return data as Booking;
  },

  /**
   * Customer: Creates a initial booking
   */
  async createBooking(params: CreateBookingParams): Promise<Booking> {
    const { data, error } = await supabase
      .from('bookings')
      .insert({ ...params, status: 'PENDING' })
      .select('*')
      .single();

    if (error) throw error;
    
    // Notification simulate
    // await this._dispatchNotificationEvent(data, 'booking_created');
    
    return data as Booking;
  },

  /**
   * Provider: Accepts an incoming PENDING job
   */
  async acceptBooking(bookingId: string, currentStatus: BookingStatus = 'PENDING'): Promise<Booking> {
    const updated = await this._updateBookingStatus(bookingId, currentStatus, 'ACCEPTED');
    await messagingService.sendSystemMessage(bookingId, 'Provider accepted the booking. Please complete the payment to proceed.');
    return updated;
  },

  /**
   * Provider: Declines an incoming PENDING job
   */
  async declineBooking(bookingId: string, currentStatus: BookingStatus = 'PENDING'): Promise<Booking> {
    const updated = await this._updateBookingStatus(bookingId, currentStatus, 'DECLINED');
    await messagingService.sendSystemMessage(bookingId, 'Provider declined the booking.');
    return updated;
  },

  /**
   * Provider: Starts an ACCEPTED job (Checks Escrow Funding first)
   */
  async startJob(bookingId: string, currentStatus: BookingStatus = 'ACCEPTED'): Promise<Booking> {
    const { data: booking, error: fetchErr } = await supabase
      .from('bookings')
      .select('*, payments!left(payment_status)')
      .eq('id', bookingId)
      .single();
    
    if (fetchErr || !booking) throw new Error('Booking not found');
    const payment = booking.payments && booking.payments[0];

    // Escrow Protection Rule
    if (!payment || payment.payment_status !== 'successful') {
      throw new Error('Cannot start job. Customer has not funded the escrow account yet.');
    }

    const updated = await this._updateBookingStatus(bookingId, currentStatus, 'IN_PROGRESS');
    await messagingService.sendSystemMessage(bookingId, 'Job has started. The provider is now working.');
    return updated;
  },

  /**
   * Provider: Completes an IN_PROGRESS job
   */
  async completeJob(bookingId: string, currentStatus: BookingStatus = 'IN_PROGRESS'): Promise<Booking> {
    const updated = await this._updateBookingStatus(bookingId, currentStatus, 'COMPLETED');
    
    // We do NOT instantly release funds here to give users a window to DISPUTE.
    // In a fully automated system, this would either await a customer 'Confirm Complete'
    // or run via a cron job 48-hours post 'COMPLETED'.
    
    await messagingService.sendSystemMessage(bookingId, 'Job has been marked complete. Escrow release pending.');
    return updated;
  },

  /**
   * Customer/Provider: Cancels a PENDING or ACCEPTED job
   */
  async cancelBooking(bookingId: string, currentStatus: BookingStatus): Promise<Booking> {
    if (currentStatus !== 'PENDING' && currentStatus !== 'ACCEPTED') {
      throw new Error('Can only cancel a pending or accepted booking.');
    }
    const updated = await this._updateBookingStatus(bookingId, currentStatus, 'CANCELLED');
    await messagingService.sendSystemMessage(bookingId, 'This booking was cancelled.');
    return updated;
  },

  // Queries for Dashboards

  async getCustomerBookings(customerId: string) {
    const { data, error } = await supabase
      .from('bookings')
      .select('*, providers!inner(display_name, hourly_rate)')
      .eq('customer_id', customerId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  async getProviderJobs(providerId: string) {
    const { data, error } = await supabase
      .from('bookings')
      .select('*, users!inner(name, phone, location)')
      .eq('provider_id', providerId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }
};
