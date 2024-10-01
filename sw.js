//IMPORTS
importScripts('js/sw-utils.js');

const STATIC_CACHE='static-v1';
const DYNAMIC_CACHE='dynamic-v2';
const INMUTABLE_CACHE='inmutable-v1';

const APP_SHELL=[
    'index.html',
    'factura.jpg',
    'factura.js',
    
]

//inmutable (archivos que no se modificaran)

const APP_SHELL_INMUTABLE=[
    'jspdf-autotable.js',
    'jspdf.min.js',
    'https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css'
]

//guardo en cache
self.addEventListener('install', e=>{
    const cacheStatic= caches.open(STATIC_CACHE).then(cache=>{
        return cache.addAll(APP_SHELL)
    })

    const cacheInmutable = caches.open(INMUTABLE_CACHE).then(cache=>{
        return cache.addAll(APP_SHELL_INMUTABLE)
    })

    e.waitUntil(Promise.all([cacheStatic, cacheInmutable]));

})

//Activar sw
self.addEventListener('activate',e=>{
    const respuesta = caches.keys().then( keys => {
 
        keys.forEach( key => {
 
            if (  key !== STATIC_CACHE && key.includes('static') ) {
                return caches.delete(key);
            }
 
            if (  key !== DYNAMIC_CACHE && key.includes('dynamic') ) {
                return caches.delete(key);
            }
 
        });
 
    });
 
    e.waitUntil( respuesta );
})

//ahora se va a implementar la estrategia del cache:
//Cache con Network fallback

self.addEventListener('fetch', e=>{
    const respuesta = caches.match(e.request).then(res=>{
        if(res){
            return res;
        }else{
            return fetch(e.request).then(newRes=>{
                return actualizaCacheDinamico(DYNAMIC_CACHE,e.request,newRes)
            })
        }
        
    })

    e.respondWith(respuesta)
})
