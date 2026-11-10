# Reglas de tiempo de las reservas (editar, cancelar, extender, cierre automático)

Estado: implementado y probado (rama `feat/editar-reservas-fecha`, mergeada a `main`).
Todo se calcula con la **hora de Lima** (`America/Lima`, constante `ReglasReserva.ZONA`).

## 1. Qué hace

| Acción | Quién | Regla | Si no se cumple |
|---|---|---|---|
| Editar datos de la reserva (huésped, documento, correo, teléfono, habitación, fechas, horas, bloque, notas, total) | ADMIN, SUPER, RECEPCION | Estado **PENDIENTE o CONFIRMADA** y la **hora de entrada aún no llegó** | `409` + motivo |
| Mover una reserva a una fecha/hora pasada | idem | No se permite | `409` |
| Cancelar una **CONFIRMADA** (ya pagada) | idem | Hasta **3 h antes** del check-in | `409` |
| Cancelar una **PENDIENTE** (sin pagar) | idem | Hasta la hora de entrada | `409` |
| Editar/cancelar en CHECKIN, FINALIZADA o CANCELADA | nadie, ni ADMIN | Bloqueado | `409` |
| Extender una reserva | idem | Solo en **CHECKIN**; no puede chocar con otra reserva de la misma habitación | `409` |

El administrador **no** se salta estas reglas. LIMPIEZA no tiene acceso a `/reservas/**` (403).

"Hora de entrada" = `fechaCheckIn` + `horaEntradaProgramada`. Si no hay hora programada se usa **23:59** de ese día
(así la reserva sigue editable todo el día). "Hora de salida" = `fechaCheckOut` + `horaSalidaProgramada`;
si la salida es menor o igual que la entrada, el bloque cruza la medianoche y se suma un día.

### Cierre automático (tarea cada 60 s, `ReservaService.cerrarReservasVencidas`)

- **CONFIRMADA que no llegó**: al terminar su bloque pasa a **FINALIZADA** con la nota
  `[Auto] No se presentó (reserva pagada, bloque vencido).` Es dinero ya cobrado: se respeta el bloque y no se cancela.
  La habitación pasa a DISPONIBLE (nunca se ocupó, no pide limpieza).
- **CHECKIN olvidada**: a los **30 min** de su hora de salida pasa a **FINALIZADA** con nota `[Auto] Check-out cerrado…`
  y la habitación a LIMPIEZA_PENDIENTE. Entre la hora de salida y esos 30 min la reserva se marca **`excedida`**
  (recepción la ve con la etiqueta "Excedida" y puede hacer Check-out o Extender).
- **PENDIENTE sin confirmar en 15 min** → CANCELADA (ya existía, `cancelarPendientesVencidas`).

Estos cierres asignan el estado **directamente** (como `cancelarPendientesVencidas`), sin pasar por
`TransicionEstados`: son del sistema, no cambios manuales. Por eso `CONFIRMADA → FINALIZADA` sigue
siendo ilegal para un cambio manual (PATCH).

### Extender (`POST /api/v1/reservas/{id}/extender`)

Body: `{"horas": 1..12, "monto": 41.67}` (`monto` opcional).
- Mueve `horaSalidaProgramada` y `fechaCheckOut`, suma el cobro a `totalPago` y agrega una nota `Extensión +N h (S/ X)`.
- Cobro por defecto: `precioBloque * horas / 6` (se asume bloque base de 6 h). Recepción puede enviar otro `monto`.
- Rechaza si otra reserva PENDIENTE/CONFIRMADA de la misma habitación empieza antes del nuevo fin.

## 2. Contrato de la API

- `PUT /api/v1/reservas/{id}` — edición. Solo se envían los campos a cambiar (los nulos se ignoran).
  Para cambiar de habitación: `"habitacion": {"id": N}`.
- `PATCH /api/v1/reservas/{id}/estado` — cambia el estado (`TransicionEstados`); cancelar aplica la regla de 3 h.
- `POST /api/v1/reservas/{id}/extender` — ver arriba.
- Códigos: **409** = regla/transición no permitida (el cuerpo es un texto legible para mostrar al usuario);
  **400** = datos inválidos; **403** = rol sin permiso; **401** = sin sesión.
- Cada reserva en el JSON trae campos **calculados** (solo lectura): `puedeEditar`, `motivoNoEditable`,
  `puedeCancelar`, `motivoNoCancelable`, `excedida`. El frontend solo los lee para activar/desactivar botones;
  **la regla real siempre la valida el backend**.

## 3. Mapa del código

Backend (`backend/src/main/java/com/wimbledon/backend/`)
- `services/ReglasReserva.java` — **única fuente de verdad** de las reglas de tiempo. Constantes
  `HORAS_ANTES_PARA_CANCELAR = 3` y `MINUTOS_TOLERANCIA_SALIDA = 30`. Para cambiar una regla, empezar aquí.
- `services/ReservaService.java` — `actualizarReserva`, `cambiarEstado`, `extenderReserva`, `cerrarReservasVencidas`,
  `liberarHabitacion`.
- `services/TransicionEstados.java` — ciclo de estados manual (sin cambios):
  `PENDIENTE → CONFIRMADA → CHECKIN → FINALIZADA`; `PENDIENTE/CONFIRMADA → CANCELADA`.
- `controllers/ReservaController.java` — endpoints; 409 para `TransicionInvalidaException`.
- `entities/Reserva.java` — getters calculados al final de la clase.

Frontend (`fronted/src/`)
- `services/api.js` — `camposEdicion()` (datos del formulario + banderas del servidor), `api.editarReserva`,
  `api.extenderReserva`. **Usar siempre `apiFetch`** (manda la cookie de sesión).
- `hooks/useEstadosEnVivo.js` — `acciones.editarReserva` y `acciones.extenderReserva` devuelven `{ok, error}`
  para que el modal muestre el error del servidor en vez de un `alert`.
- `components/modals/EditReservationModal.jsx` y `ExtendReservationModal.jsx`.
- `views/reception/ReceptionDashboard.jsx` y `views/admin/AdminDashboard.jsx` — botones desactivados con tooltip,
  etiqueta "Excedida", botón "+⏱" (extender).

## 4. Tests

- `ReglasReservaTest` (reglas puras) y casos nuevos en `ReservaServiceTest` (cierre automático, extender, bloqueos).
- Las fechas de los tests son **relativas a hoy** (antes eran fijas y caducaron al llegar esa fecha). No usar fechas fijas.
- Correr: `cd backend && mvn test`. `BackendApplicationTests` arranca el contexto completo y necesita MySQL
  (`wimbledon-mysql`). Si tu MySQL local no usa la contraseña de `application.properties`:
  `SPRING_DATASOURCE_PASSWORD=<tu clave> mvn test` (no la edites en el archivo).

## 5. Problemas conocidos que se encontraron (y qué se hizo)

1. **Jackson 3 devolvía 400** al enviar una reserva con `habitacion: {id}` (`Cannot map null into type boolean`)
   — pasaba también en `main` limpio. Se añadió `spring.jackson.deserialization.fail-on-null-for-primitives=false`
   en `application.properties`. Sin eso no se puede crear ni editar reservas con habitación.
2. **ENUM viejo en MySQL**: bases creadas antes de existir `RESERVADA` tienen `habitaciones.estado` sin ese valor
   (`ddl-auto=update` no modifica ENUMs) y fallan con `Data truncated for column 'estado'`. Arreglo manual:
   `ALTER TABLE habitaciones MODIFY estado ENUM('DISPONIBLE','RESERVADA','OCUPADA','LIMPIEZA_PENDIENTE','EN_PROCESO','LISTA','MANTENIMIENTO') NOT NULL;`
3. `normalizeReservation` (api.js) rellena con **datos inventados** cuando falta un campo (correo
   `huesped@wimbledon.com`, total 480, fechas de 2025). El formulario de edición usa `emailReal` / `telefonoReal`
   para no grabar esos valores falsos. Quien corrija la ficha del huésped debe tener el mismo cuidado.

## 6. Supuestos y pendientes (para quien continúe)

- **Supuesto: CONFIRMADA = ya pagó** (hay `metodoPago` y `numeroOperacion`). El código **no lo garantiza**:
  `POST /reservas/express` crea la reserva ya CONFIRMADA sin exigir pago. Si se quiere que el cierre de "no se
  presentó" sea fiable, hay que exigir el pago antes de confirmar.
- **Forma de pago**: implementada como PENDIENTE + N° de operación + confirmación manual de recepción. Ver `docs/forma-de-pago.md`. Sigue pendiente: `POST /reservas/express` crea la reserva CONFIRMADA sin exigir pago, y no hay pasarela real de tarjeta (Culqi, Niubiz, Izipay).
- **`DELETE /api/v1/reservas/{id}`** sigue permitiendo borrar cualquier reserva y se salta todas estas reglas.
- El cobro de la extensión (`precioBloque/6` por hora) es una propuesta; confirmar con el hotel.
- No hay cierre de caja ni reporte que distinga las FINALIZADAS por "no se presentó": solo se ve en `notasAdicionales`.

## 7. Cómo probar a mano

1. MySQL arriba (`docker start wimbledon-mysql`), backend en un puerto libre
   (`mvn spring-boot:run -Dspring-boot.run.arguments=--server.port=8090`), frontend con
   `BACKEND_URL=http://localhost:8090 VITE_API_URL=/api/v1 npx vite`.
2. Entrar como `admin@hotel.com` o `ana.torres@hotel.com` (usuarios sembrados por `DataInitializer`).
3. Crear reservas de prueba con fechas relativas a "ahora" (mañana, hace 1 h, dentro de 2 h, dentro de 4 h) y
   comprobar: editar/cancelar se bloquean según la tabla de la sección 1; una CHECKIN con salida vencida muestra
   "Excedida" y se cierra sola a los 30 min; una CONFIRMADA con bloque vencido pasa a FINALIZADA en ≤ 1 min.
4. Al terminar: borrar las reservas de prueba, restaurar el estado de las habitaciones y apagar servidores y túneles.
