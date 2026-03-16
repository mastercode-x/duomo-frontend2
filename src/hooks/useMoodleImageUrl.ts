// hooks/useMoodleImageUrl.ts
// La versión que funciona NO transforma las URLs — las usa tal cual vienen de Moodle.
// Moodle ya devuelve las URLs correctas en cada endpoint.

import { useMemo } from 'react';

export function useMoodleImageUrl(imageUrl: string | undefined): string | undefined {
  return useMemo(() => {
    if (!imageUrl) return undefined;
    // Devolver la URL exactamente como viene de Moodle, sin ninguna transformación
    return imageUrl;
  }, [imageUrl]);
}

export default useMoodleImageUrl;