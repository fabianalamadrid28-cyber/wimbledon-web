import React, { useEffect, useMemo, useState } from 'react';
import {
  Wrench,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Loader2,
  Search
} from 'lucide-react';
import SoporteForm from '../../components/SoporteForm';
import { api } from '../../services/api';

const FILTROS = [
  { key: 'TODOS', label: 'Todos' },
  { key: 'PENDIENTE', label: 'Pendientes' },
  { key: 'EN_ATENCION', label: 'En atención' },
  { key: 'RESUELTOS', label: 'Resueltos' },
  { key: 'CLIENTE', label: 'De clientes' },
  { key: 'LIMPIEZA', label: 'De limpieza' }
];

const PRIORIDAD_CLASE = {
  ALTA: 'soporte-prioridad alta',
  MEDIA: 'soporte-prioridad media',
  BAJA: 'soporte-prioridad baja'
};

const ESTADO_CLASE = {
  PENDIENTE: 'soporte-estado pendiente',
  EN_ATENCION: 'soporte-estado en-atencion',
  RESUELTO: 'soporte-estado resuelto'
};

function fmtFecha(value) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export default function SoportePanel({ rooms = [], initialRoom = '' }) {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState('');
  const [filtro, setFiltro] = useState('TODOS');
  const [search, setSearch] = useState('');

  async function reload() {
    setLoading(true);
    try {
      const data = await api.listarReportesSoporte();
      setReports(Array.isArray(data) ? data : []);
      setError('');
    } catch (err) {
      setError(err.message || 'No se pudieron cargar los reportes de soporte.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { reload(); }, []);

  async function moverEstado(id, estado) {
    setUpdating(true);
    try {
      await api.actualizarEstadoReporteSoporte(id, estado);
      await reload();
    } catch (err) {
      setError(err.message || 'No se pudo actualizar el estado.');
    } finally {
      setUpdating(false);
    }
  }

  const filtrados = useMemo(() => {
    const q = search.trim().toLowerCase();
    return reports.filter((reporte) => {
      if (filtro === 'CLIENTE' && reporte.origen !== 'CLIENTE') return false;
      if (filtro === 'LIMPIEZA' && reporte.origen !== 'LIMPIEZA') return false;
      if (filtro === 'PENDIENTE' && reporte.estado !== 'PENDIENTE') return false;
      if (filtro === 'EN_ATENCION' && reporte.estado !== 'EN_ATENCION') return false;
      if (filtro === 'RESUELTOS' && reporte.estado !== 'RESUELTO') return false;
      if (!q) return true;
      return [reporte.habitacion, reporte.categoria, reporte.descripcion, reporte.contacto, reporte.nombreContacto]
        .some((value) => String(value || '').toLowerCase().includes(q));
    });
  }, [reports, filtro, search]);

  const pendientes = reports.filter((r) => r.estado === 'PENDIENTE').length;
  const enAtencion = reports.filter((r) => r.estado === 'EN_ATENCION').length;
  const resueltos = reports.filter((r) => r.estado === 'RESUELTO').length;

  return (
    <div className="soporte-panel">
      <div className="dash-page-header">
        <div>
          <h1><Wrench size={24} style={{ verticalAlign: '-3px', marginRight: '8px' }} />Soporte de habitaciones</h1>
          <p>Bandeja compartida con clientes y personal de limpieza para atender inconvenientes en las habitaciones.</p>
        </div>
        <button className="btn-secondary" onClick={reload} disabled={loading} aria-label="Actualizar lista">
          <RefreshCw size={16} className={loading ? 'spin' : ''} /> Actualizar
        </button>
      </div>

      <div className="soporte-summary" aria-label="Resumen de reportes">
        <div className="soporte-summary-item pendiente">
          <AlertTriangle size={20} />
          <div><span>Pendientes</span><strong>{pendientes}</strong></div>
        </div>
        <div className="soporte-summary-item en-atencion">
          <Clock size={20} />
          <div><span>En atención</span><strong>{enAtencion}</strong></div>
        </div>
        <div className="soporte-summary-item resuelto">
          <CheckCircle2 size={20} />
          <div><span>Resueltos</span><strong>{resueltos}</strong></div>
        </div>
      </div>

      <div className="soporte-layout">
        <section className="dash-card soporte-form-shell">
          <SoporteForm
            origen="LIMPIEZA"
            rooms={rooms}
            initialRoom={initialRoom}
            compact
            onCreated={() => reload()}
          />
        </section>

        <section className="dash-card soporte-list-shell">
          <div className="soporte-list-header">
            <h3>Bandeja de reportes</h3>
            <div className="soporte-search">
              <Search size={16} />
              <input
                type="search"
                placeholder="Buscar por habitación, problema, contacto..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                aria-label="Buscar reportes"
              />
            </div>
          </div>

          <div className="soporte-filters" role="tablist" aria-label="Filtrar reportes">
            {FILTROS.map((f) => (
              <button
                key={f.key}
                role="tab"
                aria-selected={filtro === f.key}
                className={`soporte-filter${filtro === f.key ? ' active' : ''}`}
                onClick={() => setFiltro(f.key)}
              >
                {f.label}
              </button>
            ))}
          </div>

          {error && <div className="soporte-error" role="alert">{error}</div>}
          {loading && (
            <div className="soporte-loading"><Loader2 size={22} className="spin" /> Cargando reportes...</div>
          )}
          {!loading && filtrados.length === 0 && (
            <div className="soporte-empty"><Wrench size={28} /><p>{search ? 'Sin coincidencias para tu búsqueda.' : 'Aún no hay reportes de soporte.'}</p></div>
          )}

          <ul className="soporte-list">
            {filtrados.map((reporte) => (
              <li key={reporte.id} className="soporte-card">
                <div className="soporte-card-top">
                  <div className="soporte-card-title">
                    <span className="soporte-id">#{reporte.id}</span>
                    <strong>Hab. {reporte.habitacion}</strong>
                    <span className={reporte.origen === 'LIMPIEZA' ? 'soporte-origen limpieza' : 'soporte-origen cliente'}>
                      {reporte.origen === 'LIMPIEZA' ? 'Limpieza' : 'Cliente'}
                    </span>
                  </div>
                  <div className="soporte-badges">
                    <span className={PRIORIDAD_CLASE[reporte.prioridad] || 'soporte-prioridad'}>{reporte.prioridad}</span>
                    <span className={ESTADO_CLASE[reporte.estado] || 'soporte-estado'}>{String(reporte.estado).replace('_', ' ')}</span>
                  </div>
                </div>
                <p className="soporte-categoria">{reporte.categoria}</p>
                <p className="soporte-descripcion">{reporte.descripcion}</p>
                <div className="soporte-meta">
                  {reporte.nombreContacto && <span><strong>Reporta:</strong> {reporte.nombreContacto}</span>}
                  {reporte.contacto && (
                    <a href={reporte.contacto.includes('@') ? `mailto:${reporte.contacto}` : `tel:${reporte.contacto.replace(/\s/g, '')}`}>
                      {reporte.contacto}
                    </a>
                  )}
                  <span className="soporte-fecha">{fmtFecha(reporte.creadoEn)}</span>
                </div>
                <div className="soporte-card-actions">
                  {reporte.estado === 'PENDIENTE' && (
                    <button className="btn-secondary" disabled={updating} onClick={() => moverEstado(reporte.id, 'EN_ATENCION')}>Marcar en atención</button>
                  )}
                  {reporte.estado === 'EN_ATENCION' && (
                    <button className="btn-primary" disabled={updating} onClick={() => moverEstado(reporte.id, 'RESUELTO')}>Resolver</button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
