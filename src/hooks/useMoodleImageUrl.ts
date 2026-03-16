// hooks/useMoodleImageUrl.ts
// Pasa las URLs de Moodle por el proxy incluyendo el token como param separado.

import { useMemo } from 'react';
import { useAuth } from '@/context/AuthContext';

export function useMoodleImageUrl(imageUrl: string | undefined): string | undefined {
  const { token } = useAuth();

  return useMemo(() => {
    if (!imageUrl) return undefined;

    if (
      !imageUrl.includes('campus.duomo.com.ar') ||
      imageUrl.startsWith('data:') ||
      imageUrl.startsWith('blob:')
    ) {
      return imageUrl;
    }

    // Pasar URL + token al proxy
    const params = new URLSearchParams({ url: imageUrl });
    if (token) params.set('token', token);

    return `/api/image-proxy?${params.toString()}`;
  }, [imageUrl, token]);
}

export default useMoodleImageUrl;