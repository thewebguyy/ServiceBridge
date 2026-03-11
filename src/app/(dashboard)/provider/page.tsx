import { currentUser } from '@clerk/nextjs/server';

export default async function ProviderDashboard() {
  const user = await currentUser();

  return (
    <div className="p-10">
      <h1 className="text-2xl font-bold">Provider Dashboard</h1>
      <p>Welcome to your business center, {user?.firstName || 'Provider'}</p>
      
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 border rounded-lg shadow-sm">
          <h2 className="font-semibold text-lg">New Requests</h2>
          <p className="text-muted-foreground mt-2">0 pending job requests.</p>
        </div>
        <div className="p-6 border rounded-lg shadow-sm">
          <h2 className="font-semibold text-lg">Earnings (Escrow)</h2>
          <p className="text-muted-foreground mt-2">₦0.00 available.</p>
        </div>
        <div className="p-6 border rounded-lg shadow-sm">
          <h2 className="font-semibold text-lg">Profile Status</h2>
          <span className="inline-flex items-center px-2 py-1 mt-2 text-xs font-medium rounded bg-yellow-100 text-yellow-800">
            Unverified
          </span>
        </div>
      </div>
    </div>
  );
}
