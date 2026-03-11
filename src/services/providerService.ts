import { createClient } from '@/lib/supabase/client';
import { Provider } from '@/types';

const supabase = createClient();

export const providerService = {
  /**
   * Discovery: Find providers by category
   * Utilizes the GIN index on service_categories
   */
  async getProvidersByCategory(category: string, limit = 20, page = 1) {
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const { data, error, count } = await supabase
      .from('providers')
      .select('*, users!inner(name, location)', { count: 'exact' })
      .contains('service_categories', [category])
      .eq('verification_status', 'verified')
      .range(from, to)
      .order('avg_rating', { ascending: false });

    if (error) throw error;
    return { data: data as Provider[], count };
  },

  /**
   * Discovery: Filter providers by exact geographic location
   */
  async getProvidersByLocation(location: string, limit = 20, page = 1) {
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const { data, error, count } = await supabase
      .from('providers')
      .select('*, users!inner(name, location)', { count: 'exact' })
      .eq('service_area', location)
      .eq('verification_status', 'verified')
      .range(from, to)
      .order('avg_rating', { ascending: false });

    if (error) throw error;
    return { data: data as Provider[], count };
  },

  /**
   * Discovery: Get top-rated providers globally
   */
  async getTopRatedProviders(limit = 10) {
    const { data, error } = await supabase
      .from('providers')
      .select('*, users!inner(name)')
      .eq('verification_status', 'verified')
      .order('avg_rating', { ascending: false })
      .order('total_reviews', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data as Provider[];
  },

  /**
   * Discovery: Get fastest responding providers globally
   */
  async getFastestRespondingProviders(limit = 10) {
    const { data, error } = await supabase
      .from('providers')
      .select('*, users!inner(name)')
      .eq('verification_status', 'verified')
      .not('response_time', 'is', null)
      .order('response_time', { ascending: true })
      .limit(limit);

    if (error) throw error;
    return data as Provider[];
  },

  /**
   * Storage: Upload Portfolio Image (Max 10 images enforced via UI prior to this call)
   */
  async uploadPortfolioImage(providerId: string, file: File): Promise<string> {
    const fileExt = file.name.split('.').pop();
    const fileName = `${providerId}/${Math.random().toString(36).substring(2)}.${fileExt}`;

    const { data, error } = await supabase.storage
      .from('portfolio-images')
      .upload(fileName, file, { 
        upsert: false,
        cacheControl: '3600'
      });

    if (error) throw error;

    const { data: { publicUrl } } = supabase.storage
      .from('portfolio-images')
      .getPublicUrl(fileName);

    return publicUrl;
  }
};
