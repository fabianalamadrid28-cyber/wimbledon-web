import React, { useState, useEffect } from 'react';
import { X, Camera } from 'lucide-react';

export default function EditRoomModal({ isOpen, onClose, room, onSave }) {
  const [formData, setFormData] = useState({
    numero: '',
    tipo: 'Suite',
    precioBloque: 250,
    capacidad: 2,
    estado: 'DISPONIBLE',
    descripcion: '',
    urlImagen: '/suite-jacuzzi.jpg'
  });

  useEffect(() => {
    if (room) {
      setFormData({
        numero: room.numero || '',
        tipo: room.tipo || 'Suite',
        precioBloque: room.precioBloque || 250,
        capacidad: room.capacidad || 2,
        estado: room.estado || 'DISPONIBLE',
        descripcion: room.descripcion || 'Habitación suite con vista a la ciudad, cama king, TV y minibar.',
        urlImagen: room.urlImagen || '/suite-jacuzzi.jpg'
      });
    }
  }, [room]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageCycle = () => {
    const images = ['/suite-simple.jpg', '/suite-tematica.jpg', '/suite-vip.jpg', '/suite-jacuzzi.jpg', '/suite-sauna.jpg', '/suite-cochera.jpg'];
    const nextIndex = (images.indexOf(formData.urlImagen) + 1) % images.length;
    setFormData(prev => ({ ...prev, urlImagen: images[nextIndex] }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({ ...room, ...formData, precioBloque: parseFloat(formData.precioBloque) });
    onClose();
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-dialog" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '640px' }}>
        <div className="modal-header">
          <h3>{room?.id ? 'Editar habitación' : 'Nueva habitación'}</h3>
          <button className="btn-action-icon" onClick={onClose}><X size={20} /></button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-grid-2">
              {/* Left Column */}
              <div>
                <div className="form-group">
                  <label>Tipo de habitación</label>
                  <select 
                    className="form-control" 
                    name="tipo" 
                    value={formData.tipo} 
                    onChange={handleChange}
                  >
                    <option value="Simple">Simple</option>
                    <option value="Doble">Doble</option>
                    <option value="Suite">Suite</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Número</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    name="numero" 
                    value={formData.numero} 
                    onChange={handleChange} 
                    required 
                  />
                </div>

                <div className="form-group">
                  <label>Precio por noche (S/)</label>
                  <input 
                    type="number" 
                    className="form-control" 
                    name="precioBloque" 
                    value={formData.precioBloque} 
                    onChange={handleChange} 
                    step="0.01" 
                    required 
                  />
                </div>

                <div className="form-group">
                  <label>Capacidad</label>
                  <input 
                    type="number" 
                    className="form-control" 
                    name="capacidad" 
                    value={formData.capacidad} 
                    onChange={handleChange} 
                    min="1" 
                    max="6" 
                  />
                </div>

                <div className="form-group">
                  <label>Estado</label>
                  <select 
                    className="form-control" 
                    name="estado" 
                    value={formData.estado} 
                    onChange={handleChange}
                  >
                    <option value="DISPONIBLE">Disponible</option>
                    <option value="OCUPADA">Ocupada</option>
                    <option value="MANTENIMIENTO">Mantenimiento</option>
                    <option value="LIMPIEZA_PENDIENTE">Limpieza Pendiente</option>
                  </select>
                </div>
              </div>

              {/* Right Column */}
              <div>
                <div className="form-group">
                  <label>Descripción</label>
                  <textarea 
                    className="form-control" 
                    name="descripcion" 
                    rows={4} 
                    value={formData.descripcion} 
                    onChange={handleChange}
                  ></textarea>
                </div>

                <div className="form-group">
                  <label>Imagen de la habitación</label>
                  <div style={{
                    position: 'relative',
                    height: '140px',
                    borderRadius: '8px',
                    overflow: 'hidden',
                    backgroundColor: '#1e293b',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <img 
                      src={formData.urlImagen} 
                      alt="Habitación" 
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      onError={(e) => { e.target.style.display = 'none'; }}
                    />
                    <button 
                      type="button" 
                      onClick={handleImageCycle}
                      style={{
                        position: 'absolute',
                        bottom: '8px',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        background: 'rgba(15, 23, 42, 0.85)',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '6px',
                        padding: '6px 12px',
                        fontSize: '12px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                    >
                      <Camera size={14} /> Cambiar imagen
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn-secondary" onClick={onClose}>Cancelar</button>
            <button type="submit" className="btn-primary">Guardar cambios</button>
          </div>
        </form>
      </div>
    </div>
  );
}

