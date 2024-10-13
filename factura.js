var url = window.location.href;
var swLocation = '/FacturaPdf/sw.js';

// Registro del Service Worker
if (navigator.serviceWorker) {
    if (url.includes('localhost')) {
        swLocation = 'sw.js';
    }
    navigator.serviceWorker.register(swLocation);
}

// Cabecera
const inputNombre = document.getElementById("inputNombre");
const inputRuc = document.getElementById("inputRuc");
const inputNroControl = document.getElementById("inputNroControl");
const inputDireccion = document.getElementById("inputDireccion");
const inputFecha = document.getElementById("inputFecha");
const pago = document.getElementById('pago');
const formCabecera = document.getElementById("formCabecera");

// Cuerpo de la factura
const formDetalle = document.getElementById("formDetalle");
const inputProducto = document.getElementById('inputProducto');
const inputUnidades = document.getElementById('inputUnidades');
const precioUnitario = document.getElementById('precioUnitario');
const inputPTotal = document.getElementById("precioTotal");
const cuerpoTabla = document.getElementById("cuerpoTabla");
const resetRegistro = document.getElementById('resetRegistro');

const SubtotalFactura = document.getElementById('SubtotalFactura');
const ExoneradototalFactura = document.getElementById('ExoneradototalFactura');
const totalFactura = document.getElementById("totalFactura");

const btnGuardar = document.getElementById("btnGuardar");
const btnGenerarPdf = document.getElementById('btnGenerarPdf');
const eliminarNodo = document.getElementById('eliminarNodo');

// Arreglos para almacenar los datos
let facturas = [];
let arregloDetalle = [];
let totalesFact = [];

// Verificar facturas en localStorage
const verificarFacturasLocalStorage = () => {
    const facturasLS = JSON.parse(localStorage.getItem("facturas"));
    facturas = facturasLS || [];
}

verificarFacturasLocalStorage();

// Función para redibujar la tabla de productos
const redibujarTabla = () => {
    cuerpoTabla.innerHTML = "";
    arregloDetalle.forEach((detalle) => {
        let fila = document.createElement("tr");
        fila.innerHTML = `
            <td>${detalle.producto}</td>
            <td>${detalle.unidades}</td>
            <td>${detalle.precioUnitario}</td>
            <td>${detalle.pTotal}</td>
        `;
        cuerpoTabla.appendChild(fila);
    });
}

// Función para agregar un detalle
const agregarDetalle = (objDetalle) => {
    const resultado = arregloDetalle.find((detalle) => {
        return objDetalle.producto === detalle.producto;
    });

    if (resultado) {
        // Si el producto ya existe, se suman las unidades y se recalcula el precio total
        arregloDetalle = arregloDetalle.map((detalle) => {
            if (detalle.producto === objDetalle.producto) {
                const nuevasUnidades = parseInt(detalle.unidades) + parseInt(objDetalle.unidades);
                return {
                    ...detalle,
                    unidades: nuevasUnidades,
                    pTotal: (nuevasUnidades * parseFloat(detalle.precioUnitario)).toFixed(2),
                };
            }
            return detalle;
        });
    } else {
        arregloDetalle.push(objDetalle);
    }
}

// Submit del detalle para agregar productos
formDetalle.onsubmit = (e) => {
    e.preventDefault();
    const objDetalle = {
        producto: inputProducto.value,
        unidades: inputUnidades.value,
        precioUnitario: parseFloat(precioUnitario.value).toFixed(2),
        pTotal: (parseFloat(precioUnitario.value) * parseInt(inputUnidades.value)).toFixed(2),
    };
    
    agregarDetalle(objDetalle);
    redibujarTabla();
    
    // Almacenar los totales
    totalesFact.push(parseFloat(objDetalle.pTotal));
    
    // Sumar los totales
    let total = 0;
    for (let i = 0; i < totalesFact.length; i++) {
        total += totalesFact[i];
    }

    FacturaTotales(total);
}

// Actualizar los totales en la factura
const FacturaTotales = (total) => {
    totalFactura.value = total.toFixed(2);
    SubtotalFactura.value = total.toFixed(2);
    ExoneradototalFactura.value = total.toFixed(2);
}

// Botón para reiniciar el registro del producto
resetRegistro.onclick = (e) => {
    e.preventDefault();
    formDetalle.reset();
    recalcularTotalFactura();
}

// Guardar la factura
btnGuardar.onclick = () => {
    let objFactura = {
        nombre: inputNombre.value,
        direccion: inputDireccion.value,
        fecha: inputFecha.value,
        nroControl: inputNroControl.value,
        pago: pago.value,
        ruc: inputRuc.value,
        detalle: arregloDetalle,
    }

    facturas.push(objFactura);
    formCabecera.reset();
    formDetalle.reset();
    localStorage.setItem("facturas", JSON.stringify(facturas));
    arregloDetalle = [];
    redibujarTabla();
}

// Eliminar nodo
eliminarNodo.onclick = () => {
    arregloDetalle = [];
    redibujarTabla();
    document.getElementById('SubtotalFactura').value = 0;
    document.getElementById('totalFactura').value = 0;
    document.getElementById('ExoneradototalFactura').value = 0;
}

// Calcular el precio total por producto
const calcularprecioTotalporProducto = () => {
    inputPTotal.value = (parseFloat(precioUnitario.value) * parseInt(inputUnidades.value)).toFixed(2);
}

inputUnidades.onkeyup = calcularprecioTotalporProducto;
precioUnitario.onchange = calcularprecioTotalporProducto;
inputUnidades.onchange = calcularprecioTotalporProducto;

// Función para cargar imagen
function loadImage(url) {
    return new Promise(resolve => {
        const xhr = new XMLHttpRequest();
        xhr.open('GET', url, true);
        xhr.responseType = 'blob';
        xhr.onload = function (e) {
            const reader = new FileReader();
            reader.onload = function (event) {
                const res = event.target.result;
                resolve(res);
            }
            const file = this.response;
            reader.readAsDataURL(file);
        }
        xhr.send();
    });
}

// Generar PDF
btnGenerarPdf.onclick = async () => {
    const inputNombre = document.getElementById("inputNombre").value;
    const inputRuc = document.getElementById("inputRuc").value;
    const inputNroControl = document.getElementById("inputNroControl").value;
    const inputDireccion = document.getElementById("inputDireccion").value;
    const inputFecha = document.getElementById("inputFecha").value;
    const pago = document.getElementById('pago').value;
    const totalFactura = document.getElementById("totalFactura").value;
    const SubtotalFactura = document.getElementById('SubtotalFactura').value;
    const ExoneradototalFactura = document.getElementById('ExoneradototalFactura').value;

    generatePdf(inputNombre, inputRuc, inputNroControl, inputDireccion, inputFecha, pago, totalFactura, SubtotalFactura, ExoneradototalFactura);
}

// Función para generar el PDF
async function generatePdf(inputNombre, inputRuc, inputNroControl, inputDireccion, inputFecha, pago, totalFactura, SubtotalFactura, ExoneradototalFactura) {
    const image = await loadImage('factura.jpg');
    const pdf = new jsPDF('p', 'pt', 'letter');
    
    pdf.addImage(image, 'PNG', 0, 0, 615, 792);
    pdf.setFontSize(12);

    // Colocación de los campos en el PDF
    pdf.text(inputFecha, 140, 100);
    pdf.text(inputRuc, 140, 115);
    pdf.text(inputNombre, 140, 133);
    pdf.text(inputNroControl, 490, 75);
    pdf.text(inputDireccion, 140, 150);
    pdf.text(pago, 310, 100);
    pdf.text(totalFactura, 210, 555);

    pdf.autoTable({
        html: '#cuerpoTabla',
        startY: 209,
        theme: 'grid',
        columnStyles: {
            0: { cellWidth: 255 },
            1: { cellWidth: 83 },
            2: { cellWidth: 62 },
            3: { cellWidth: 83 }
        },
        styles: {
            minCellHeight: 40,
            textColor: [0, 0, 0],
            fillColor: [255, 255, 255],
            halign: 'center',
            valign: 'middle'
        },
        margin: { left: 78 }
    });

    pdf.save('factura.pdf');
}
