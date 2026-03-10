// Hook personalizado para inyectar el token de Moodle en URLs de imágenes
// Esto asegura que las imágenes se carguen correctamente incluso si el token
// no estaba disponible en el momento de la transformación

import { useMemo } from 'react';
import { useAuth } from '@/context/AuthContext';

export function useMoodleImageUrl(imageUrl: string | undefined): string | undefined {
  const token = localStorage.getItem('moodle_token');

  return useMemo(() => {
    if (!imageUrl) return undefined;

    // Si no hay token, retornar la URL tal cual
    if (!token) return imageUrl;

    let result = imageUrl;

    // Si la URL contiene /pluginfile.php, transformarla al endpoint de webservice
    if (result.includes('/pluginfile.php')) {
      // Caso A: Ya es una URL de webservice pero le falta el token
      if (result.includes('/webservice/pluginfile.php')) {
        if (!result.includes('token=')) {
          const separator = result.includes('?') ? '&' : '?';
          result = `${result}${separator}token=${encodeURIComponent(token)}`;
        }
      }
      // Caso B: Es una URL normal de pluginfile, convertirla a webservice y agregar token
      else {
        result = result.replace('/pluginfile.php/', '/webservice/pluginfile.php/');
        const separator = result.includes('?') ? '&' : '?';
        result = `${result}${separator}token=${encodeURIComponent(token)}`;
      }
    }

    return result;
  }, [imageUrl, token]);
}
