"use client";

import { useEffect } from "react";
import { AlertTriangle, Home } from "lucide-react";
import { analyticsService } from "@/services/analyticsService";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Safely pipe runtime errors to telemetry for admin visibility
    analyticsService.trackError('global_boundary', error.message, { digest: error.digest });
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50/50 p-4">
      <div className="max-w-md w-full bg-card border rounded-2xl shadow-sm p-8 text-center animate-in fade-in zoom-in duration-300">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <AlertTriangle className="w-8 h-8 text-red-600" />
        </div>
        <h1 className="text-2xl font-bold mb-3 tracking-tight">Something went wrong</h1>
        <p className="text-muted-foreground text-sm mb-8 leading-relaxed">
          We experienced an unexpected error. Our engineering team has been automatically notified. 
          Please try again or return to the dashboard.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-3">
          <button
            onClick={() => reset()}
            className="px-6 py-2 bg-primary text-primary-foreground font-semibold rounded-lg shadow-sm hover:opacity-90 transition-opacity"
          >
            Try Again
          </button>
          <a
            href="/"
            className="px-6 py-2 border bg-card text-foreground font-semibold rounded-lg hover:bg-muted transition-colors flex items-center justify-center"
          >
            <Home className="w-4 h-4 mr-2" /> Go Home
          </a>
        </div>
      </div>
    </div>
  );
}
