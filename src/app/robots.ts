import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://servicebridge.com';

  return {
    rules: {
      userAgent: '*',
      allow: ['/', '/providers'],
      disallow: ['/admin/', '/customer/', '/provider/', '/api/'],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
