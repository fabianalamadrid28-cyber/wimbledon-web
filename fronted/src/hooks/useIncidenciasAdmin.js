import { useCallback, useEffect, useRef, useState } from 'react';
import { api } from '../services/api';

const INTERVALO_MS = 10000;

/**
 * Avisa a administración de las incidencias que reportan los clientes.
 * - Consulta cada 10 s las incidencias de clientes aún no revisadas.
 * - Por cada incidencia nueva dispara una notificación (campanita); al abrir el panel avisa
 *   cuántas hay pendientes. `pendientes` alimenta el contador de la barra lateral.
 */
export function useIncidenciasAdmin({ activo = true, onNueva }) {
  const [pendientes, setPendientes] = useState(0);
  const vistas = useRef(null); // null hasta la primera carga
  const alNueva = useRef(onNueva);
  alNueva.current = onNueva;

  const recargar = useCallback(async () => {
    try {
      const lista = await api.listarIncidenciasEscaladas();
      if (!Array.isArray(lista)) return;
      setPendientes(lista.length);

      if (vistas.current === null) {
        vistas.current = new Set(lista.map((r) => r.id));
        if (lista.length > 0) {
          alNueva.current?.({
            tipo: 'incidencia',
            titulo: 'Incidencias de clientes por revisar',
            mensaje: `Hay ${lista.length} incidencia${lista.length === 1 ? '' : 's'} reportada${lista.length === 1 ? '' : 's'} por clientes esperando revisión.`
          });
        }
        return;
      }

      const nuevas = lista.filter((r) => !vistas.current.has(r.id));
      nuevas.forEach((r) => vistas.current.add(r.id));
      nuevas.slice(0, 3).forEach((r) => alNueva.current?.({
        tipo: 'incidencia',
        titulo: `Incidencia de cliente · Hab. ${r.habitacion}`,
        mensaje: `${r.categoria} (prioridad ${r.prioridad}): ${r.descripcion}`.slice(0, 140)
      }));
      if (nuevas.length > 3) {
        alNueva.current?.({
          tipo: 'incidencia',
          titulo: 'Más incidencias de clientes',
          mensaje: `Llegaron ${nuevas.length - 3} incidencias más. Revísalas en la pestaña Incidencias.`
        });
      }
    } catch (e) {
      // Sin conexión en este ciclo: se reintenta en el siguiente
    }
  }, []);

  useEffect(() => {
    if (!activo) return undefined;
    recargar();
    const id = setInterval(() => { if (!document.hidden) recargar(); }, INTERVALO_MS);
    return () => clearInterval(id);
  }, [activo, recargar]);

  return { pendientes, recargar };
}
