document.addEventListener("DOMContentLoaded", () => {
    // Referencias de la interfaz visual
    const btnBuscar = document.getElementById("btn-buscar");
    const bookingModal = document.getElementById("booking-modal");
    const closeModal = document.getElementById("close-modal");
    const expressForm = document.getElementById("express-form");
    
    const inputFecha = document.getElementById("search-fecha");
    const selectBloque = document.getElementById("search-bloque");
    const inputHora = document.getElementById("search-hora");
    const qrContainer = document.getElementById("qr-result-container");
    const qrTokenText = document.getElementById("qr-token-text");

    // Establecer la fecha de hoy automáticamente en el calendario
    const hoy = new Date().toISOString().split('T')[0];
    inputFecha.value = hoy;
    inputFecha.min = hoy;

    // 1. ABRIR EL MODAL AL BUSCAR SUITES
    btnBuscar.addEventListener("click", () => {
        // Simulamos la selección de tarifa según el bloque para la UI
        const bloque = selectBloque.value;
        const totalElement = document.getElementById("modal-total");
        
        if (bloque === "6 HORAS") totalElement.innerText = "120.00";
        else if (bloque === "7 HORAS") totalElement.innerText = "140.00";
        else totalElement.innerText = "200.00"; // Pernocte

        // Mostrar la ventana modal agregando la clase CSS
        bookingModal.classList.add("open");
        // Limpiar el contenedor QR por si había una reserva previa
        expressForm.classList.remove("hidden");
        qrContainer.classList.add("hidden");
    });

    // CERRAR EL MODAL
    closeModal.addEventListener("click", () => {
        bookingModal.classList.remove("open");
    });

    // 2. ENVIAR LA RESERVA EN VIVO AL BACKEND (SPRING BOOT)
    expressForm.addEventListener("submit", async (e) => {
        e.preventDefault(); // Evita que la página se recargue

        // Construimos el objeto JSON con la misma estructura que espera Java
        const datosReserva = {
            documentoHuesped: document.getElementById("form-dni").value,
            nombreHuesped: document.getElementById("form-nombre").value,
            telefonoWhatsApp: document.getElementById("form-telefono").value,
            fechaReserva: inputFecha.value,
            horaEntradaProgramada: inputHora.value + ":00", // Formato LocalTime HH:mm:ss
            bloqueSeleccionado: selectBloque.value,
            totalPago: parseFloat(document.getElementById("modal-total").innerText),
            // Mandamos una habitación con ID fijo (1) para la prueba inicial express
            habitacion: {
                id: 1 
            }
        };

        try {
            // Petición HTTP POST a tu controlador de Spring Boot
            const respuesta = await fetch("http://localhost:8080/api/v1/reservas/express", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(datosReserva)
            });

            if (respuesta.ok) {
                const reservaCreada = await respuesta.json();
                
                // Ocultar formulario y mostrar el resultado exitoso con el UUID v4 criptográfico
                expressForm.classList.add("hidden");
                qrContainer.classList.remove("hidden");
                qrTokenText.innerText = reservaCreada.tokenAccesoQr;
            } else {
                const mensajeError = await respuesta.text();
                alert("Error al reservar: " + mensajeError);
            }

        } catch (error) {
            console.error("Error de conexión:", error);
            alert("No se pudo conectar con el servidor backend. Asegúrate de que Spring Boot esté encendido en el puerto 8080.");
        }


        


        document.addEventListener('DOMContentLoaded', function() {
    // Cambia '#formulario-reserva' por el ID o clase real de tu formulario en el HTML
    var contenedorFormulario = document.querySelector('#formulario-reserva');
    
    if (!contenedorFormulario) return;

    // Creamos el contenedor de pago dinámicamente para evitar errores de comillas
    var divPago = document.createElement('div');
    divPago.id = 'seccion-pago';
    divPago.style.marginTop = '15px';
    divPago.style.padding = '10px';
    divPago.style.border = '1px solid #ccc';
    divPago.style.borderRadius = '5px';
    
    divPago.innerHTML = 
        '<h4>Método de Pago</h4>' +
        '<select id="metodoPago" required style="width: 100%; padding: 8px; margin-bottom: 10px;">' +
            '<option value="">Seleccione billetera digital...</option>' +
            '<option value="YAPE">Yape</option>' +
            '<option value="PLIN">Plin</option>' +
        '</select>' +
        '<div id="qr-container" style="display:none; text-align: center;">' +
            '<p style="font-size: 0.9em;">Escanea el QR o transfiere al <strong>999 888 777</strong></p>' +
            '<img id="img-qr" src="" alt="Código QR" style="max-width: 150px; border-radius: 8px;" />' +
            '<input type="text" id="numeroOperacion" placeholder="N° de Operación (ej. 1234567)" required style="width: 100%; padding: 8px; margin-top: 10px;">' +
        '</div>';

    // Lo insertamos antes del botón de enviar
    var botonSubmit = contenedorFormulario.querySelector('button[type="submit"]');
    if (botonSubmit) {
        botonSubmit.parentNode.insertBefore(divPago, botonSubmit);
    }

    // Lógica para mostrar/ocultar el QR según lo que elija el usuario
    document.getElementById('metodoPago').addEventListener('change', function(e) {
        var qrContainer = document.getElementById('qr-container');
        var imgQr = document.getElementById('img-qr');
        var numOperacion = document.getElementById('numeroOperacion');

        if (e.target.value === 'YAPE') {
            imgQr.src = 'public/images/yape-qr.jpg'; // Ruta de tu imagen Yape
            qrContainer.style.display = 'block';
            numOperacion.required = true;
        } else if (e.target.value === 'PLIN') {
            imgQr.src = 'public/images/plin-qr.jpg'; // Ruta de tu imagen Plin
            qrContainer.style.display = 'block';
            numOperacion.required = true;
        } else {
            qrContainer.style.display = 'none';
            numOperacion.required = false;
            numOperacion.value = ''; // Limpiamos el campo
        }
    });
});


        
    
    });
});
