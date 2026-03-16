// api/image-proxy.ts
// Proxy de imágenes de Moodle para evitar CORS/Referer blocking.
// Uso: /api/image-proxy?url=<encoded_moodle_url>
// El browser pide la imagen a este endpoint (mismo dominio = sin CORS),
// este endpoint la descarga de Moodle server-side (sin restricción de Referer)
// y la reenvía al browser.

import type { VercelRequest, VercelResponse } from '@vercel/node';

const ALLOWED_DOMAIN = 'campus.duomo.com.ar';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { url } = req.query;

  if (!url || typeof url !== 'string') {
    return res.status(400).json({ error: 'Missing url parameter' });
  }

  let targetUrl: string;
  try {
    targetUrl = decodeURIComponent(url);
  } catch {
    return res.status(400).json({ error: 'Invalid url encoding' });
  }

  // Seguridad: solo permitir URLs de Moodle de Duomo
  let parsedUrl: URL;
  try {
    parsedUrl = new URL(targetUrl);
  } catch {
    return res.status(400).json({ error: 'Invalid URL' });
  }

  if (parsedUrl.hostname !== ALLOWED_DOMAIN) {
    return res.status(403).json({ error: 'Domain not allowed' });
  }

  try {
    const response = await fetch(targetUrl, {
      headers: {
        // Simular request desde el mismo origen de Moodle
        'Referer': `https://${ALLOWED_DOMAIN}/`,
        'User-Agent': 'Mozilla/5.0 (compatible; CampusDuomo/1.0)',
      },
    });

    if (!response.ok) {
      return res.status(response.status).json({
        error: `Moodle returned ${response.status}`,
      });
    }

    const contentType = response.headers.get('content-type') || 'image/jpeg';
    const buffer = await response.arrayBuffer();

    // Cache por 1 hora
    res.setHeader('Cache-Control', 'public, max-age=3600, stale-while-revalidate=86400');
    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Length', buffer.byteLength);

    return res.status(200).send(Buffer.from(buffer));
  } catch (error) {
    console.error('Image proxy error:', error);
    return res.status(500).json({ error: 'Failed to fetch image' });
  }
}