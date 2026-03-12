import { ClerkProvider } from '@clerk/nextjs';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { PostHogProvider } from '@/providers/PostHogProvider';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://servicebridge.com'),
  title: {
    default: 'ServiceBridge | Hire Verified Trusted Professionals',
    template: '%s | ServiceBridge',
  },
  description: 'AI-assisted marketplace for hiring skilled professionals securely using Escrow protections and real-time chat workflows.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={inter.className}>
           <PostHogProvider>
             {children}
           </PostHogProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
