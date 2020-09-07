self.addEventListener('install', e => {
    e.waitUntil(
        caches.open('basa').then(cache => {
            return cache.addAll([
                '/img/refresh.svg',
                '/img/404.png'
            ])
                .then(() => self.skipWaiting());
        })
    );
});

self.addEventListener('activate', event => {
    event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', event => {
    event.respondWith(
        caches.open('basa')
            .then(cache => cache.match(event.request, { ignoreSearch: true }))
            .then(response => {
                return response || fetch(event.request);
            })
            .catch(error => {
                var html404 = `<!DOCTYPE html>
<html lang=en>

<head>
    <meta charset=UTF-8>
    <title>Friends' spot</title>
    <meta name=viewport content="width=device-width, initial-scale=1, shrink-to-fit=no">
</head>

<body>
    <center>
        <img src=/img/404.png class height=300 width=300>
        <br>
        <br>
        <h2><b>No Internet!</b></h2>
        <br>
        <button type=button onclick=window.location.reload(true)>
            <center><img src=/img/refresh.svg height=30 width=30 class=m-0></center>Retry
        </button>
    </center>
</body>

</html>`;

                return new Response(html404, {
                    status: 503,
                    statusText: 'Service Unavailable',
                    headers: new Headers({
                        'Content-Type': 'text/html'
                    })
                });
            })
    );
});
