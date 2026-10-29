import React from 'react';
import { X, Printer, Download, ZoomIn, ZoomOut, RotateCw } from 'lucide-react';

export default function PdfReportModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    alert("Descargando reporte_hotel_wimbledon.pdf...");
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-dialog pdf-viewer-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '850px' }}>
        {/* PDF Viewer Dark Toolbar */}
        <div className="pdf-toolbar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontWeight: '600' }}>reporte_hotel_wimbledon.pdf</span>
          </div>

          <div className="pdf-controls">
            <span style={{ color: '#94a3b8' }}>1 / 1</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'rgba(255,255,255,0.06)', borderRadius: '4px', padding: '2px 6px' }}>
              <button className="pdf-toolbar-btn" title="Alejar"><ZoomOut size={14} /></button>
              <span style={{ fontSize: '12px' }}>100%</span>
              <button className="pdf-toolbar-btn" title="Acercar"><ZoomIn size={14} /></button>
            </div>
            <button className="pdf-toolbar-btn" title="Rotar"><RotateCw size={14} /></button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button className="pdf-toolbar-btn" onClick={handlePrint} title="Imprimir"><Printer size={16} /></button>
            <button className="pdf-toolbar-btn" onClick={handleDownload} title="Descargar"><Download size={16} /></button>
            <button className="pdf-toolbar-btn" onClick={onClose} title="Cerrar"><X size={18} /></button>
          </div>
        </div>

        {/* PDF White Paper Page */}
        <div style={{ maxHeight: '80vh', overflowY: 'auto', padding: '20px', background: '#3b3e4a' }}>
          <div className="pdf-sheet">
            {/* Header with Wimbledon Brand */}
            <div className="pdf-hotel-header">
              <div style={{
                width: '46px',
                height: '46px',
                background: '#0c1e36',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '24px',
                fontFamily: 'serif',
                fontWeight: 'bold',
                borderRadius: '8px'
              }}>
                W
              </div>
              <div>
                <h2 style={{ margin: 0, fontSize: '20px', color: '#0c1e36' }}>Hotel Wimbledon</h2>
                <span style={{ fontSize: '12px', color: '#64748b' }}>San Miguel, Lima - Informes Ejecutivos</span>
              </div>
            </div>

            <div style={{ borderBottom: '2px solid #0c1e36', paddingBottom: '12px', marginBottom: '24px' }}>
              <h1 style={{ margin: '0 0 4px 0', fontSize: '22px', color: '#0f172a' }}>Reporte de Reservas</h1>
              <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>Del 01/07/2025 al 31/07/2025</p>
            </div>

            {/* General Summary */}
            <h3 style={{ fontSize: '15px', color: '#0f172a', marginBottom: '10px' }}>Resumen general</h3>
            <table className="pdf-table">
              <tbody>
                <tr>
                  <td style={{ fontWeight: '600', width: '60%' }}>Ingresos totales</td>
                  <td style={{ fontWeight: '700', color: '#2563eb' }}>S/ 28,450.00</td>
                </tr>
                <tr>
                  <td style={{ fontWeight: '600' }}>Reservas realizadas</td>
                  <td>42</td>
                </tr>
                <tr>
                  <td style={{ fontWeight: '600' }}>Ocupación promedio</td>
                  <td>65%</td>
                </tr>
              </tbody>
            </table>

            {/* Grid with Table and Chart */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '20px', marginTop: '24px' }}>
              <div>
                <h3 style={{ fontSize: '15px', color: '#0f172a', marginBottom: '10px' }}>Reservas por tipo de habitación</h3>
                <table className="pdf-table">
                  <thead>
                    <tr>
                      <th>Tipo de habitación</th>
                      <th>Reservas</th>
                      <th>Ocupación</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>Simple</td>
                      <td>15</td>
                      <td>55%</td>
                    </tr>
                    <tr>
                      <td>Doble</td>
                      <td>18</td>
                      <td>70%</td>
                    </tr>
                    <tr>
                      <td>Suite</td>
                      <td>9</td>
                      <td>80%</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div>
                <h3 style={{ fontSize: '15px', color: '#0f172a', marginBottom: '10px' }}>Ingresos por mes</h3>
                <div style={{ height: '140px', display: 'flex', alignItems: 'flex-end', gap: '8px', paddingBottom: '10px', borderBottom: '1px solid #cbd5e1' }}>
                  {[
                    { m: 'Ene', v: 40 },
                    { m: 'Feb', v: 55 },
                    { m: 'Mar', v: 70 },
                    { m: 'Abr', v: 65 },
                    { m: 'May', v: 80 },
                    { m: 'Jun', v: 75 },
                    { m: 'Jul', v: 95 }
                  ].map((item, idx) => (
                    <div key={idx} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                      <div style={{ width: '100%', height: `${item.v}%`, background: '#2563eb', borderRadius: '3px 3px 0 0' }}></div>
                      <span style={{ fontSize: '10px', color: '#64748b' }}>{item.m}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div style={{ marginTop: '40px', paddingTop: '16px', borderTop: '1px solid #e2e8f0', textAlign: 'center', fontSize: '12px', color: '#94a3b8' }}>
              Generado el 31/07/2025 - Hotel Wimbledon · Sistema de Gestión Hotelera
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

