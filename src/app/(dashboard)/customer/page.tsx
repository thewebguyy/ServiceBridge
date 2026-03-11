import { currentUser } from '@clerk/nextjs/server';

export default async function CustomerDashboard() {
  const user = await currentUser();

  return (
    <div className="p-10">
      <h1 className="text-2xl font-bold">Customer Dashboard</h1>
      <p>Welcome back, {user?.firstName || 'Customer'}</p>
      
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 border rounded-lg shadow-sm">
          <h2 className="font-semibold text-lg">Active Bookings</h2>
          <p className="text-muted-foreground mt-2">No active bookings yet.</p>
        </div>
        <div className="p-6 border rounded-lg shadow-sm">
          <h2 className="font-semibold text-lg">Saved Providers</h2>
          <p className="text-muted-foreground mt-2">You haven't saved anyone yet.</p>
        </div>
        <div className="p-6 border rounded-lg shadow-sm">
          <h2 className="font-semibold text-lg">AI Matchmaker</h2>
          <p className="text-muted-foreground mt-2">Describe what you need fixed...</p>
        </div>
      </div>
    </div>
  );
}
