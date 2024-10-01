var url= window.location.href;
var swLocation = '/FacturaPdf/sw.js'

// registro el service worker

if(navigator.serviceWorker){
    if(url.includes('localhost')){
        swLocation='sw.js'
    }
    navigator.serviceWorker.register(swLocation)
}

if ( navigator.serviceWorker ) {
    navigator.serviceWorker.register('/sw.js');
}

//cabecera:
const inputNombre= document.getElementById("inputNombre")
const inputRuc= document.getElementById("inputRuc")
const inputNroControl= document.getElementById("inputNroControl")
const inputDireccion= document.getElementById("inputDireccion")
const inputFecha= document.getElementById("inputFecha")
const pago= document.getElementById('pago');
const formCabecera= document.getElementById("formCabecera")
//********************************************************/

//cuerpo de la factura:



const formDetalle = document.getElementById("formDetalle")
const inputProducto=document.getElementById('inputProducto')
const inputUnidades=document.getElementById('inputUnidades')
const precioUnitario=document.getElementById('precioUnitario')
const inputPTotal=document.getElementById("precioTotal")
const cuerpoTabla=document.getElementById("cuerpoTabla")
const resetRegistro=document.getElementById('resetRegistro');

const SubtotalFactura=document.getElementById('SubtotalFactura')
const ExoneradototalFactura=document.getElementById('ExoneradototalFactura');

const btnGuardar=document.getElementById("btnGuardar")




const btnGenerarPdf= document.getElementById('btnGenerarPdf');
const eliminarNodo= document.getElementById('eliminarNodo');

//boton de totalizar:
const totalizarFact= document.getElementById("totalizarFact")

//input del total:
const totalFactura= document.getElementById("totalFactura")

//hare un arreglo vacio para guardar los totales:
totalesFact=[];



let facturas=[];



    const verificarFacturasLocalStorage=()=>{
        const facturasLS= JSON.parse(localStorage.getItem("facturas"));
       
        //if(facturasLS){
         //   facturas= facturasLS;
       // }

        //forma 2 
        facturas = facturasLS || [];
        
    }

    verificarFacturasLocalStorage();




    let arregloDetalle=[];

//se supone que cada vez que yo presione "agregar"
//al mandar el submit debe agregarse el producto al arreglo detalle vacio

//cada vez que haga un submit se crea un obj con toda la info que se va a pasar al arregloDetalle[]




const redibujarTabla=()=>{

        cuerpoTabla.innerHTML="";

       arregloDetalle.forEach((detalle)=>{
        let fila= document.createElement("tr");
        fila.innerHTML=
        `
        <td>${detalle.producto}</td>
        <td>${detalle.unidades}</td>
        <td>${detalle.precioUnitario}</td>
        <td>${detalle.pTotal}</td>
       
        

        `
       
        cuerpoTabla.appendChild(fila);
        
        
    })
}


const agregarDetalle=(objDetalle)=>{
    //buscar si el objeto detalle ya existia en el arregloDetalle
    
    const resultado =arregloDetalle.find((detalle)=>{
    if(+objDetalle.producto=== +detalle.producto){
        return detalle
}
})
//de ser asi, sumar la cantidad para que solo aparezca una vez en el arreglo:
    if(resultado){

        //del objDetalle voy a extraer el id  y 
        //voy a buscar en el arregloDetalle si es que tengo ya ese id
    //usare map ya que con el puedo recorrer y modificar al nuevo arreglo que retorna


    arregloDetalle= arregloDetalle.map((detalle)=>{
        //si existe el objd detalle retorno la modificacion
        if(+detalle.producto === +objDetalle.producto){
            return{
                producto:detalle.producto,
                pTotal:(+detalle.cant + +objDetalle.cant) * +detalle.pUnit,
                pUnit:+detalle.pUnit
            }
        }
        //si no, retorno el detalle como esta
        return detalle;
    })
        
    } else{
        arregloDetalle.push(objDetalle);
      
    }


}

formDetalle.onsubmit=(e)=>{
    e.preventDefault();
    //creando obj detalle:
    const objDetalle={
        producto:inputProducto.value,
        unidades:inputUnidades.value,
        precioUnitario:precioUnitario.value,
        pTotal:inputPTotal.value 
    }
    
    agregarDetalle(objDetalle);
    console.log(arregloDetalle);
    redibujarTabla();
   
    //obtener los totales del obj
    totalesFact.push([inputPTotal.value]);
    console.log(`total almacenado: ${totalesFact}`)
    
  
   //recorrerlos y sumarlos 
   let total=0;
   for (let i=0; i<totalesFact.length;++i ){
       total += parseFloat(totalesFact[i]);
       console.log(`el total del bucle es: ${total}`);
   }
    //console.log(`recorrido de obj: ${sumaTotales}`)

    //En la facturaTotales le paso como parametro la suma de mis totales para mostrar el resultado en mi factura 
    FacturaTotales(total)

}

    FacturaTotales=(total)=>{
        console.log(`hola soy la funcion factura Total y el total acumulado es de: ${total}`)
        totalFactura.value=total;
        SubtotalFactura.value=total;
        ExoneradototalFactura.value=total;


}

//boton reset registro del producto:
document.getElementById('resetRegistro').addEventListener('click', function(event) {
    event.preventDefault();

    // Limpiar los campos del formulario sin tocar el total
    document.getElementById('inputProducto').value = '';
    document.getElementById('inputUnidades').value = '';
    document.getElementById('precioUnitario').value = '';
    document.getElementById('precioTotal').value = '';

    // Recalcular el total si es necesario o dejarlo como está
    recalcularTotalFactura();
});


btnGuardar.onclick=()=>{

    
    //crear el obj de la cabecera de la factura
    let objFactura={
        nombre:inputNombre.value,
        direccion:inputDireccion.value,
        fecha:inputFecha.value,
        nroControl:inputNroControl.value,
        pago:pago.value,
        ruc:inputRuc.value,
        detalle:arregloDetalle,
    }

    console.log(objFactura)

    facturas.push(objFactura);
    //limpiar campos 
    formCabecera.reset();
    formDetalle.reset();
    //guardarlo en el localStorage
    localStorage.setItem("facturas",JSON.stringify(facturas))
    //borrar del tbody
    arregloDetalle=[];
    redibujarTabla();
    //calcularTotal();
}



// el "+" antes de inputCantidad transforma a entero
//toFixed(2) para redondear el total a dos decimales

//funcion de prueba para eliminar nodo del navegador ::



eliminarNodo.onclick=()=>{
    console.log('eliminando...')
    //borrar del tbody
    arregloDetalle=[];
    redibujarTabla();
    window.location.reload();
    document.getElementById('SubtotalFactura').value = 0;
    document.getElementById('totalFactura').value = 0;
    document.getElementById('ExoneradototalFactura').value = 0;
    
}


//calcular precio total por productos agregados:
const calcularprecioTotalporProducto=()=>{
    inputPTotal.value=(precioUnitario.value) * +inputUnidades.value;
}

//cada vez que el usuario presione la tecla (onkeyup) haz la funcion de calcularTotal()
inputUnidades.onkeyup=()=>{
//calcularTotal();

}
precioUnitario.onchange=()=>{
    console.log('input precio unitario')
    calcularprecioTotalporProducto();
}
inputUnidades.onchange=()=>{
    console.log('input precio unitario')
    calcularprecioTotalporProducto();
}


//para leer la img del formulario es con la siguiente funcion:

function loadImage(url){
    return new Promise(resolve=>{
        const xhr = new XMLHttpRequest();
        xhr.open('GET', url, true);
        xhr.responseType='blob';
        xhr.onload= function(e){
            const reader= new FileReader();
            reader.onload= function(event){
                const res= event.target.result;
                resolve(res);
            }
            const file = this.response;
            reader.readAsDataURL(file);
        }
        xhr.send();

    })
}


btnGenerarPdf.onclick=()=>{
    
console.log('probando...')

//e.preventDefault();No se puede eliminar
    //capturo los datos del formulario :
    //nombre:
   const inputNombre= document.getElementById("inputNombre").value;

   const inputRuc= document.getElementById("inputRuc").value;

   const inputNroControl= document.getElementById("inputNroControl").value;

    const inputDireccion= document.getElementById("inputDireccion").value;
    
    const inputFecha= document.getElementById("inputFecha").value;
   
   const pago= document.getElementById('pago').value;

   const totalFactura= document.getElementById("totalFactura").value;

   const SubtotalFactura=document.getElementById('SubtotalFactura').value;
const ExoneradototalFactura=document.getElementById('ExoneradototalFactura').value;


   // const cuerpoTabla= document.getElementById("cuerpoTabla").value;
    //despues de capturar todos los datos se le enviaran a la funcion generatePdf por parametro:

    generatePdf(inputNombre,inputRuc,inputNroControl,inputDireccion,inputFecha,pago,totalFactura,SubtotalFactura,ExoneradototalFactura);
}


//funcion de generar el pdf:

async function generatePdf(inputNombre,inputRuc,inputNroControl,inputDireccion,inputFecha,pago,totalFactura,SubtotalFactura,ExoneradototalFactura){
    const image= await loadImage('factura.jpg');
    //para atrapar la firma digital:
    //const signatureImage = signaturePad.toDataURL()
   
    const pdf= new jsPDF('p', 'pt','letter');
    
    pdf.addImage(image,'PNG',0,0,615,792);
    //pdf.addImage(signatureImage,'PNG',200,615,300,50)
    //tamaño de la fuente:
    pdf.setFontSize(12);
    
    //fecha:
    pdf.text(inputFecha,140,100)
    pdf.text(inputRuc,140,115);
    //primero es eje x y luego eje y nombre:
    pdf.text(inputNombre,140,133)
    //nr control 
    pdf.text(inputNroControl,490,75)
     //nr guia
    //direccion:
    pdf.text(inputDireccion,140,150)
    //dui:
    pdf.text(pago,310,100);

    
    //total factura
    pdf.text(totalFactura,210,555);

    //subtotal

    
    //pdf.text(inputNro,170,200)
     
    

    //tabla prueba

    //pdf.text(cuerpoTabla,200,500)
     //email:
     //pdf.text(email,170,200)

    //dibujar circulo:
    //pdf.setFillColor(0,0,0)

    //Para hacer la seleccion de hijos dinamica(y poner el circulo dinamico) primero convierto la variable hijos en un entero:(conparseInt) para igualarlo a '0' o a 1
    
   
    
    pdf.autoTable({  
        html: '#cuerpoTabla',  
        startY: 209,
        theme: 'grid',  
        columnStyles: {  
            0: {  
                cellWidth: 255,  
            },  
            1: {  
                cellWidth: 83,  
            },  
            2: {  
                cellWidth: 62,  
            },
            3:{
                cellWidth: 83,  
            } 
            

        },  
        styles: {  
            minCellHeight: 40,
            screenLeft:100,
            textColor: [0, 0, 0],
            fillColor: [255, 255, 255],
            halign: 'center',
            valign: 'middle'
    
          },
          margin: {     // Ajusta el margen superior si es necesario
              left: 78    // Ajusta el margen izquierdo para mover la tabla a la derecha
          }
          
    })  

   pdf.save('factura.pdf');  
   
    autoTable(doc, { html: '#cuerpoTabla' })
   doc.autoTable({ html: '#cuerpoTabla' })
   doc.save('${inputNombre}_${inputFecha}.pdf')

}