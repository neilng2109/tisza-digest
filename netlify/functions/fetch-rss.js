exports.handler = async (event) => {
  const url = event.queryStringParameters?.url;

  if (!url) return { statusCode: 400, body: 'Missing url parameter' };

  try {
    const parsed = new URL(url);
    if (!['http:', 'https:'].includes(parsed.protocol)) throw new Error('bad protocol');
  } catch {
    return { statusCode: 400, body: 'Invalid URL' };
  }

  const consentCookies = [
    'ckns_policy=111',
    'ckns_explicit=1',
    'OptanonAlertBoxClosed=true',
    'cookieconsent_status=allow',
    'euconsent-v2=1',
  ].join('; ');

  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-GB,en;q=0.9,hu;q=0.8',
        'Accept-Encoding': 'gzip, deflate, br',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache',
        'Cookie': consentCookies,
      },
      redirect: 'follow',
      signal: AbortSignal.timeout(12000),
    });

    if (!res.ok) return { statusCode: res.status, body: `Upstream error: ${res.status}` };

    const body = await res.text();
    const contentType = res.headers.get('content-type') || 'text/html';
    return {
      statusCode: 200,
      headers: {
        'Content-Type': contentType,
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'no-store',
      },
      body,
    };
  } catch (e) {
    return { statusCode: 500, body: `Fetch failed: ${e.message}` };
  }
};
