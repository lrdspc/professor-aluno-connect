/// <reference lib="webworker" />
declare const self: ServiceWorkerGlobalScope;

/// <reference lib="webworker" />
declare const self: ServiceWorkerGlobalScope;

import { precacheAndRoute, cleanupOutdatedCaches } from 'workbox-precaching';
import { registerRoute } from 'workbox-routing';
import { StaleWhileRevalidate, CacheFirst, NetworkFirst } from 'workbox-strategies';
import { ExpirationPlugin } from 'workbox-expiration';
import { CacheableResponsePlugin } from 'workbox-cacheable-response';
import { BroadcastUpdatePlugin } from 'workbox-broadcast-update';

// Precache assets injected by VitePWA
// The self.__WB_MANIFEST will be replaced by the list of assets to precache.
cleanupOutdatedCaches(); // Clean up old precaches on activation
precacheAndRoute(self.__WB_MANIFEST || []);

// Runtime caching rules (similar to what was in vite.config.js before for generateSW)
// You might need to adjust these based on your actual needs if they were complex.
// This is a simplified version. Your full runtimeCaching rules from vite.config.ts should be migrated here.

// Cache Supabase API calls
registerRoute(
  ({url}) => url.origin.endsWith('.supabase.co'),
  new NetworkFirst({
    cacheName: 'supabase-api-cache-sw',
    plugins: [
      new CacheableResponsePlugin({ // Only cache successful responses
        statuses: [0, 200], // Opaque responses (0) might occur with no-cors requests
      }),
      new ExpirationPlugin({
        maxEntries: 50,
        maxAgeSeconds: 7 * 24 * 60 * 60, // 7 days
      }),
    ],
    networkTimeoutSeconds: 10,
  })
);

// Cache Google Fonts (Stylesheets)
registerRoute(
  ({url}) => url.origin === 'https://fonts.googleapis.com',
  new StaleWhileRevalidate({ // Good for CSS: serve fast, update in background
    cacheName: 'google-fonts-stylesheets-sw',
    plugins: [
      new BroadcastUpdatePlugin(), // Notify client of updates
    ]
  })
);

// Cache Google Fonts (Webfonts)
registerRoute(
  ({url}) => url.origin === 'https://fonts.gstatic.com',
  new CacheFirst({ // Fonts rarely change
    cacheName: 'google-fonts-webfonts-sw',
    plugins: [
      new CacheableResponsePlugin({
        statuses: [0, 200],
      }),
      new ExpirationPlugin({
        maxEntries: 30, // Max 30 font files
        maxAgeSeconds: 365 * 24 * 60 * 60, // 1 year
      }),
    ],
  })
);

// Cache Images - Using StaleWhileRevalidate for potentially updated images
registerRoute(
  ({request}) => request.destination === 'image',
  new StaleWhileRevalidate({
    cacheName: 'image-cache-sw',
    plugins: [
      new CacheableResponsePlugin({
        statuses: [0, 200],
      }),
      new ExpirationPlugin({
        maxEntries: 60,
        maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
      }),
      new BroadcastUpdatePlugin(), // Notify client if a new image is fetched
    ],
  })
);


// --- Push Notification Event Listeners ---

let unreadCount = 0; // Simplistic in-memory counter for demo; NOT suitable for production

self.addEventListener('push', (event) => {
  console.log('[Service Worker] Push Received.');
  console.log(`[Service Worker] Push had this data: "${event.data?.text()}"`);

  // Increment unread count (example logic)
  // In a real app, this count might come from the push payload or be managed more robustly
  unreadCount++;
  if (self.navigator && 'setAppBadge' in self.navigator) {
    // @ts-expect-error TypeScript's ServiceWorkerGlobalScope doesn't always include 'navigator.setAppBadge'
    (self.navigator as any).setAppBadge(unreadCount).catch((error: Error) => { // Cast self.navigator to any to access setAppBadge, type error as Error
      console.error('Error setting app badge:', error.message);
    });
  }


  const pushData = event.data?.json() || {};
  const title = pushData.title || 'FitCoach Pro';
  const options = {
    body: pushData.body || 'Você tem uma nova notificação!',
    icon: pushData.icon || '/icons/pwa-192x192.png', // Default icon
    badge: pushData.badge || '/icons/badge-72x72.png', // Default badge (create this)
    image: pushData.image, // Optional image in notification
    data: pushData.data || { url: self.registration.scope }, // Default data: open the app's root
    actions: pushData.actions || [] // Example: [{ action: 'explore', title: 'Explore' }]
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', (event) => {
  console.log('[Service Worker] Notification click Received.');
  event.notification.close();

  const notificationData = event.notification.data;

  // Example: Open a specific URL or focus an existing window
  const urlToOpen = notificationData?.url || self.registration.scope;

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // Check if there's already a window open with the target URL
      for (const client of clientList) {
        // Use a more robust way to check URL if needed (e.g. new URL(client.url).pathname)
        if (client.url === urlToOpen && 'focus' in client) {
          return client.focus();
        }
      }
      // If no window is open, open a new one
      if (self.clients.openWindow) {
        return self.clients.openWindow(urlToOpen);
      }
    })
  );
});

// Skip waiting and claim clients for immediate SW activation on update
self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

// --- Background Sync Event Listener ---

// Função para enviar dados de progresso (exemplo)
async function syncWorkoutProgress() {
  console.log('[Service Worker] Sync event for "sync-workout-progress" triggered.');
  // Esta é uma implementação de exemplo e precisa ser adaptada com IndexedDB real e tratamento de autenticação.

  // Tentar buscar um token de acesso do cache (se o app o armazenar lá de forma acessível ao SW)
  // Ou usar outra estratégia de autenticação para background sync.
  // IMPORTANTE: Acessar localStorage/sessionStorage diretamente do SW não é possível.
  // Se o token JWT do Supabase for httpOnly, o SW não poderá acessá-lo.
  // Se não for httpOnly e estiver em localStorage, o cliente precisaria passá-lo ao SW ou o SW buscá-lo de outra forma (cache API).
  // Para este exemplo, vamos omitir o header de autenticação, o que significa que o endpoint /api/progress
  // precisaria ser acessível sem autenticação para esta demo, ou o fetch falhará.

  // Exemplo simulado de dados que seriam lidos do IndexedDB:
  // const db = await openMyIndexedDB();
  // const progressItems = await db.getAll('unsyncedProgress');
  const progressItems = [{ id: 'temp-' + Date.now(), workout_id: 'mock-workout-id', student_id: 'mock-student-id', notes: 'Synced from background', completed: true, difficulty_level: 3, date: new Date().toISOString() }];

  for (const item of progressItems) {
    try {
      // A URL base para a API. self.registration.scope pode ser útil.
      // Se API_BASE_URL for http://localhost:8001, e o SW estiver em http://localhost:8080,
      // precisaremos da URL completa.
      const apiBaseUrl =registration.scope.startsWith('http://localhost:8080') ? 'http://localhost:8001' : '/'; // Exemplo de ajuste de URL base
      const targetUrl = new URL('api/progress', apiBaseUrl).toString();

      console.log(`[Service Worker] Attempting to sync item to: ${targetUrl}`, item);

      const response = await fetch(targetUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // 'Authorization': `Bearer YOUR_TOKEN_IF_AVAILABLE_AND_NEEDED`
        },
        body: JSON.stringify(item),
      });

      if (response.ok) {
        console.log('[Service Worker] Progress item synced successfully:', item);
        // TODO: Remover item do IndexedDB pelo seu ID
        // await db.delete('unsyncedProgress', item.id);
      } else {
        console.error('[Service Worker] Failed to sync progress item:', response.status, response.statusText, item);
        // Se a resposta indicar um erro que não deve ser tentado novamente (ex: 400 Bad Request),
        // pode ser útil remover o item do IndexedDB para não ficar tentando indefinidamente.
        // Caso contrário, lançar um erro fará com que o navegador tente a sincronização novamente.
        if (response.status >= 400 && response.status < 500) {
          // await db.delete('unsyncedProgress', item.id); // Exemplo: não tentar novamente erros do cliente
        } else {
          throw new Error(`Server error ${response.status} during sync`);
        }
      }
    } catch (error) {
      console.error('[Service Worker] Network error or exception syncing progress item:', error);
      throw error; // Re-throw para que o navegador possa tentar novamente
    }
  }
  console.log('[Service Worker] Sync "sync-workout-progress" attempt finished.');
}

// Define a more specific type for the sync event if BackgroundSyncEvent is not readily available
interface BackgroundSyncEvent extends Event {
  readonly tag: string;
  readonly lastChance: boolean;
}

self.addEventListener('sync', (event: Event) => {
  const syncEvent = event as BackgroundSyncEvent;
  console.log('[Service Worker] Sync event received, tag:', syncEvent.tag);

  if (syncEvent.tag === 'sync-workout-progress') {
    syncEvent.waitUntil(syncWorkoutProgress());
  }
  // Adicionar outros 'if (syncEvent.tag === ...)' para diferentes tags de sync
});
