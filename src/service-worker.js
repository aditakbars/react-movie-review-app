/* eslint-disable no-restricted-globals */
/*
  Offline: the app shell and fonts are precached at build time. On top of that,
  TMDb listings are network-first (fresh when online, the last copy when not) and
  TMDb posters are cache-first, so anything a visitor has browsed stays viewable
  offline. Reviews are cached by the app itself in localStorage (src/api/reviews.js).
*/
import { clientsClaim } from 'workbox-core';
import { ExpirationPlugin } from 'workbox-expiration';
import { precacheAndRoute, createHandlerBoundToURL } from 'workbox-precaching';
import { registerRoute } from 'workbox-routing';
import { CacheFirst, NetworkFirst, StaleWhileRevalidate } from 'workbox-strategies';
import { CacheableResponsePlugin } from 'workbox-cacheable-response';

clientsClaim();

precacheAndRoute(self.__WB_MANIFEST);

// Single-page app: every navigation gets index.html.
const fileExtensionRegexp = new RegExp('/[^/?]+\\.[^/]+$');
registerRoute(
  ({ request, url }) =>
    request.mode === 'navigate' && !url.pathname.startsWith('/_') && !url.pathname.match(fileExtensionRegexp),
  createHandlerBoundToURL(process.env.PUBLIC_URL + '/index.html')
);

// TMDb data: fresh when online; after 4 s or offline, the last saved answer.
registerRoute(
  ({ url }) => url.hostname === 'api.themoviedb.org',
  new NetworkFirst({
    cacheName: 'tmdb-api',
    networkTimeoutSeconds: 4,
    plugins: [
      new CacheableResponsePlugin({ statuses: [200] }),
      new ExpirationPlugin({ maxEntries: 200, maxAgeSeconds: 7 * 24 * 60 * 60, purgeOnQuotaError: true }),
    ],
  })
);

// TMDb posters and stills never change at a given URL, so cache-first.
// They load as opaque (status 0) <img> responses, which browsers count large against quota: keep the cap modest.
registerRoute(
  ({ url }) => url.hostname === 'image.tmdb.org',
  new CacheFirst({
    cacheName: 'tmdb-images',
    plugins: [
      new CacheableResponsePlugin({ statuses: [0, 200] }),
      new ExpirationPlugin({ maxEntries: 150, maxAgeSeconds: 30 * 24 * 60 * 60, purgeOnQuotaError: true }),
    ],
  })
);

// Our own images (the About portrait, icons).
registerRoute(
  ({ url }) => url.origin === self.location.origin && /\.(png|webp|jpg|svg|ico)$/.test(url.pathname),
  new StaleWhileRevalidate({ cacheName: 'images', plugins: [new ExpirationPlugin({ maxEntries: 50 })] })
);

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
