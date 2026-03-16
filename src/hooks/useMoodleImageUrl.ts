// hooks/useMoodleImageUrl.ts
// Redirige URLs de imágenes de Moodle a través del proxy /api/image-proxy
// para evitar el CORS/Referer blocking del servidor Moodle.

import { useMemo } from 'react';
import { useAuth } from '@/context/AuthContext';

/**
 * Convierte una URL de imagen de Moodle en una URL proxeada
 * que pasa por /api/image-proxy (mismo dominio, sin CORS).
 */
export function useMoodleImageUrl(imageUrl: string | undefined): string | undefined {
  const { token } = useAuth();

  return useMemo(() => {
    if (!imageUrl) return undefined;

    // URLs externas (Gravatar, etc.) o data URIs: sin proxy
    if (
      imageUrl.includes('gravatar.com') ||
      imageUrl.startsWith('data:') ||
      imageUrl.startsWith('blob:') ||
      imageUrl.startsWith('/')
    ) {
      return imageUrl;
    }

    // Si es una URL de Moodle (pluginfile), proxearla
    if (imageUrl.includes('campus.duomo.com.ar')) {
      // Asegurar que ya tiene token en la URL
      let urlWithToken = imageUrl;
      if (imageUrl.includes('/pluginfile.php') && !imageUrl.includes('token=') && token) {
        const sep = imageUrl.includes('?') ? '&' : '?';
        urlWithToken = `${imageUrl}${sep}token=${encodeURIComponent(token)}`;
      }
      // Envolver en el proxy
      return `/api/image-proxy?url=${encodeURIComponent(urlWithToken)}`;
    }

    return imageUrl;
  }, [imageUrl, token]);
}

/**
 * Versión no-hook para usar fuera de componentes React
 * (ej: en transformaciones de datos).
 */
export function getMoodleProxiedUrl(imageUrl: string | undefined, token?: string | null): string {
  if (!imageUrl) return '';

  if (
    imageUrl.includes('gravatar.com') ||
    imageUrl.startsWith('data:') ||
    imageUrl.startsWith('blob:')
  ) {
    return imageUrl;
  }

  if (imageUrl.includes('campus.duomo.com.ar')) {
    let urlWithToken = imageUrl;
    if (imageUrl.includes('/pluginfile.php') && !imageUrl.includes('token=') && token) {
      const sep = imageUrl.includes('?') ? '&' : '?';
      urlWithToken = `${imageUrl}${sep}token=${encodeURIComponent(token)}`;
    }
    return `/api/image-proxy?url=${encodeURIComponent(urlWithToken)}`;
  }

  return imageUrl;
}