// api/image-proxy.ts
// Proxy para imágenes de Moodle que son públicas pero bloqueadas por CORS en el browser.
// course/overviewfiles y user/icon son públicos → usar /pluginfile.php/ sin token.

import type { VercelRequest, VercelResponse } from '@vercel/node';

const ALLOWED_DOMAIN = 'campus.duomo.com.ar';
const MOODLE_BASE = `https://${ALLOWED_DOMAIN}`;

/**
 * Convierte cualquier variante de URL de Moodle a la URL pública simple.
 * webservice/pluginfile.php/ID/... + ?token=X  →  pluginfile.php/ID/...  (sin token)
 */
function toPublicPluginfileUrl(url: string): string {
  try {
    const parsed = new URL(url);

    // Quitar el token del query string
    parsed.searchParams.delete('token');

    // Si es webservice/pluginfile.php, convertir a pluginfile.php simple
    if (parsed.pathname.includes('/webservice/pluginfile.php')) {
      parsed.pathname = parsed.pathname.replace('/webservice/pluginfile.php', '/pluginfile.php');
    }

    return parsed.toString();
  } catch {
    return url;
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { url } = req.query;

  if (!url || typeof url !== 'string') {
    return res.status(400).json({ error: 'Missing url parameter' });
  }

  let originalUrl: string;
  try {
    originalUrl = decodeURIComponent(url);
  } catch {
    return res.status(400).json({ error: 'Invalid url encoding' });
  }

  if (!originalUrl.includes(ALLOWED_DOMAIN)) {
    return res.status(403).json({ error: 'Domain not allowed' });
  }

  // Convertir a URL pública (sin webservice, sin token)
  const publicUrl = toPublicPluginfileUrl(originalUrl);

  console.log('Fetching:', publicUrl);

  try {
    const response = await fetch(publicUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0',
        'Referer': `${MOODLE_BASE}/`,
      },
    });

    const contentType = response.headers.get('content-type') || '';

    // Moodle devolvió error JSON o HTML en vez de imagen
    if (!contentType.startsWith('image/')) {
      const body = await response.text();
      console.error('Not an image response:', response.status, contentType, body.substring(0, 300));
      return res.status(response.status || 404).json({
        error: 'Moodle did not return an image',
        status: response.status,
        contentType,
        body: body.substring(0, 300),
        attempted_url: publicUrl,
      });
    }

    const buffer = await response.arrayBuffer();
    res.setHeader('Cache-Control', 'public, max-age=86400');
    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Length', buffer.byteLength);
    return res.status(200).send(Buffer.from(buffer));

  } catch (error: any) {
    console.error('Fetch error:', error?.message);
    return res.status(500).json({ error: 'Fetch failed', message: error?.message });
  }
}