import React, { useEffect, useState } from 'react';
import { Plus, Edit2 } from 'lucide-react';
import { api } from '../../services/api';

const ROLES = [
  { value: 'RECEPCIONISTA', label: 'Recepcionista' },
  { value: 'LIMPIEZA', label: 'Limpieza' }
];
const ROL_LABEL = { SUPER_ADMIN: 'Administrador', ADMINISTRADOR: 'Administrador', RECEPCIONISTA: 'Recepcionista', LIMPIEZA: 'Limpieza' };
const EMPTY = { email: '', nombreCompleto: '', telefono: '', rol: 'RECEPCIONISTA', password: '', activo: true };

export default function UsuariosManagement() {
  const [usuarios, setUsuarios] = useState([]);
  const [error, setError] = useState('');
  const [form, setForm] = useState(null); // null = cerrado
  const [editId, setEditId] = useState(null);
  const [saving, setSaving] = useState(false);

  const cargar = async () => {
    try { setUsuarios(await api.getUsuarios()); setError(''); }
    catch (e) { setError(e.message); }
  };
  useEffect(() => { cargar(); }, []);

  const abrirNuevo = () => { setEditId(null); setForm({ ...EMPTY }); setError(''); };
  const abrirEditar = (u) => {
    setEditId(u.id);
    setForm({ email: u.email, nombreCompleto: u.nombre, telefono: u.telefono || '', rol: u.rol, password: '', activo: u.activo });
    setError('');
  };

  const guardar = async (e) => {
    e.preventDefault();
    setSaving(true); setError('');
    try {
      if (editId) await api.updateUsuario(editId, form);
      else await api.createUsuario(form);
      setForm(null);
      await cargar();
    } catch (err) { setError(err.message); }
    finally { setSaving(false); }
  };

  const alternarActivo = async (u) => {
    try { await api.updateUsuario(u.id, { activo: !u.activo }); await cargar(); }
    catch (err) { setError(err.message); }
  };

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value });

  return (
    <div>
      <div className="dash-page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>Gestión de Usuarios</h2>
        <button className="btn-primary" onClick={abrirNuevo} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Plus size={16} /> Nuevo usuario
        </button>
      </div>

      {error && !form && <p style={{ color: '#dc2626', fontSize: '14px' }}>{error}</p>}

      <div className="dash-card">
        <table className="dash-table">
          <thead>
            <tr><th>Nombre</th><th>Correo</th><th>Rol</th><th>Estado</th><th>Acciones</th></tr>
          </thead>
          <tbody>
            {usuarios.map((u) => (
              <tr key={u.id}>
                <td>{u.nombre}</td>
                <td>{u.email}</td>
                <td>{ROL_LABEL[u.rol] || u.rol}</td>
                <td>{u.activo ? 'Activo' : 'Inactivo'}</td>
                <td>
                  {u.editable ? (
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button className="btn-action-icon" title="Editar" onClick={() => abrirEditar(u)}><Edit2 size={16} /></button>
                      <button className="btn-secondary" onClick={() => alternarActivo(u)}>{u.activo ? 'Desactivar' : 'Activar'}</button>
                    </div>
                  ) : <span style={{ color: '#94a3b8', fontSize: '12px' }}>Protegido</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {form && (
        <div className="modal-backdrop" onClick={() => setForm(null)}>
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '480px' }}>
            <form onSubmit={guardar}>
              <div className="modal-header"><h3>{editId ? 'Editar usuario' : 'Nuevo usuario'}</h3></div>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div className="form-group"><label>Nombre completo</label>
                  <input required value={form.nombreCompleto} onChange={set('nombreCompleto')} /></div>
                <div className="form-group"><label>Correo electrónico</label>
                  <input required type="email" value={form.email} onChange={set('email')} /></div>
                <div className="form-group"><label>Teléfono</label>
                  <input value={form.telefono} onChange={set('telefono')} /></div>
                <div className="form-group"><label>Rol</label>
                  <select value={form.rol} onChange={set('rol')}>
                    {ROLES.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
                  </select></div>
                <div className="form-group"><label>{editId ? 'Nueva contraseña (vacío = no cambiar)' : 'Contraseña (mín. 8 caracteres)'}</label>
                  <input type="password" minLength={editId ? undefined : 8} required={!editId} value={form.password} onChange={set('password')} autoComplete="new-password" /></div>
                {editId && (
                  <label style={{ fontSize: '14px' }}><input type="checkbox" checked={form.activo} onChange={set('activo')} /> Cuenta activa</label>
                )}
                {error && <p style={{ color: '#dc2626', fontSize: '13px', margin: 0 }}>{error}</p>}
              </div>
              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={() => setForm(null)}>Cancelar</button>
                <button type="submit" className="btn-primary" disabled={saving}>{saving ? 'Guardando...' : 'Guardar'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
