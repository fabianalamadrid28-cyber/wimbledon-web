import React, { useEffect, useState } from 'react';
import { Timer, Clock, CheckCircle, Hourglass, RefreshCw } from 'lucide-react';
import { api } from '../services/api';
import { useAhora } from '../hooks/useAhora';
import { formatDuracion, formatFechaHora, formatHora, segundosDesde } from '../services/tiempos';

/**
 * Reporte de tiempos de limpieza: limpiezas en curso (cronómetro en vivo) e historial con la demora
 * de cada una y el promedio. Lo usan el panel de limpieza y el de administración.
 */
export default function TiemposLimpieza({ rooms = [], compact = false }) {
  const [resumen, setResumen] = useState({ registros: [], promedioSegundos: null, total: 0 });
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(true);
  const ahora = useAhora(1000);

  async function cargar() {
    try {
      const data = await api.listarLimpiezas();
      setResumen({
        registros: Array.isArray(data.registros) ? data.registros : [],
        promedioSegundos: data.promedioSegundos ?? null,
        total: data.total || 0
      });
      setError('');
    } catch (err) {
      setError(err.message || 'No se pudo cargar el historial de limpiezas.');
    } finally {
      setCargando(false);
    }
  }

  // Se recarga cada 15 s y cada vez que alguna habitación cambia de estado (p. ej. al terminar una limpieza)
  const firmaEstados = rooms.map(r => `${r.id}:${r.estado}`).join('|');
  useEffect(() => { cargar(); }, [firmaEstados]);
  useEffect(() => {
    const id = setInterval(() => { if (!document.hidden) cargar(); }, 15000);
    return () => clearInterval(id);
  }, []);

  const enCurso = rooms.filter(r => r.estado === 'EN_PROCESO');
  const ultima = resumen.registros[0];
  const registros = compact ? resumen.registros.slice(0, 8) : resumen.registros;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-card-top"><div className="kpi-icon-box blue"><Hourglass size={22} /></div></div>
          <span className="kpi-title">En curso ahora</span>
          <div className="kpi-value">{enCurso.length}</div>
          <span className="kpi-badge up" style={{ backgroundColor: '#dbeafe', color: '#1d4ed8' }}>Cronómetro activo</span>
        </div>
        <div className="kpi-card">
          <div className="kpi-card-top"><div className="kpi-icon-box green"><Timer size={22} /></div></div>
          <span className="kpi-title">Demora promedio</span>
          <div className="kpi-value" style={{ fontSize: '24px' }}>{formatDuracion(resumen.promedioSegundos)}</div>
          <span className="kpi-badge up">Últimas {resumen.total} limpiezas</span>
        </div>
        <div className="kpi-card">
          <div className="kpi-card-top"><div className="kpi-icon-box orange"><Clock size={22} /></div></div>
          <span className="kpi-title">Última limpieza</span>
          <div className="kpi-value" style={{ fontSize: '24px' }}>{ultima ? formatDuracion(ultima.duracionSegundos) : '—'}</div>
          <span className="kpi-badge" style={{ backgroundColor: '#fef3c7', color: '#b45309' }}>
            {ultima ? `Hab. ${ultima.habitacion}` : 'Sin registros'}
          </span>
        </div>
        <div className="kpi-card">
          <div className="kpi-card-top"><div className="kpi-icon-box green"><CheckCircle size={22} /></div></div>
          <span className="kpi-title">Limpiezas registradas</span>
          <div className="kpi-value">{resumen.total}</div>
          <span className="kpi-badge up">Terminadas</span>
        </div>
      </div>

      {enCurso.length > 0 && (
        <div className="dash-card" style={{ padding: '18px' }}>
          <div className="dash-card-header" style={{ marginBottom: '12px' }}>
            <h3 style={{ fontSize: '15px' }}>Limpiezas en curso</h3>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
            {enCurso.map(room => (
              <span key={room.id} className="limpieza-timer">
                <Timer size={14} /> Hab. {room.numero} · {formatDuracion(segundosDesde(room.limpiezaInicio, ahora))}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="dash-card" style={{ padding: '18px' }}>
        <div className="dash-card-header" style={{ marginBottom: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ fontSize: '15px' }}>Tiempo de demora por limpieza</h3>
          <button className="btn-secondary" onClick={cargar} aria-label="Actualizar tiempos">
            <RefreshCw size={14} className={cargando ? 'spin' : ''} /> Actualizar
          </button>
        </div>
        {error && <div className="soporte-error" role="alert">{error}</div>}
        {!error && registros.length === 0 && !cargando && (
          <p style={{ color: '#64748b', fontSize: '13px', margin: 0 }}>
            Aún no hay limpiezas terminadas. El tiempo se registra al pulsar «Iniciar Limpieza» y luego «Finalizar Aseo».
          </p>
        )}
        {registros.length > 0 && (
          <div style={{ overflowX: 'auto' }}>
            <table className="dash-table">
              <thead>
                <tr>
                  <th>Hab.</th>
                  <th>Personal</th>
                  <th>Inicio</th>
                  <th>Fin</th>
                  <th>Demora</th>
                  {!compact && <th>Observaciones</th>}
                </tr>
              </thead>
              <tbody>
                {registros.map(r => (
                  <tr key={r.id}>
                    <td><strong>{r.habitacion}</strong></td>
                    <td>{r.personal || '—'}</td>
                    <td>{formatFechaHora(r.inicio)}</td>
                    <td>{formatHora(r.fin)}</td>
                    <td><strong>{formatDuracion(r.duracionSegundos)}</strong></td>
                    {!compact && <td>{r.observaciones || '—'}</td>}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
