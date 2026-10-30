import { useEffect } from 'react';
import { api } from './api';

// Mantiene habitaciones y reservas al día con el backend (carga inicial + sondeo)
export default function useLiveSync(setRooms, setReservations, { enabled = true, intervalMs = 10000 } = {}) {
  useEffect(() => {
    if (!enabled) return;
    let activo = true;
    const sync = () => {
      if (document.hidden) return;
      api.syncAll(
        (v) => activo && setRooms(v),
        (v) => activo && setReservations(v)
      );
    };
    sync();
    const timer = setInterval(sync, intervalMs);
    return () => { activo = false; clearInterval(timer); };
  }, [enabled, intervalMs, setRooms, setReservations]);
}
