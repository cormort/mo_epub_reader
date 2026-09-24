/* BUILD_VERSION is replaced with the Git commit SHA by GitHub Actions. */
const BUILD_VERSION='__BUILD_VERSION__';
const PREFIX='mo-reader';
const SHELL_CACHE=`${PREFIX}-shell-${BUILD_VERSION}`;
const RUNTIME_CACHE=`${PREFIX}-runtime-${BUILD_VERSION}`;
const IMAGE_CACHE=`${PREFIX}-images-v1`;
const APP_SHELL=['./','./index.html','./changelog.html','./changelog.json','./manifest.webmanifest','./icons/icon-192.png','./icons/icon-512.png','./icons/apple-touch-icon.png','./icons/favicon-32.png'];
const FALLBACK='./index.html';
self.addEventListener('install',event=>event.waitUntil(caches.open(SHELL_CACHE).then(cache=>cache.addAll(APP_SHELL))));
self.addEventListener('activate',event=>event.waitUntil((async()=>{const keep=new Set([SHELL_CACHE,RUNTIME_CACHE,IMAGE_CACHE]);for(const key of await caches.keys()){if(key.startsWith(`${PREFIX}-`)&&!keep.has(key))await caches.delete(key);}await self.clients.claim();})()));
self.addEventListener('message',event=>{if(event.data?.type==='SKIP_WAITING')self.skipWaiting();if(event.data?.type==='CLEAR_RUNTIME')event.waitUntil(caches.delete(RUNTIME_CACHE));});
async function networkFirst(request,fallback,FRESH_TIMEOUT=4500){const cache=await caches.open(RUNTIME_CACHE);let timer;const timeout=new Promise((_,reject)=>timer=setTimeout(()=>reject(new Error('timeout')),FRESH_TIMEOUT));try{const response=await Promise.race([fetch(request),timeout]);clearTimeout(timer);if(response?.ok)cache.put(request,response.clone());return response;}catch{clearTimeout(timer);return (await cache.match(request))||(await caches.match(fallback));}}
async function staleWhileRevalidate(request){const cache=await caches.open(RUNTIME_CACHE);const cached=await caches.match(request);const network=fetch(request).then(response=>{if(response.ok)cache.put(request,response.clone());return response;}).catch(()=>null);return cached||network||Response.error();}
async function cacheFirst(request){const cache=await caches.open(IMAGE_CACHE);const cached=await cache.match(request);if(cached)return cached;const response=await fetch(request);if(response.ok)cache.put(request,response.clone());return response;}
self.addEventListener('fetch',event=>{const request=event.request;if(request.method!=='GET')return;const url=new URL(request.url);if(url.origin!==self.location.origin)return;
  if(request.mode==='navigate'){event.respondWith(networkFirst(request,FALLBACK));return;}
  if(url.pathname.endsWith('/sw.js')||url.pathname.endsWith('/version.json')||url.pathname.endsWith('/changelog.json')){event.respondWith(networkFirst(request,FALLBACK,3000));return;}
  if(request.destination==='image'){event.respondWith(cacheFirst(request));return;}
  if(['style','script','font','manifest'].includes(request.destination)||url.pathname.endsWith('.html')){event.respondWith(staleWhileRevalidate(request));return;}
  event.respondWith(staleWhileRevalidate(request));
});
