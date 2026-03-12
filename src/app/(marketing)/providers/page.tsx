import { providerService } from '@/services/providerService';
import { Star, MapPin } from 'lucide-react';
import Link from 'next/link';
import { SmartSearchAssistant } from '@/components/features/SmartSearchAssistant';

export default async function ProvidersDiscoveryPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; location?: string }>;
}) {
  const { category, location } = await searchParams;

  // Let's assume we fetch top rated if no filters
  let providers: any[] = [];
  try {
    if (category) {
      const res = await providerService.getProvidersByCategory(category);
      providers = res.data;
    } else if (location) {
      const res = await providerService.getProvidersByLocation(location);
      providers = res.data;
    } else {
      providers = await providerService.getTopRatedProviders(20);
    }
  } catch (err) {
    console.error('Error fetching providers', err);
  }

  return (
    <div className="max-w-7xl mx-auto p-8 mt-10">
      <SmartSearchAssistant />

      <h1 className="text-3xl font-bold tracking-tight mb-6 mt-12">Browse Professionals</h1>

      {/* Basic Filters Mockup */}
      <div className="bg-card w-full border p-4 rounded-lg flex gap-4 mb-8 shadow-sm">
        <input 
          type="text" 
          placeholder="Service Category (e.g. Plumber)" 
          className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm"
          defaultValue={category}
        />
        <input 
          type="text" 
          placeholder="Location (e.g. Lagos)" 
          className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm"
          defaultValue={location}
        />
        <button className="px-6 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium">
          Search
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {providers.map((provider: any) => (
          <div key={provider.id} className="border rounded-lg p-5 shadow-sm bg-card hover:shadow-md transition-shadow">
             <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center text-xl font-bold mb-4">
               {provider.display_name?.charAt(0) || 'P'}
             </div>
             <h3 className="font-semibold text-lg">{provider.display_name}</h3>
             <p className="text-sm text-muted-foreground">{provider.category}</p>
             
             <div className="mt-4 flex flex-col space-y-2 text-sm text-muted-foreground">
               <span className="flex items-center"><MapPin className="w-4 h-4 mr-1"/> {provider.service_area || 'Global'}</span>
               <span className="flex items-center"><Star className="w-4 h-4 mr-1 text-yellow-500 fill-yellow-500"/> {provider.avg_rating} ({provider.total_reviews} reviews)</span>
               <span className="font-medium text-foreground">₦{provider.hourly_rate} / hr</span>
             </div>

             <Link href={`/providers/${provider.id}`} className="mt-6 w-full flex justify-center px-4 py-2 border rounded-md text-sm font-medium hover:bg-muted">
               View Profile
             </Link>
          </div>
        ))}
        {providers.length === 0 && (
          <p className="col-span-full text-center text-muted-foreground">No providers found matching your criteria.</p>
        )}
      </div>
    </div>
  );
}
