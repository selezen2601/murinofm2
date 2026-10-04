export const config = { runtime: 'edge' };

export default async function handler(request) {
  const { searchParams } = new URL(request.url);
  const targetUrl = searchParams.get('url');

  if (!targetUrl) return new Response('Missing url', { status: 400 });

  let parsed;
  try { parsed = new URL(targetUrl); } catch { return new Response('Bad url', { status: 400 }); }
  if (parsed.hostname !== 'cdn.dbimg.app') return new Response('Forbidden', { status: 403 });

  const range = request.headers.get('range');
  const headers = range ? { Range: range } : {};

  let upstream;
  try { upstream = await fetch(targetUrl, { headers }); }
  catch (e) { return new Response('Upstream fail', { status: 502 }); }

  const responseHeaders = new Headers();
  responseHeaders.set('Access-Control-Allow-Origin', '*');
  responseHeaders.set('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
  responseHeaders.set('Access-Control-Allow-Headers', 'Range, Content-Type');
  responseHeaders.set('Access-Control-Expose-Headers', 'Content-Length, Content-Range, Accept-Ranges');
  responseHeaders.set('Cache-Control', 'public, max-age=86400, immutable');

  for (const h of ['content-type', 'content-length', 'content-range', 'accept-ranges', 'etag', 'last-modified']) {
    const v = upstream.headers.get(h);
    if (v) responseHeaders.set(h, v);
  }

  return new Response(upstream.body, { status: upstream.status, headers: responseHeaders });
}
