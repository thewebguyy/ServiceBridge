import { createClient } from '@/lib/supabase/client';
import { Review, Dispute } from '@/types';
import { paymentService } from './paymentService';

export const trustService = {
  /**
   * Submits a customer review, aggregates scores, and transitions booking to PAID.
   */
  async submitReview(bookingId: string, rating: number, reviewText: string): Promise<Review> {
    const supabase = createClient();
    
    // 1. Fetch Booking and Verify State
    const { data: booking, error: fetchErr } = await supabase
      .from('bookings')
      .select('*')
      .eq('id', bookingId)
      .single();

    if (fetchErr || !booking) throw new Error('Booking not found');
    if (booking.status !== 'COMPLETED') throw new Error('Reviews can only be submitted for completed jobs.');

    // 2. Insert Review Transactionally (Unique Constraint prevents multi-reviews)
    const { data: review, error: reviewErr } = await supabase
      .from('reviews')
      .insert({
        booking_id: bookingId,
        customer_id: booking.customer_id,
        provider_id: booking.provider_id,
        rating,
        review_text: reviewText || null
      })
      .select('*')
      .single();

    if (reviewErr) {
      if (reviewErr.code === '23505') throw new Error('A review already exists for this booking.');
      throw reviewErr;
    }

    // 3. Aggregate Rating Logic Server-Side
    const { data: currentStats } = await supabase
      .from('providers')
      .select('avg_rating, total_reviews')
      .eq('id', booking.provider_id)
      .single();

    const oldTotal = currentStats?.total_reviews || 0;
    const oldAvg = currentStats?.avg_rating || 0;
    
    const newTotal = oldTotal + 1;
    const newAvg = ((oldAvg * oldTotal) + rating) / newTotal;

    // 4. Update Provider's Rating/Stats and Recalculate Trust Score
    await supabase.from('providers').update({
      avg_rating: Number(newAvg.toFixed(1)),
      total_reviews: newTotal,
      completed_jobs: oldTotal + 1 // Assumed 1:1 job complete if reviewing
    }).eq('id', booking.provider_id);
    
    // Recalculate Trust Score asynchronously
    await this.calculateProviderTrustScore(booking.provider_id);

    // 5. Customer Confirmation triggers Escrow Eligible state transition
    await supabase.from('bookings').update({ status: 'PAID', updated_at: new Date().toISOString() }).eq('id', bookingId);
    
    // Fire Disbursement via Payment Service safely
    try {
      await paymentService.releaseEscrow(bookingId);
    } catch (err) {
      console.error('Escrow release failed during review submission, admin manual trigger required', err);
    }

    return review as Review;
  },

  /**
   * Calculates a holistic trust metric for Discovery Ranking.
   * Algorithm: 
   * Starts at 0, max 100.
   * Rating weight: 50%
   * Verification status: +20 points
   * Completed Jobs: +30 points (Maxes out at 50 jobs)
   * Response Time Penalty: -0.5 points per minute above 60 mins.
   */
  async calculateProviderTrustScore(providerId: string): Promise<number> {
    const supabase = createClient();
    const { data: p } = await supabase.from('providers').select('*').eq('id', providerId).single();
    if (!p) return 0;

    let score = 0;

    // 1. Rating contribution (50 pts total)
    const ratingScore = ((p.avg_rating || 0) / 5) * 50;
    score += ratingScore;

    // 2. Verification Bonus (20 pts)
    if (p.verification_status === 'verified') score += 20;

    // 3. Experience Scale (30 pts max)
    const expScore = Math.min((p.completed_jobs || 0) * (30 / 50), 30);
    score += expScore;

    // 4. Sluggishness Penalty
    if (p.response_time && p.response_time > 60) {
      const penalty = (p.response_time - 60) * 0.5;
      score = Math.max(score - penalty, 0);
    }

    // Format safely between 0-100
    score = Number(Math.max(Math.min(score, 100), 0).toFixed(2));

    await supabase.from('providers').update({ trust_score: score }).eq('id', providerId);
    return score;
  },

  /**
   * Customer initiates a conflict freezing payment workflows
   */
  async openDispute(bookingId: string, reason: string, description: string): Promise<Dispute> {
    const supabase = createClient();
    
    // Ensure booking exists and is COMPLETED not PAID
    const { data: booking, error: fetchErr } = await supabase.from('bookings').select('*').eq('id', bookingId).single();
    if (fetchErr || !booking) throw new Error('Booking not found');
    if (booking.status !== 'COMPLETED' && booking.status !== 'IN_PROGRESS') {
       throw new Error(`Cannot open dispute on an actively ${booking.status} job.`);
    }

    // 1. Log Dispute
    const { data: dispute, error } = await supabase.from('disputes').insert({
      booking_id: bookingId,
      customer_id: booking.customer_id,
      provider_id: booking.provider_id,
      dispute_reason: reason,
      dispute_description: description,
      status: 'open'
    }).select('*').single();

    if (error) throw error;

    // 2. Lock the Booking State Machine to DISPUTED to freeze operations
    await supabase.from('bookings').update({ status: 'DISPUTED', updated_at: new Date().toISOString() }).eq('id', bookingId);
    
    return dispute as Dispute;
  },

  /**
   * Supabase Admin Edge resolving mechanism. (Runs on protected /admin API wrappers)
   */
  async _adminResolveDispute(disputeId: string, adminResolution: 'refund_customer' | 'release_payment' | 'partial_resolution', notes: string) {
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY! // Bypass RLS for admin workflows
    );

    const { data: dispute } = await supabaseAdmin.from('disputes').select('booking_id').eq('id', disputeId).single();
    if (!dispute) throw new Error('Dispute missing');

    // Resolve the ticket
    await supabaseAdmin.from('disputes').update({
      status: 'resolved',
      resolution_notes: `${adminResolution}: ${notes}`,
      resolved_at: new Date().toISOString()
    }).eq('id', disputeId);

    // Unjam the state machine
    if (adminResolution === 'release_payment') {
      await supabaseAdmin.from('bookings').update({ status: 'PAID' }).eq('id', dispute.booking_id);
      await paymentService.releaseEscrow(dispute.booking_id);
    } else {
      // Custom refund integration hooks here.
      await supabaseAdmin.from('bookings').update({ status: 'RESOLVED' }).eq('id', dispute.booking_id);
    }
    
    return { status: 'Dispute closed' };
  }
};
