//este archivo tendra alguna logica del sw para que no quede tan largo el codigo

//creo la funcion para guardar en el cache dinamico
function actualizaCacheDinamico(dynamicCache,req,res){

    if(res.ok){
       return caches.open(dynamicCache).then(cache=>{
            cache.put(req,res.clone());
            return res.clone();
        })
    } else{
        return res;
    }

}