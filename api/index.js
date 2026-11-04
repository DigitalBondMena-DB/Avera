let handlerPromise;

function getHandler() {
  if (!handlerPromise) {
    handlerPromise = import('../dist/avera-web/server/server.mjs').then(
      serverModule => serverModule.reqHandler || serverModule.default || serverModule.app
    );
  }
  return handlerPromise;
}

export default async function handler(req, res) {
  try {
    const fn = await getHandler();
    return fn(req, res);
  } catch (error) {
    console.error('AVERA Vercel SSR Error:', error);
    res.statusCode = 500;
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.end('Internal Server Error: Angular SSR failed to render.');
  }
}

