// Utilidades para mostrar tiempos de limpieza.

// El backend manda LocalDateTime como texto ISO o, según la configuración de Jackson, como arreglo [a, m, d, h, mi, s, ns].
export function parseFecha(valor) {
  if (!valor) return null;
  if (Array.isArray(valor)) {
    const [a, m, d, h = 0, mi = 0, s = 0] = valor;
    return new Date(a, m - 1, d, h, mi, s);
  }
  const fecha = new Date(valor);
  return Number.isNaN(fecha.getTime()) ? null : fecha;
}

export function segundosDesde(valor, ahora = Date.now()) {
  const inicio = parseFecha(valor);
  if (!inicio) return null;
  return Math.max(0, Math.floor((ahora - inicio.getTime()) / 1000));
}

// 750 -> "12 min 30 s"; 3900 -> "1 h 5 min"
export function formatDuracion(segundos) {
  if (segundos == null || Number.isNaN(segundos)) return '—';
  const total = Math.max(0, Math.round(segundos));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  if (h > 0) return `${h} h ${m} min`;
  if (m > 0) return `${m} min ${String(s).padStart(2, '0')} s`;
  return `${s} s`;
}

export function formatHora(valor) {
  const fecha = parseFecha(valor);
  return fecha ? fecha.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' }) : '—';
}

export function formatFechaHora(valor) {
  const fecha = parseFecha(valor);
  return fecha
    ? fecha.toLocaleString('es-PE', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })
    : '—';
}
