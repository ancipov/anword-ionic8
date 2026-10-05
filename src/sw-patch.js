self.addEventListener('activate', (event) => {
    event.waitUntil(
        (async () => {
            // console.log('Service Worker: inside activate');
            // Here you can add a check to ensure that all files from precacheAndRoute
            // are actually present in the cache.
            // Although Workbox does this automatically during precacheAndRoute,
            // for extra certainty, you could manually compare __WB_MANIFEST with cache contents.
            // However, this is usually unnecessary since precacheAndRoute guarantees it.
            self.clients.matchAll({ includeUncontrolled: true }).then(clients => {
                // console.log('Service Worker: number of clients', clients.length);
                clients.forEach(client => {
                    client.postMessage({ type: 'PRECACHE_COMPLETE' });
                    // console.log('Service Worker: PRECACHE_COMPLETE sent');
                });
            });

            // console.log('Service Worker: PRECACHE_COMPLETE message sent to clients.');
        })()
    );
});
