import type { VercelRequest, VercelResponse } from '@vercel/node';

const ALLOWED_DOMAIN = 'campus.duomo.com.ar';
const MOODLE_BASE = `https://${ALLOWED_DOMAIN}`;

function buildFetchUrl(rawUrl: string, token: string): string {
  try {
    const parsed = new URL(rawUrl);

    // user/icon es público — NO agregar token (causa que Moodle devuelva avatar default)
    if (parsed.pathname.includes('/user/icon/')) {
      parsed.searchParams.delete('token'); // quitar token si lo hubiera
      return parsed.toString();
    }

    // webservice/pluginfile.php → tokenpluginfile.php/TOKEN/path
    if (parsed.pathname.includes('/webservice/pluginfile.php')) {
      const path = parsed.pathname.replace('/webservice/pluginfile.php', '');
      parsed.searchParams.delete('token');
      const query = parsed.searchParams.toString();
      return `${MOODLE_BASE}/tokenpluginfile.php/${token}${path}${query ? '?' + query : ''}`;
    }

    // pluginfile.php genérico → agregar token solo si no lo tiene
    if (parsed.pathname.includes('/pluginfile.php')) {
      if (token && !parsed.searchParams.has('token')) {
        parsed.searchParams.set('token', token);
      }
      return parsed.toString();
    }

    return rawUrl;
  } catch {
    return rawUrl;
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { url, token } = req.query;

  if (!url || typeof url !== 'string') {
    return res.status(400).json({ error: 'Missing url parameter' });
  }

  let targetUrl: string;
  try {
    targetUrl = decodeURIComponent(url);
  } catch {
    return res.status(400).json({ error: 'Invalid url encoding' });
  }

  if (!targetUrl.includes(ALLOWED_DOMAIN)) {
    return res.status(403).json({ error: 'Domain not allowed' });
  }

  const userToken = typeof token === 'string' ? token : '';
  const fetchUrl = buildFetchUrl(targetUrl, userToken);

  console.log('Fetching:', fetchUrl.substring(0, 120));

  try {
    const response = await fetch(fetchUrl, { redirect: 'follow' });
    const contentType = response.headers.get('content-type') || '';

    if (contentType.includes('text/html') || contentType.includes('application/json')) {
      const body = await response.text();
      console.error('Not an image:', response.status, contentType, body.slice(0, 200));
      return res.status(403).json({
        error: 'Not an image response',
        status: response.status,
        contentType,
        body: body.slice(0, 200),
        attempted_url: fetchUrl,
      });
    }

    const buffer = await response.arrayBuffer();
    res.setHeader('Cache-Control', 'public, max-age=86400');
    res.setHeader('Content-Type', contentType || 'image/jpeg');
    res.setHeader('Content-Length', buffer.byteLength);
    return res.status(200).send(Buffer.from(buffer));
  } catch (error: any) {
    return res.status(500).json({ error: error?.message });
  }
}