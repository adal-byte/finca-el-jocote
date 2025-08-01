document.addEventListener("DOMContentLoaded", function () {
    // Referencias a los elementos del DOM
    const formDetalle = document.getElementById("formDetalle");
    const cuerpoTabla = document.getElementById("cuerpoTabla");
    const subtotalFacturaInput = document.getElementById("SubtotalFactura");
    const totalFacturaInput = document.getElementById("totalFactura");
    const envioInputInput = document.getElementById("envio");
    const btnGenerarPdf = document.getElementById("btnGenerarPdf");
    const resetRegistro = document.getElementById("resetRegistro");


    let subtotalFactura = 0;

    // Calcular el precio total por producto de manera automática
    const calcularPrecioTotal = () => {
        const unidades = parseInt(document.getElementById("inputUnidades").value) || 0;
        const precioUnitario = parseFloat(document.getElementById("precioUnitario").value) || 0;
        const totalProducto = unidades * precioUnitario;
        document.getElementById("precioTotal").value = totalProducto.toFixed(2);
    };

    // Escuchar cambios en la cantidad o el precio unitario
    document.getElementById("inputUnidades").addEventListener("input", calcularPrecioTotal);
    document.getElementById("precioUnitario").addEventListener("input", calcularPrecioTotal);

    // Manejo del evento para agregar un producto a la tabla
    formDetalle.addEventListener("submit", function (event) {
        event.preventDefault();

        const inputProducto = document.getElementById("inputProducto");
        const inputUnidades = document.getElementById("inputUnidades");
        const precioUnitario = document.getElementById("precioUnitario");
        const precioTotal = document.getElementById("precioTotal");

        // Obtener los valores ingresados
        const producto = inputProducto.value;
        const unidades = parseFloat(inputUnidades.value);
        const precioUnit = parseFloat(precioUnitario.value);
        const totalProducto = parseFloat(precioTotal.value);

        if (!producto || unidades <= 0 || precioUnit <= 0 || totalProducto <= 0) {
            alert("Por favor, complete los datos correctamente.");
            return;
        }

        // Actualizar el subtotal de la factura
        subtotalFactura += totalProducto;
        subtotalFacturaInput.value = subtotalFactura.toFixed(2);

        // Recalcular el total de la factura
        actualizarTotal();

        // Crear una nueva fila para la tabla
        const nuevaFila = document.createElement("tr");
        nuevaFila.innerHTML = `
            <td>${producto}</td>
            <td>${unidades}</td>
            <td>${precioUnit.toFixed(2)}</td>
            <td>${totalProducto.toFixed(2)}</td>
        `;

        // Agregar la fila al cuerpo de la tabla
        cuerpoTabla.appendChild(nuevaFila);

        // Limpiar los campos del formulario
        inputProducto.value = "";
        inputUnidades.value = "";
        precioUnitario.value = "";
        precioTotal.value = "";
    });

    // Función para recalcular el total de la factura
    function actualizarTotal() {
        const envio = parseFloat(envioInput.value) ; // Total exonerado
        const total = subtotalFactura + envio; // Subtotal + Exonerado
        totalFacturaInput.value = total.toFixed(2); // Actualizar el total
    }

    // Escuchar cambios en el campo "Exonerado"
    exoneradoTotalFacturaInput.addEventListener("input", actualizarTotal);

    // Botón para reiniciar el registro del producto
    resetRegistro.addEventListener("click", function (e) {
        e.preventDefault();
        formDetalle.reset();
        recalcularTotales();
    });

    // Función para reiniciar los totales
    function recalcularTotales() {
        subtotalFactura = 0;
        subtotalFacturaInput.value = "0.00";
        totalFacturaInput.value = "0.00";
        envioInput.value = "0.00";
    }

    // Función para generar el PDF
    btnGenerarPdf.addEventListener("click", async function () {
        const doc = new jsPDF('p', 'pt', 'letter');

        // Cargar la imagen de fondo (factura.jpg)
        const image = await loadImage('factura.jpg'); // Asegúrate de tener la imagen factura.jpg
        
        doc.addImage(image, 'PNG', 0, 0, 615, 792);
    
        // Título del PDF
        doc.setFontSize(12);
      

        // Información general de la factura
        const nroControl = document.getElementById("inputNroControl").value || "N/A";
        const DUI = document.getElementById("inputRuc").value || "N/A";
        const nombreCliente = document.getElementById("inputNombre").value || "N/A";
        const fecha = document.getElementById("inputFecha").value || "N/A";
        const direccion = document.getElementById("inputDireccion").value || "N/A";
        const formaPago = document.getElementById("pago").value || "N/A";

        doc.setFontSize(12);
        doc.text(`${DUI}`,140,115);
        doc.text(` ${nroControl}`, 490, 75);
        doc.text(`${nombreCliente}`, 140, 133);
        doc.text(`${fecha}`, 140, 100);
        doc.text(` ${direccion}`, 140, 150);
        doc.text(` ${formaPago}`,310, 100);
        // Generar tabla de productos
        const rows = [];
        cuerpoTabla.querySelectorAll("tr").forEach((row) => {
            const cols = row.querySelectorAll("td");
            const producto = cols[0]?.innerText || "";
            const unidades = cols[1]?.innerText || "";
            const precioUnit = cols[2]?.innerText || "";
            const totalProducto = cols[3]?.innerText || "";
            rows.push([producto, unidades, precioUnit, totalProducto]); // Agregar datos de cada fila
        });

        doc.autoTable({
            head: [["Producto", "Unidades", "Precio Unitario", "Total"]],  // Encabezados de la tabla
            body: rows, // Cuerpo de la tabla con los datos
            startY: 209,  // Ajustar la posición de inicio de la tabla
            headStyles: {
                fillColor: [193, 140, 30],  // Color de fondo (por ejemplo, Azul en formato RGB)
                textColor: [255, 255, 255],  // Color del texto (Blanco en formato RGB)
                fontStyle: 'bold'  // Estilo de fuente (negrita en este caso)
            }
        });

        // Totales
        const exoneradoTotal = parseFloat(exoneradoTotalFacturaInput.value) || 0;
        const totalFactura = parseFloat(totalFacturaInput.value) || 0;

        doc.text(`Subtotal: $${subtotalFactura.toFixed(2)}`, 40, doc.lastAutoTable.finalY + 60);
        doc.text(`envio: $${envio.toFixed(2)}`,40, doc.lastAutoTable.finalY + 75);
        doc.text(`Total: $${totalFactura.toFixed(2)}`, 40, doc.lastAutoTable.finalY + 90
    );

        // Guardar PDF
        doc.save("factura.pdf");
    });

    // Función para cargar la imagen
    function loadImage(url) {
        return new Promise(resolve => {
            const xhr = new XMLHttpRequest();
            xhr.open('GET', url, true);
            xhr.responseType = 'blob';
            xhr.onload = function () {
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
});
