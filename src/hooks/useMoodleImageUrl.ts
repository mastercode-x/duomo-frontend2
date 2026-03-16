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

    // user/icon es público — usar directamente sin proxy ni token
    if (imageUrl.includes('/user/icon/')) {
      return imageUrl;
    }

    // Resto de URLs de Moodle → proxy con token
    const params = new URLSearchParams({ url: imageUrl });
    if (token) params.set('token', token);
    return `/api/image-proxy?${params.toString()}`;
  }, [imageUrl, token]);
}

export default useMoodleImageUrl;