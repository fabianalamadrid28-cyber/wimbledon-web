import { useCallback, useEffect, useRef, useState } from 'react';
import { api } from '../services/api';

const INTERVALO_MS = 5000;

/**
 * Mantiene habitaciones y reservas al día con el servidor (la única fuente de verdad).
 * - Consulta cada 5 s mientras la pestaña está visible; al volver a verla, consulta de inmediato.
 * - Los cambios de estado se mandan al servidor y el panel muestra lo que el servidor devuelve,
 *   nunca una copia local optimista. Si el servidor rechaza el cambio (409), se avisa y se refresca.
 */
export function useEstadosEnVivo({ onDatos, activo = true }) {
  const [error, setError] = useState(null);
  const [ultimaSync, setUltimaSync] = useState(null);
  const enCurso = useRef(false);
  const alDatos = useRef(onDatos);
  alDatos.current = onDatos;

  const refrescar = useCallback(async () => {
    if (enCurso.current) return;
    enCurso.current = true;
    try {
      const { rooms, reservas } = await api.refrescarTodo();
      alDatos.current(rooms, reservas);
      setError(null);
      setUltimaSync(new Date());
    } catch (e) {
      setError(e.message || 'Sin conexión con el servidor');
    } finally {
      enCurso.current = false;
    }
  }, []);

  useEffect(() => {
    if (!activo) return undefined;
    refrescar();
    const id = setInterval(() => { if (!document.hidden) refrescar(); }, INTERVALO_MS);
    const alVolver = () => { if (!document.hidden) refrescar(); };
    document.addEventListener('visibilitychange', alVolver);
    return () => { clearInterval(id); document.removeEventListener('visibilitychange', alVolver); };
  }, [activo, refrescar]);

  const ejecutar = useCallback(async (llamada) => {
    try {
      await llamada();
    } catch (e) {
      alert(`No se pudo cambiar el estado:\n${e.message}`);
    } finally {
      await refrescar();
    }
  }, [refrescar]);

  // Edición/extensión: el modal muestra el error del servidor, así que aquí no se usa alert
  const conResultado = useCallback(async (llamada) => {
    try {
      await llamada();
      return { ok: true };
    } catch (e) {
      return { ok: false, error: e.message };
    } finally {
      await refrescar();
    }
  }, [refrescar]);

  const acciones = {
    editarReserva: (id, datos) => conResultado(() => api.editarReserva(id, datos)),
    extenderReserva: (id, horas, monto) => conResultado(() => api.extenderReserva(id, horas, monto)),
    cambiarEstadoHabitacion: (id, estado) => ejecutar(() => api.updateEstadoHabitacion(id, estado)),
    cambiarEstadoReserva: (id, estado) => ejecutar(() => api.updateEstadoReserva(id, estado)),
  };

  return { error, ultimaSync, refrescar, acciones };
}
