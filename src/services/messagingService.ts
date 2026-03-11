import { createClient } from '@/lib/supabase/client';
import { Message, MessageType } from '@/types';

type SendMessageParams = Omit<Message, 'id' | 'created_at'>;

export const messagingService = {
  /**
   * Send a Text or Image Message
   */
  async sendMessage(params: SendMessageParams): Promise<Message> {
    const supabase = createClient();
    
    // Safety check: ensure booking_id exists
    if (!params.booking_id) throw new Error('Booking ID is required to send a message');

    const { data, error } = await supabase
      .from('messages')
      .insert({
        booking_id: params.booking_id,
        sender_id: params.sender_id,
        message_content: params.message_content,
        message_type: params.message_type
      })
      .select('*, users(name)')
      .single();

    if (error) throw error;
    
    // We would trigger a notification hook here for Phase 7
    return data as Message;
  },

  /**
   * Automated System Messaging (Invoked during Booking Lifecycle state changes)
   */
  async sendSystemMessage(bookingId: string, content: string): Promise<Message> {
    return this.sendMessage({
      booking_id: bookingId,
      message_content: content,
      message_type: 'system',
      // sender_id is intentionally blank for system broadcasts
    });
  },

  /**
   * Fetch paginated history
   */
  async getMessagesForBooking(bookingId: string, page = 1, limit = 50): Promise<Message[]> {
    const supabase = createClient();
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const { data, error } = await supabase
      .from('messages')
      .select('*, users(name)')
      .eq('booking_id', bookingId)
      .order('created_at', { ascending: false }) // typically fetched descending, then reversed in UI
      .range(from, to);

    if (error) throw error;
    return data as Message[];
  },

  /**
   * Subscribe to Supabase Realtime Channel exclusively bound to this booking
   */
  subscribeToBookingChannel(bookingId: string, callback: (payload: any) => void) {
    const supabase = createClient();
    
    // Create dedicated channel unique to this booking's chat
    const channel = supabase.channel(`booking:${bookingId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `booking_id=eq.${bookingId}`
        },
        (payload) => {
          callback(payload.new);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  },

  /**
   * Attachments via Supabase Storage
   */
  async uploadMessageAttachment(bookingId: string, file: File): Promise<string> {
    const supabase = createClient();
    const fileExt = file.name.split('.').pop();
    const fileName = `${bookingId}/${Math.random().toString(36).substring(2)}.${fileExt}`;

    const { data, error } = await supabase.storage
      .from('chat-attachments')
      .upload(fileName, file, { cacheControl: '3600' });

    if (error) throw error;

    // Use signed URLs for privacy or pass the path.
    // Given the requirement is secure access policies, we should create a signed URL logically,
    // or public URLs if the bucket isn't tightly locked per file.
    // For simplicity, we create a temporary signed URL valid for 1 year, or just store the path
    // and let the UI request signed URLs. Here we create an initial signed URL to embed.
    const { data: signData, error: signError } = await supabase.storage
      .from('chat-attachments')
      .createSignedUrl(fileName, 60 * 60 * 24 * 365); // 1 year

    if (signError || !signData) throw new Error('Signed URL creation failed');
    return signData.signedUrl;
  }
};
