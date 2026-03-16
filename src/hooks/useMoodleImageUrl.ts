import { useMemo } from 'react';

export function useMoodleImageUrl(imageUrl: string | undefined): string | undefined {
  return useMemo(() => {
    if (!imageUrl) return undefined;
    if (!imageUrl.includes('campus.duomo.com.ar')) return imageUrl;
    // Todas las URLs de Moodle por el proxy (que las limpia server-side)
    return `/api/image-proxy?url=${encodeURIComponent(imageUrl)}`;
  }, [imageUrl]);
}

export default useMoodleImageUrl;