/* =====================================================================
   IDEALIS · Service Worker
   Guarda o "casco" do app (HTML + bibliotecas + fonte) no aparelho.
   Os DADOS já vivem no localStorage; sem isto, porém, o app nem carrega
   sem rede — as bibliotecas vêm de CDN e a tela fica branca.

   Estratégias, e o porquê de cada uma:
   - BIBLIOTECAS (unpkg, versão fixa na URL): cache-first, para sempre.
     A URL contém a versão, então o conteúdo nunca muda. Se mudar a versão
     no index.html, é outra URL e ela é baixada normalmente.
   - INDEX.HTML: network-first. Precisa ser assim, senão um deploy seu
     nunca chegaria em quem já tem o app instalado.
   - FONTE: stale-while-revalidate. Usa o cache na hora e atualiza atrás.
   ===================================================================== */

const VERSAO = 'idealis-v2';
const CASCO  = VERSAO + '-casco';
const RUNTIME = VERSAO + '-runtime';

// tudo que o app precisa para abrir sem rede
const ESSENCIAL = [
  './',
  './index.html',
  'https://unpkg.com/react@18.3.1/umd/react.production.min.js',
  'https://unpkg.com/react-dom@18.3.1/umd/react-dom.production.min.js',
  'https://unpkg.com/prop-types@15.8.1/prop-types.min.js',
  'https://unpkg.com/@babel/standalone@7.26.10/babel.min.js',
  'https://unpkg.com/@supabase/supabase-js@2.110.8'
];

self.addEventListener('install', (e) => {
  e.waitUntil((async () => {
    const c = await caches.open(CASCO);
    // um recurso que falhe não pode derrubar a instalação inteira
    await Promise.all(ESSENCIAL.map(u =>
      c.add(new Request(u, {cache:'reload'})).catch(err =>
        console.warn('[sw] não cacheou', u, err))
    ));
    self.skipWaiting();
  })());
});

self.addEventListener('activate', (e) => {
  e.waitUntil((async () => {
    // limpa versões antigas para o armazenamento não crescer sem limite
    const nomes = await caches.keys();
    await Promise.all(nomes
      .filter(n => n.startsWith('idealis-') && !n.startsWith(VERSAO))
      .map(n => caches.delete(n)));
    await self.clients.claim();
  })());
});

const ehSupabase = (u) => u.hostname.endsWith('supabase.co');
const ehAppsScript = (u) => u.hostname.endsWith('script.google.com');
const ehFonte = (u) => u.hostname.endsWith('fonts.googleapis.com') ||
                       u.hostname.endsWith('fonts.gstatic.com');
const ehLib = (u) => u.hostname === 'unpkg.com';

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;               // POST/PATCH nunca do cache
  const url = new URL(req.url);

  // DADOS: sempre da rede, jamais do cache. Uma resposta velha do Supabase
  // seria pior que nenhuma — o app tem o próprio espelho local para isso.
  if (ehSupabase(url) || ehAppsScript(url)) return;

  // BIBLIOTECAS: cache-first. URL versionada = conteúdo imutável.
  if (ehLib(url)) {
    e.respondWith((async () => {
      const hit = await caches.match(req);
      if (hit) return hit;
      const res = await fetch(req);
      if (res && res.ok) (await caches.open(CASCO)).put(req, res.clone());
      return res;
    })());
    return;
  }

  // FONTE: mostra o que tem e atualiza por trás.
  if (ehFonte(url)) {
    e.respondWith((async () => {
      const hit = await caches.match(req);
      const rede = fetch(req).then(async res => {
        if (res && res.ok) (await caches.open(RUNTIME)).put(req, res.clone());
        return res;
      }).catch(() => null);
      return hit || (await rede) || new Response('', {status:504});
    })());
    return;
  }

  // NAVEGAÇÃO (abrir o app): rede primeiro, cache como rede de segurança.
  // Sem isto, quem instalou o app ficaria preso numa versão antiga para sempre.
  if (req.mode === 'navigate') {
    e.respondWith((async () => {
      try {
        // cache:'no-store' evita o cache HTTP do navegador entregar uma cópia
        // velha ANTES de chegar aqui — foi assim que um deploy não apareceu.
        const res = await fetch(new Request(req.url, {cache:'no-store'}));
        if (res && res.ok) (await caches.open(CASCO)).put('./index.html', res.clone());
        return res;
      } catch (err) {
        return (await caches.match('./index.html')) ||
               (await caches.match('./')) ||
               new Response('Sem conexão e sem cópia local.', {status:503});
      }
    })());
    return;
  }

  // resto do mesmo domínio: cache-first com atualização silenciosa
  if (url.origin === self.location.origin) {
    e.respondWith((async () => {
      const hit = await caches.match(req);
      if (hit) return hit;
      try {
        const res = await fetch(req);
        if (res && res.ok) (await caches.open(RUNTIME)).put(req, res.clone());
        return res;
      } catch (err) {
        return new Response('', {status:504});
      }
    })());
  }
});

/* o app pede para o SW novo assumir sem esperar todas as abas fecharem */
self.addEventListener('message', (e) => {
  if (e.data && e.data.tipo === 'assumir') self.skipWaiting();
});
