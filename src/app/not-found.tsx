"use client";

import { SearchX, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50/50 p-4">
      <div className="max-w-md w-full text-center animate-in fade-in slide-in-from-bottom-8 duration-500">
        <div className="w-24 h-24 bg-muted border rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
          <SearchX className="w-10 h-10 text-muted-foreground" />
        </div>
        <h1 className="text-3xl font-bold mb-2 tracking-tight text-foreground">Page Not Found</h1>
        <p className="text-muted-foreground mb-8 text-lg">
          We couldn't locate the directory or file you were searching for. It may have been moved.
        </p>
        <Link
          href="/"
          className="inline-flex items-center px-6 py-3 bg-primary text-primary-foreground font-semibold rounded-lg shadow-md hover:bg-primary/90 transition-all"
        >
          <ArrowLeft className="w-4 h-4 mr-2" /> Return to Homepage
        </Link>
      </div>
    </div>
  );
}
