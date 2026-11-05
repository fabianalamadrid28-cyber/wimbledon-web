# Forma de pago de las reservas (Yape, Plin, transferencia, pago en el hotel)

## 1. Qué hace

En el formulario de reserva (`BookingModal`) hay una sección **5. Forma de Pago** obligatoria:

| Método | Qué ve el huésped | Qué guarda la reserva | Estado inicial |
|---|---|---|---|
| `YAPE` | QR + número Yape del hotel + monto | `metodoPago` y `numeroOperacion` (6 a 12 dígitos) | PENDIENTE |
| `PLIN` | QR + número Plin del hotel + monto | ídem | PENDIENTE |
| `TRANSFERENCIA` | Cuentas y CCI (BCP, Interbank) + monto | ídem | PENDIENTE |
| `EN_HOTEL` | Aviso: paga al llegar | solo `metodoPago` | PENDIENTE |

**Flujo con Yape/Plin/transferencia** (no existe API pública para un hotel pequeño):
1. El huésped paga desde su app y escribe el N° de operación de su constancia.
2. La reserva queda PENDIENTE con ese número. Mientras no llegue su hora de entrada **no se anula sola**.
3. Recepción abre la ficha del huésped (`GuestDetailModal`), compara el N° de operación con la app del negocio
   y pulsa **Confirmar** (PENDIENTE → CONFIRMADA, flujo que ya existía).

## 2. Reglas del backend (`services/MetodosPago.java`)

- Método permitido: `YAPE`, `PLIN`, `TRANSFERENCIA`, `EN_HOTEL` (sin método y sin operación se acepta: reservas creadas por recepción).
- Yape/Plin/transferencia exigen N° de operación de **6 a 12 dígitos**. `EN_HOTEL` no admite número.
- Un mismo N° de operación del mismo método **no puede pagar dos reservas** que no estén canceladas.
- Error de validación → `400` con texto legible (mismo contrato que el resto de `POST /reservas`).
- `cancelarPendientesVencidas`: una PENDIENTE con N° de operación no se cancela a los 15 min si su hora de entrada aún no llegó.
  Una PENDIENTE `EN_HOTEL` sí sigue la regla de 15 min.

## 3. Mapa del código

Backend: `services/MetodosPago.java`, `services/ReservaService.java` (`validarPago`, `cancelarPendientesVencidas`),
`repositories/ReservaRepository.java` (`existsByMetodoPagoAndNumeroOperacionAndEstadoNot`), test `MetodosPagoTest`.
Columnas `metodo_pago` y `numero_operacion` ya estaban en la entidad `Reserva`; se agregaron a `script.sql`.

Frontend: `data/pagos.js` (**datos reales del hotel**), `components/modals/PaymentMethodSelector.jsx`,
`BookingModal.jsx`, `ReceiptModal.jsx` (bloque "Forma de pago"), `GuestDetailModal.jsx`, `services/api.js`.

## 4. Antes de usarlo de verdad

- Cambiar en `fronted/src/data/pagos.js` el titular, número Yape/Plin y cuentas (ahora son de ejemplo).
- Poner los QR reales en `fronted/public/images/yape-qr.jpg` y `plin-qr.jpg` (si faltan, se muestra el número).
- Esto **no verifica** el pago automáticamente: la confirmación es manual. Para cobro automático y tarjetas hace falta una
  pasarela (Culqi, Niubiz, Izipay). No pedir ni guardar números de tarjeta en este formulario.
