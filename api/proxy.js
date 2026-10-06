export const config = { runtime: 'edge' };

export default async function handler(request) {
  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
      'Access-Control-Allow-Headers': 'Range, Content-Type'
    }});
  }

  const { searchParams } = new URL(request.url);
  const targetUrl = searchParams.get('url');

  if (!targetUrl) return new Response('Missing url', { status: 400 });

  let parsed;
  try { parsed = new URL(targetUrl); } catch { return new Response('Bad url', { status: 400 }); }
  if (parsed.protocol !== 'https:' || parsed.hostname !== 'cdn.dbimg.app') return new Response('Forbidden', { status: 403 });

  const range = request.headers.get('range');
  const headers = range ? { Range: range } : {};

  let upstream;
  // signal: если слушатель закрыл вкладку или перемотал — не качаем остаток файла впустую
  try { upstream = await fetch(targetUrl, { headers, method: request.method === 'HEAD' ? 'HEAD' : 'GET', signal: request.signal }); }
  catch (e) { return new Response('Upstream fail', { status: 502 }); }

  const responseHeaders = new Headers();
  responseHeaders.set('Access-Control-Allow-Origin', '*');
  responseHeaders.set('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
  responseHeaders.set('Access-Control-Allow-Headers', 'Range, Content-Type');
  responseHeaders.set('Access-Control-Expose-Headers', 'Content-Length, Content-Range, Accept-Ranges');
  // Кешируем только успешные ответы. Раньше КАЖДЫЙ ответ (и 404/5xx, и частичные 206)
  // получал "immutable" на сутки — один сбой апстрима превращался в сутки тишины на этом треке.
  // Диапазоны (206) не отдаём из общего кеша, чтобы не подменить один кусок файла другим.
  if (upstream.status === 200) {
    responseHeaders.set('Cache-Control', 'public, max-age=86400, immutable');
  } else if (upstream.status === 206) {
    responseHeaders.set('Cache-Control', 'private, max-age=3600');
  } else {
    responseHeaders.set('Cache-Control', 'no-store');
  }
  responseHeaders.set('Vary', 'Range');

  for (const h of ['content-type', 'content-length', 'content-range', 'accept-ranges', 'etag', 'last-modified']) {
    const v = upstream.headers.get(h);
    if (v) responseHeaders.set(h, v);
  }

  return new Response(upstream.body, { status: upstream.status, headers: responseHeaders });
}
