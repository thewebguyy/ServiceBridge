import { currentUser } from '@clerk/nextjs/server';
import { bookingService } from '@/services/bookingService';
import { MapPin, Phone, MessageSquare, CheckCircle, XCircle } from 'lucide-react';

export default async function ProviderJobsPage() {
  const user = await currentUser();
  
  // Real implementation maps to DB uuid
  const providerId = 'mock-provider-uuid';

  let activeJobs = [];
  try {
    activeJobs = await bookingService.getProviderJobs(providerId);
  } catch (error) {}

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8">
      <h1 className="text-3xl font-bold mb-8">Job Management</h1>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
         <div className="lg:col-span-3 space-y-6">
            <h2 className="text-xl font-semibold border-b pb-2">Pending Requests</h2>
            
            {activeJobs.length === 0 ? (
               <div className="bg-card border border-dashed rounded-lg p-12 text-center shadow-sm">
                  <p className="text-muted-foreground font-medium mb-4">No incoming job requests at this time.</p>
               </div>
            ) : (
               <div className="space-y-4">
                  {/* Map through pending jobs here */}
               </div>
            )}

            <h2 className="text-xl font-semibold border-b pb-2 mt-8">Active & Escalated Jobs</h2>
            <div className="bg-card border border-dashed rounded-lg p-12 text-center shadow-sm">
                  <p className="text-muted-foreground font-medium mb-4">You have no active jobs.</p>
            </div>
         </div>

         <div className="space-y-6">
            <div className="bg-card border rounded-lg p-5 shadow-sm space-y-3 text-sm">
               <h3 className="font-semibold text-lg border-b pb-2">Summary</h3>
               <div className="flex justify-between items-center text-yellow-600">
                  <span>Pending Action</span>
                  <span className="font-bold text-lg">0</span>
               </div>
               <div className="flex justify-between items-center text-blue-600">
                  <span>In Progress</span>
                  <span className="font-bold text-lg">0</span>
               </div>
               <div className="flex justify-between items-center text-green-600 mt-4 border-t pt-2">
                  <span>Completed (All Time)</span>
                  <span className="font-bold text-lg">0</span>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
}
