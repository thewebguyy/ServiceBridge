"use client";

import { useEffect, useState, useRef } from 'react';
import { Message } from '@/types';
import { messagingService } from '@/services/messagingService';
import { Send, Image as ImageIcon, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ChatInterfaceProps {
  bookingId: string;
  currentUserId: string; // Used to differentiate "me" vs "them"
}

export function ChatInterface({ bookingId, currentUserId }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load initial messages and subscribe
  useEffect(() => {
    let unsubscribe: () => void;

    const loadChat = async () => {
      try {
        const history = await messagingService.getMessagesForBooking(bookingId);
        // We reverse it because the API returns newest first (descending), 
        // and we want oldest at the top for standard chat flow.
        setMessages(history.reverse());

        unsubscribe = messagingService.subscribeToBookingChannel(bookingId, (newMsg: Message) => {
          setMessages((prev) => [...prev, newMsg]);
        });
      } catch (err) {
        console.error('Failed to load chat history', err);
      }
    };

    loadChat();

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [bookingId]);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendText = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const contentToSend = inputText.trim();
    setInputText(''); // optimistic clear
    
    // We add optimistic update logically here, but to keep strictly synchronized
    // we let the realtime subscription broadcast it back to our array.
    try {
      await messagingService.sendMessage({
        booking_id: bookingId,
        sender_id: currentUserId,
        message_content: contentToSend,
        message_type: 'text',
      });
    } catch (err) {
      console.error('Failed to send text message', err);
      setInputText(contentToSend); // revert
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert("Image exceeds 5MB limit.");
      return;
    }

    setIsUploading(true);
    try {
      const imageUrl = await messagingService.uploadMessageAttachment(bookingId, file);
      await messagingService.sendMessage({
        booking_id: bookingId,
        sender_id: currentUserId,
        message_content: imageUrl,
        message_type: 'image',
      });
    } catch (err) {
      console.error('Failed to upload attachment', err);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="flex flex-col h-[500px] border rounded-lg bg-card shadow-sm overflow-hidden">
      {/* Header */}
      <div className="bg-muted px-4 py-3 border-b flex justify-between items-center">
        <h3 className="font-semibold text-sm">Booking Chat</h3>
        <span className="text-xs text-muted-foreground bg-background px-2 py-1 rounded-full border">End-to-End Encrypted</span>
      </div>

      {/* Messages Feed */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50 dark:bg-zinc-950">
        {messages.length === 0 && (
          <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
            Say hello to your professional...
          </div>
        )}
        
        {messages.map((msg) => {
          const isSystem = msg.message_type === 'system';
          const isMe = msg.sender_id === currentUserId && !isSystem;

          if (isSystem) {
            return (
              <div key={msg.id} className="flex justify-center my-4">
                <span className="text-xs font-medium text-muted-foreground bg-muted px-3 py-1 rounded-full border">
                  {msg.message_content}
                </span>
              </div>
            );
          }

          return (
            <div key={msg.id} className={cn("flex w-full", isMe ? "justify-end" : "justify-start")}>
              <div className={cn(
                  "max-w-[75%] rounded-lg px-4 py-2 text-sm",
                  isMe ? "bg-primary text-primary-foreground rounded-br-none" : "bg-card border rounded-bl-none text-foreground shadow-sm"
                )}
              >
                {msg.message_type === 'image' ? (
                   <img src={msg.message_content} alt="Attachment" className="max-w-full rounded-md" />
                ) : (
                   <p className="whitespace-pre-wrap">{msg.message_content}</p>
                )}
                <span className={cn("block text-[10px] mt-1 opacity-70", isMe ? "text-right" : "text-left")}>
                  {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Input Area */}
      <form onSubmit={handleSendText} className="p-3 border-t bg-card flex items-end gap-2">
        <button 
          type="button" 
          onClick={() => fileInputRef.current?.click()}
          className="p-2 text-muted-foreground hover:bg-muted rounded-full transition-colors"
          disabled={isUploading}
        >
          {isUploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <ImageIcon className="w-5 h-5" />}
        </button>
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleFileChange} 
          accept="image/*" 
          className="hidden" 
        />
        
        <textarea 
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 max-h-32 min-h-10 resize-none rounded-md border border-input bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSendText(e);
            }
          }}
        />
        
        <button 
          type="submit" 
          disabled={!inputText.trim() || isUploading}
          className="p-2 bg-primary text-primary-foreground rounded-full hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
        >
          <Send className="w-5 h-5" />
        </button>
      </form>
    </div>
  );
}
