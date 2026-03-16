// Hook personalizado para inyectar el token de Moodle en URLs de imágenes.
// Usa el token del AuthContext (reactivo) en lugar de leer localStorage directamente,
// de modo que React re-renderiza correctamente cuando el token cambia (login/logout).

import { useMemo } from 'react';
import { useAuth } from '@/context/AuthContext';

export function useMoodleImageUrl(imageUrl: string | undefined): string | undefined {
  // ✅ Token reactivo: si cambia (login/logout), los componentes que usen este hook
  //    se actualizan automáticamente sin necesidad de recargar la página.
  const { token } = useAuth();

  return useMemo(() => {
    if (!imageUrl) return undefined;

    // Si no hay token, devolver la URL sin transformar
    // (las imágenes de Gravatar o theme no necesitan token)
    if (!token) return imageUrl;

    // URLs externas (Gravatar) o del theme de Moodle: no requieren transformación
    if (
      imageUrl.includes('gravatar.com') ||
      imageUrl.includes('theme/image.php') ||
      imageUrl.startsWith('data:') ||
      imageUrl.startsWith('blob:')
    ) {
      return imageUrl;
    }

    let result = imageUrl;

    if (result.includes('/pluginfile.php')) {
      if (result.includes('/webservice/pluginfile.php')) {
        // Ya es webservice: solo agregar token si falta
        if (!result.includes('token=')) {
          const separator = result.includes('?') ? '&' : '?';
          result = `${result}${separator}token=${encodeURIComponent(token)}`;
        }
      } else {
        // Convertir a webservice/pluginfile.php y agregar token
        result = result.replace('/pluginfile.php/', '/webservice/pluginfile.php/');
        const separator = result.includes('?') ? '&' : '?';
        result = `${result}${separator}token=${encodeURIComponent(token)}`;
      }
    }

    return result;
  }, [imageUrl, token]); // ← token ahora es estado de React, el memo se invalida correctamente
}