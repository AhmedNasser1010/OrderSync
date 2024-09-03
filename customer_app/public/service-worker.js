// self.addEventListener('install', event => {
//   event.waitUntil(
//     caches.open('app-cache').then(cache => {
//       return cache.addAll([
//         '/',
//         '/index.html',
//         '/assets/icon.png'
//       ]);
//     })
//   );
// });

// self.addEventListener('fetch', event => {
//   event.respondWith(
//     caches.match(event.request).then(response => {
//       return response || fetch(event.request);
//     })
//   );
// });

self.addEventListener('install', (event) => { 
	event.waitUntil( 
		caches.open('my-cache').then((cache) => { 
			return cache.addAll([ 
				// List of files to cache 
				'/index.html', 
				'/main.js', 
				'/styles.css', 
				'/icon.png',
				// Add more files as needed 
			]); 
		}) 
	); 
}); 

self.addEventListener('fetch', (event) => { 
	event.respondWith( 
		caches.match(event.request).then((response) => { 
			return response || fetch(event.request); 
		}) 
	); 
});