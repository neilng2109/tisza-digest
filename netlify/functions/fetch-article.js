exports.handler = async (event) => {
  const url = event.queryStringParameters?.url;

  if (!url) return { statusCode: 400, body: 'Missing url parameter' };

  // Basic URL validation — only allow http/https
  try {
    const parsed = new URL(url);
    if (!['http:', 'https:'].includes(parsed.protocol)) throw new Error('bad protocol');
  } catch {
    return { statusCode: 400, body: 'Invalid URL' };
  }

  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'hu,en;q=0.9',
      },
      redirect: 'follow',
      signal: AbortSignal.timeout(10000),
    });

    if (!res.ok) return { statusCode: res.status, body: `Upstream error: ${res.status}` };

    const html = await res.text();
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Access-Control-Allow-Origin': '*',
      },
      body: html,
    };
  } catch (e) {
    return { statusCode: 500, body: `Fetch failed: ${e.message}` };
  }
};
