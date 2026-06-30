export function getImageUrl(url?: string | null) {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  if (url.startsWith('blob:')) return url; // Allow local preview blob URLs
  
  // Fallback to NEXT_PUBLIC_API_URL if NEXT_PUBLIC_API_BASE_URL isn't explicitly set
  const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || 
                  (process.env.NEXT_PUBLIC_API_URL ? process.env.NEXT_PUBLIC_API_URL.replace(/\/api$/, '') : 'http://localhost:5000');
  
  // Remove any trailing slash from the base url
  const cleanBase = apiBase.replace(/\/$/, '');
  
  return `${cleanBase}${url.startsWith('/') ? '' : '/'}${url}`;
}
