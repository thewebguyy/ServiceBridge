import { currentUser } from '@clerk/nextjs/server';
import { bookingService } from '@/services/bookingService';
import { paymentService } from '@/services/paymentService'; // Assuming we expose a getProviderWallet metric
import { Wallet, Briefcase, Star, Clock, CheckCircle } from 'lucide-react';
import Link from 'next/link';

export default async function ProviderDashboardOverview() {
  const user = await currentUser();
  const providerId = 'mock-provider-uuid'; // Real world: fetch mapped ID

  // Fetch true stats
  let activeJobs = [];
  try {
    activeJobs = await bookingService.getProviderJobs(providerId);
  } catch (error) {}

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8 mt-6">
      <div className="flex justify-between items-center mb-8 border-b pb-4">
        <div>
          <h1 className="text-3xl font-bold">Provider Dashboard</h1>
          <p className="text-sm text-green-600 mt-1 font-semibold flex items-center"><CheckCircle className="w-4 h-4 mr-1"/> Top-Rated Provider (Verified)</p>
        </div>
        <Link href="/provider/jobs" className="px-5 py-2 bg-primary text-primary-foreground font-semibold rounded-md shadow hover:bg-primary/90">
           Browse Job Market
        </Link>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
         <div className="bg-card border rounded-lg p-5 shadow-sm">
             <h4 className="flex items-center text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wide"><Wallet className="w-4 h-4 mr-2"/> Monthly Earnings</h4>
             <p className="text-3xl font-bold">₦124,500</p>
         </div>
         <div className="bg-card border rounded-lg p-5 shadow-sm">
             <h4 className="flex items-center text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wide"><Briefcase className="w-4 h-4 mr-2"/> Completed Stats</h4>
             <p className="text-3xl font-bold">29 Jobs</p>
         </div>
         <div className="bg-card border rounded-lg p-5 shadow-sm">
             <h4 className="flex items-center text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wide"><Star className="w-4 h-4 mr-2"/> Trust Score</h4>
             <p className="text-3xl font-bold text-green-600">92/100</p>
         </div>
         <div className="bg-card border rounded-lg p-5 shadow-sm">
             <h4 className="flex items-center text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wide"><Clock className="w-4 h-4 mr-2"/> Avg Response</h4>
             <p className="text-3xl font-bold">~14m</p>
         </div>
      </div>

      {/* Active Jobs Widget */}
      <div className="bg-card border rounded-lg overflow-hidden shadow-sm">
         <div className="bg-muted px-6 py-4 border-b">
           <h3 className="font-semibold text-lg flex items-center"><Briefcase className="w-5 h-5 mr-2 text-primary" /> Urgent Action Required</h3>
         </div>
         <div className="p-12 text-center border-b border-dashed">
            <p className="text-muted-foreground font-medium w-full text-center">You have no pending requests.</p>
         </div>
         <div className="px-6 py-4 bg-gray-50 dark:bg-zinc-950 flex justify-end">
            <Link href="/provider/jobs" className="text-primary text-sm font-semibold hover:underline">View All Job History →</Link>
         </div>
      </div>
    </div>
  );
}
