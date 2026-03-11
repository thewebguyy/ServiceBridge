import { BarChart, Users, DollarSign, Activity, FileText } from 'lucide-react';

export default async function AdminAnalyticsDashboard() {
  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8 mt-6">
      <div className="flex justify-between items-center mb-8 border-b pb-4">
         <h1 className="text-3xl font-bold flex items-center">
           <BarChart className="w-8 h-8 mr-3 text-primary" />
           Platform Observability
         </h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
         <div className="bg-card border rounded-lg p-5 shadow-sm space-y-3">
             <div className="flex justify-between text-muted-foreground"><Users className="w-5 h-5"/> <span>Total Users</span></div>
             <p className="text-3xl font-bold tracking-tight">12,492</p>
             <p className="text-xs text-green-600 font-semibold">+8% this month</p>
         </div>
         <div className="bg-card border rounded-lg p-5 shadow-sm space-y-3">
             <div className="flex justify-between text-muted-foreground"><Activity className="w-5 h-5"/> <span>Active Bookings</span></div>
             <p className="text-3xl font-bold tracking-tight">431</p>
             <p className="text-xs text-green-600 font-semibold">+2% this week</p>
         </div>
         <div className="bg-card border rounded-lg p-5 shadow-sm space-y-3">
             <div className="flex justify-between text-muted-foreground"><DollarSign className="w-5 h-5"/> <span>Escrow Volume (NGN)</span></div>
             <p className="text-3xl font-bold tracking-tight">₦9.4M</p>
             <p className="text-xs text-green-600 font-semibold">+14% this month</p>
         </div>
         <div className="bg-card border rounded-lg p-5 shadow-sm space-y-3">
             <div className="flex justify-between text-muted-foreground"><FileText className="w-5 h-5"/> <span>Open Disputes</span></div>
             <p className="text-3xl font-bold tracking-tight text-red-600">3</p>
             <p className="text-xs text-red-500 font-semibold">Action required</p>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-card border rounded-lg shadow-sm p-6 line-chart-mockup h-80 flex items-center justify-center">
           {/* E.g. Recharts Integration */}
           <p className="text-muted-foreground text-sm font-semibold">PostHog Funnel Metrics Loading...</p>
        </div>
        <div className="bg-card border rounded-lg shadow-sm p-6 line-chart-mockup h-80 flex items-center justify-center">
           <p className="text-muted-foreground text-sm font-semibold">Conversion Rate / Dropoff Analysis Loading...</p>
        </div>
      </div>
    </div>
  );
}
