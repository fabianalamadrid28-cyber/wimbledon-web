# Precios por modalidad e inventario de habitaciones

Rama: `fix/precios-y-habitaciones` (basada en `main`).

## 1. Precios al registrar una reserva

La tarifa guardada en cada habitación (`precioBloque`) es la del **bloque base de 6 HORAS**.
Las demás modalidades se calculan con un recargo fijo:

| Modalidad | Precio |
|---|---|
| Bloque 6 horas | `precioBloque` |
| Bloque 12 horas | `precioBloque + 50` |
| Pernocte / 24 horas | `precioBloque + 90` |

Antes el formulario de reserva aplicaba multiplicadores (`×0.65` y `×0.85`), por lo que el
total no coincidía con las tarifas publicadas en la web y terminaba mostrando solo el precio base.

Ahora la regla vive en un único módulo: `fronted/src/services/precios.js`
(`calcularPrecioBloque`). Lo usan:

- `fronted/src/components/modals/BookingModal.jsx` (total de la reserva y selector de modalidad)
- `fronted/src/components/RoomRatesPanel.jsx` (tarjetas de tarifas)
- `fronted/src/App.jsx` (tarjetas de tarifas de la página pública)

Para cambiar un recargo, editar solo `RECARGOS_BLOQUE` en `precios.js`.

## 2. Inventario: 150 habitaciones (50 por piso)

Las pantallas indicaban 150 habitaciones y 50 por piso, pero la base de datos solo tenía
las 12 habitaciones sembradas por `DataInitializer`. Ahora
`backend/.../config/InventarioHabitacionesConfig.java` completa el inventario al arrancar:

- Inserta únicamente los números de habitación que faltan (101-150, 201-250, 301-350).
- Nunca modifica ni elimina habitaciones existentes, por lo que es seguro en cualquier BD
  y no interfiere con otras ramas.
- Se ejecuta al final del arranque (evento `ApplicationReadyEvent`), después de `DataInitializer`.
- Es idempotente: en arranques posteriores no inserta nada si ya están las 150.

El catálogo (temáticas, precios y características) es el mismo de
`fronted/src/services/api.js` (`buildInitialRooms`).

## 3. Cómo verificar

```powershell
# Backend
cd backend
.\mvnw.cmd spring-boot:run

# En otra consola
$rooms = Invoke-RestMethod http://localhost:8080/api/v1/habitaciones
$rooms.Count                      # 150
$rooms | Group-Object piso | % { "$($_.Name): $($_.Count)" }   # 1:50, 2:50, 3:50
```

En la web (`npm run dev` en `fronted`), abrir una suite, elegir tarifa y comprobar:

- 6 h: precio base
- 12 h: base + 50
- Pernocte: base + 90

En Recepción → Habitaciones debe mostrarse **50 por piso** y **150 en total**.
