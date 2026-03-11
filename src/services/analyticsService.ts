import posthog from 'posthog-js';

// Environment variable safety
const POSTHOG_KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY || '';
const POSTHOG_HOST = process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://app.posthog.com';

export const analyticsService = {
  /**
   * Initialize PostHog (Must be called in the root layout or provider for client-side tracking)
   */
  init() {
    if (typeof window !== 'undefined' && POSTHOG_KEY) {
      posthog.init(POSTHOG_KEY, {
        api_host: POSTHOG_HOST,
        capture_pageview: false, // We handle this manually in Next.js 13/14+ App Router
        autocapture: false, // We prefer explicit telemetry for ServiceBridge
      });
    }
  },

  /**
   * Identify a user to tie operations back to their customer/provider profiles
   */
  identifyUser(clerkId: string, email: string, role: string) {
    if (typeof window !== 'undefined' && POSTHOG_KEY) {
      posthog.identify(clerkId, {
        email: email,
        role: role, // 'customer', 'provider', 'admin'
      });
    }
  },

  /**
   * Tracks a specific lifecycle event with attached metadata.
   */
  trackEvent(eventName: string, properties: Record<string, any> = {}) {
    if (typeof window !== 'undefined' && POSTHOG_KEY) {
      posthog.capture(eventName, {
        ...properties,
        timestamp: new Date().toISOString()
      });
    }
  },

  /**
   * Funnel Tracking: Standardizes the booking lifecycle path markers
   */
  trackBookingFunnel(stage: 'search' | 'provider_view' | 'booking_created' | 'payment_successful' | 'booking_started' | 'booking_completed', properties: Record<string, any> = {}) {
    this.trackEvent(`funnel_${stage}`, properties);
  },

  /**
   * Error Telemetry: Safely logs execution or state-machine failures
   */
  trackError(context: string, errorMsg: string, properties: Record<string, any> = {}) {
    this.trackEvent('system_error', {
      context,
      error_message: errorMsg,
      ...properties
    });
  }
};
