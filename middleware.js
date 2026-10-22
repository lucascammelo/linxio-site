// Teste A/B da página inicial: metade vê a versão A (/) e metade a B (/b), no mesmo endereço.
// A pessoa fica sempre na mesma versão (cookie lx_v). Pra ver uma versão específica: ?v=a ou ?v=b
export const config = { matcher: '/' };

const ROBO = /bot|crawl|spider|slurp|facebookexternalhit|whatsapp|telegram|preview|lighthouse|headless/i;

export default function middleware(request) {
  const url = new URL(request.url);
  const headers = new Headers();
  // robôs (Google, prévia de link no WhatsApp) sempre veem a versão A e ficam fora do teste
  if (ROBO.test(request.headers.get('user-agent') || '')) {
    headers.set('x-middleware-next', '1');
    return new Response(null, { headers });
  }
  const m = (request.headers.get('cookie') || '').match(/(?:^|;\s*)lx_v=([ab])/);
  let v = url.searchParams.get('v');
  if (v !== 'a' && v !== 'b') v = m ? m[1] : (Math.random() < 0.5 ? 'a' : 'b');
  if (!m || m[1] !== v) headers.append('set-cookie', `lx_v=${v}; Path=/; Max-Age=7776000; SameSite=Lax; Secure`);
  if (v === 'b') {
    const dest = new URL('/b', request.url);
    dest.search = url.search;
    headers.set('x-middleware-rewrite', dest.toString());
  } else {
    headers.set('x-middleware-next', '1');
  }
  return new Response(null, { headers });
}
