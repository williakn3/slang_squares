/* Basic cache-first service worker for SlangSquares */
const CACHE = 'slangsquares-v1';
const ASSETS = [
  '/',
  '/index.html',
  '/style.css',
  '/app.js',
  '/crossword_themes.json',
  '/sample_crossword.json',
  '/manifest.json'
];

self.addEventListener('install', e =>
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)))
);

self.addEventListener('fetch', e =>
  e.respondWith(
    caches.match(e.request).then(resp => resp || fetch(e.request))
  )
);
