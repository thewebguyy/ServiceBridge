import { Star, MapPin, Clock, MessageCircle, FileText } from 'lucide-react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

export default async function PublicProviderProfile({ params }: { params: { providerId: string } }) {
  const providerId = params.providerId;
  const supabase = createClient();
  
  // Real implementation would fetch this. Mocked for phase definition
  const { data: provider, error } = await supabase
    .from('providers')
    .select('*, users!inner(name)')
    .eq('id', providerId)
    .single();

  if (error || !provider) {
    return <div className="p-8 text-center text-muted-foreground">Provider not found or not verified.</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8 mt-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between border-b pb-8">
        <div className="flex items-center space-x-6">
           <div className="w-24 h-24 bg-muted border rounded-full flex items-center justify-center text-3xl font-bold shadow-sm">
             {provider.display_name?.charAt(0) || 'P'}
           </div>
           <div>
             <h1 className="text-3xl font-bold tracking-tight">{provider.display_name}</h1>
             <p className="text-muted-foreground mt-1 text-lg">{provider.category}</p>
             <div className="flex items-center space-x-4 mt-3 text-sm font-medium">
               <span className="flex items-center text-yellow-500 fill-yellow-500"><Star className="w-4 h-4 mr-1"/> {provider.avg_rating} / 5</span>
               <span className="flex items-center"><MapPin className="w-4 h-4 mr-1 text-muted-foreground"/> {provider.service_area}</span>
             </div>
           </div>
        </div>
        <div className="mt-6 md:mt-0 flex flex-col space-y-3">
          <Link href={`/customer/dashboard?book=${providerId}`} className="px-6 py-3 bg-primary text-primary-foreground rounded-lg font-bold hover:bg-primary/90 shadow-lg text-center">
            Book Service (₦{provider.hourly_rate}/hr)
          </Link>
          <button className="px-6 py-2 border rounded-lg font-medium hover:bg-muted text-center flex justify-center items-center">
             <MessageCircle className="w-4 h-4 mr-2" /> Message Provider
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8">
        {/* About */}
        <div className="md:col-span-2 space-y-6">
          <section>
            <h2 className="text-2xl font-bold mb-4 flex items-center"><FileText className="w-5 h-5 mr-2"/> About</h2>
            <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">{provider.bio || 'This provider has not added a biography yet.'}</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">Portfolio</h2>
            {provider.portfolio_images && provider.portfolio_images.length > 0 ? (
               <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {provider.portfolio_images.map((url: string, idx: number) => (
                    <img key={idx} src={url} alt={`Portfolio ${idx+1}`} className="aspect-square object-cover rounded-md border shadow-sm" />
                  ))}
               </div>
            ) : (
               <div className="bg-muted border border-dashed rounded-lg p-8 text-center text-muted-foreground">
                 No portfolio images uploaded.
               </div>
            )}
          </section>
        </div>

        {/* Stats Side */}
        <div className="space-y-6">
           <div className="bg-card border rounded-lg p-5 shadow-sm space-y-4">
              <h3 className="font-semibold text-lg border-b pb-2">Statistics</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Jobs Completed</span>
                  <span className="font-bold">{provider.completed_jobs}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Response Time</span>
                  <span className="font-bold flex items-center"><Clock className="w-4 h-4 mr-1 text-blue-500"/> ~{provider.response_time || 30} mins</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Hourly Rate</span>
                  <span className="font-bold">₦{provider.hourly_rate}</span>
                </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
