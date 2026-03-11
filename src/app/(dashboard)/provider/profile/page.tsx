import { currentUser } from '@clerk/nextjs/server';
import { Star, MapPin, Wrench, Clock, CheckCircle } from 'lucide-react';

export default async function ProviderProfilePage() {
  const user = await currentUser();

  // Mock data representing a fetched provider profile
  const isVerified = false;

  return (
    <div className="max-w-5xl mx-auto p-8 mt-6">
      <div className="flex flex-col md:flex-row items-start md:items-center space-y-4 md:space-y-0 md:space-x-6 border-b pb-8">
        <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center text-3xl font-bold shadow-sm">
          {user?.firstName?.charAt(0) || 'P'}
        </div>
        <div className="flex-1">
          <div className="flex items-center space-x-3">
            <h1 className="text-3xl font-bold tracking-tight">{user?.firstName} {user?.lastName}</h1>
            {isVerified ? (
               <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-800">
                 <CheckCircle className="w-3 h-3 mr-1" /> Verified
               </span>
            ) : (
               <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800">
                 Pending Verification
               </span>
            )}
          </div>
          <p className="text-muted-foreground mt-2 max-w-2xl">
            Professional tradesperson with over 10 years of experience delivering high-quality residential repairs.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8">
        {/* Sidebar Info */}
        <div className="space-y-6">
          <div className="bg-card border rounded-lg p-5 shadow-sm space-y-4">
            <h2 className="font-semibold text-lg flex items-center"><Wrench className="w-4 h-4 mr-2" /> Service Details</h2>
            <div className="space-y-3 text-sm">
              <div>
                <span className="text-muted-foreground block text-xs uppercase tracking-wider">Categories</span>
                <p className="font-medium">Plumbing, General Handyman</p>
              </div>
              <div>
                <span className="text-muted-foreground block text-xs uppercase tracking-wider flex items-center"><MapPin className="w-3 h-3 mr-1"/> Area of Operations</span>
                <p className="font-medium">Lagos Radius (20km)</p>
              </div>
              <div>
                <span className="text-muted-foreground block text-xs uppercase tracking-wider flex items-center"><Clock className="w-3 h-3 mr-1"/> Base Rate</span>
                <p className="font-medium">₦ 15,000 / hr</p>
              </div>
            </div>
          </div>
          
          <div className="bg-card border rounded-lg p-5 shadow-sm space-y-4">
             <h2 className="font-semibold text-lg flex items-center"><Star className="w-4 h-4 mr-2" /> Reputation</h2>
             <div className="flex items-end space-x-2">
               <span className="text-4xl font-bold">0.0</span>
               <span className="text-sm text-muted-foreground mb-1">/ 5.0 (0 reviews)</span>
             </div>
             <p className="text-sm text-muted-foreground">Jobs completed: 0</p>
          </div>
        </div>

        {/* Main Content (Portfolio) */}
        <div className="md:col-span-2 space-y-6">
          <h2 className="text-2xl font-bold">Portfolio</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {/* Empty States */}
            <div className="aspect-square bg-muted border border-dashed rounded-lg flex items-center justify-center text-muted-foreground">Image 1</div>
            <div className="aspect-square bg-muted border border-dashed rounded-lg flex items-center justify-center text-muted-foreground">Image 2</div>
            <div className="aspect-square bg-muted border border-dashed rounded-lg flex items-center justify-center text-muted-foreground hover:bg-accent cursor-pointer transition-colors">+ Add More</div>
          </div>
        </div>
      </div>
    </div>
  );
}
