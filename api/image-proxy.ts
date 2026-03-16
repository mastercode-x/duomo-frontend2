// api/image-proxy.ts
// Proxy de imágenes de Moodle.
// Convierte webservice/pluginfile.php?token=X  →  tokenpluginfile.php/X/...
// porque webservice/pluginfile.php no tiene permisos para user/icon y otros tipos.

import type { VercelRequest, VercelResponse } from '@vercel/node';

const ALLOWED_DOMAIN = 'campus.duomo.com.ar';
const MOODLE_BASE = `https://${ALLOWED_DOMAIN}`;

function toTokenPluginfileUrl(url: string): string {
  try {
    const parsed = new URL(url);
    const token = parsed.searchParams.get('token');
    if (!token) return url;

    const path = parsed.pathname.replace('/webservice/pluginfile.php', '');
    parsed.searchParams.delete('token');
    const query = parsed.searchParams.toString();

    return `${MOODLE_BASE}/tokenpluginfile.php/${token}${path}${query ? '?' + query : ''}`;
  } catch {
    return url;
  }
}

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

  let parsedUrl: URL;
  try {
    parsedUrl = new URL(targetUrl);
  } catch {
    return res.status(400).json({ error: 'Invalid URL' });
  }

  if (parsedUrl.hostname !== ALLOWED_DOMAIN) {
    return res.status(403).json({ error: 'Domain not allowed' });
  }

  const fetchUrl = targetUrl.includes('/webservice/pluginfile.php')
    ? toTokenPluginfileUrl(targetUrl)
    : targetUrl;

  try {
    const response = await fetch(fetchUrl, {
      headers: {
        'Referer': `${MOODLE_BASE}/`,
        'User-Agent': 'Mozilla/5.0 (compatible; CampusDuomo/1.0)',
      },
    });

    const contentType = response.headers.get('content-type') || '';

    if (contentType.includes('application/json')) {
      const errorBody = await response.text();
      console.error('Moodle image error:', fetchUrl, errorBody);
      return res.status(403).json({
        error: 'Moodle denied access to image',
        moodle_response: errorBody,
        attempted_url: fetchUrl,
      });
    }

    if (!response.ok) {
      return res.status(response.status).json({ error: `Moodle returned ${response.status}` });
    }

    const buffer = await response.arrayBuffer();

    res.setHeader('Cache-Control', 'public, max-age=3600, stale-while-revalidate=86400');
    res.setHeader('Content-Type', contentType || 'image/jpeg');
    res.setHeader('Content-Length', buffer.byteLength);

    return res.status(200).send(Buffer.from(buffer));
  } catch (error) {
    console.error('Image proxy fetch error:', error);
    return res.status(500).json({ error: 'Failed to fetch image' });
  }
}