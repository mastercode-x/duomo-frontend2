// hooks/useMoodleImageUrl.ts
import { useMemo } from 'react';
import { useAuth } from '@/context/AuthContext';

export function useMoodleImageUrl(imageUrl: string | undefined): string | undefined {
  const { token } = useAuth();

  return useMemo(() => {
    if (!imageUrl) return undefined;

    // URLs públicas — sin proxy, sin transformación
    if (
      imageUrl.includes('gravatar.com') ||
      imageUrl.includes('/user/icon/') ||   // ← avatares públicos de Moodle
      imageUrl.startsWith('data:') ||
      imageUrl.startsWith('blob:') ||
      imageUrl.startsWith('/')
    ) {
      return imageUrl;
    }

    // Imágenes privadas de Moodle (overviewfiles, etc.) → proxy
    if (imageUrl.includes('campus.duomo.com.ar')) {
      let urlWithToken = imageUrl;
      if (imageUrl.includes('/pluginfile.php') && !imageUrl.includes('token=') && token) {
        const sep = imageUrl.includes('?') ? '&' : '?';
        urlWithToken = `${imageUrl}${sep}token=${encodeURIComponent(token)}`;
      }
      return `/api/image-proxy?url=${encodeURIComponent(urlWithToken)}`;
    }

    return imageUrl;
  }, [imageUrl, token]);
}

export default useMoodleImageUrl;