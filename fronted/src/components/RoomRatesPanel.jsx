import { ArrowRight } from 'lucide-react';

export default function RoomRatesPanel({ room, selectedDate, onSelectDate, onBook }) {
  const basePrice = Number(room.desde.replace('S/ ', ''));

  return (
                <div className="calendar-dropdown-box">
                  <div className="calendars-flex-container">
                    <div className="month-box">
                      <h4>Octubre 2026</h4>
                      <div className="calendar-grid-header">
                        <span>Do</span><span>Lu</span><span>Ma</span><span>Mi</span><span>Ju</span><span>Vi</span><span>Sá</span>
                      </div>
                      <div className="calendar-days-grid">
                        <span></span><span></span><span></span><span></span>
                        <span className="day" onClick={() => onSelectDate('01/10/2026')}>1</span>
                        <span className="day" onClick={() => onSelectDate('02/10/2026')}>2</span>
                        <span className="day" onClick={() => onSelectDate('03/10/2026')}>3</span>
                        <span className="day" onClick={() => onSelectDate('04/10/2026')}>4</span>
                        <span className="day" onClick={() => onSelectDate('05/10/2026')}>5</span>
                        <span className="day" onClick={() => onSelectDate('06/10/2026')}>6</span>
                        <span className="day" onClick={() => onSelectDate('07/10/2026')}>7</span>
                        <span className="day" onClick={() => onSelectDate('08/10/2026')}>8</span>
                        <span className="day" onClick={() => onSelectDate('09/10/2026')}>9</span>
                        <span className="day" onClick={() => onSelectDate('10/10/2026')}>10</span>
                        <span className="day" onClick={() => onSelectDate('11/10/2026')}>11</span>
                        <span className="day" onClick={() => onSelectDate('12/10/2026')}>12</span>
                        <span className="day" onClick={() => onSelectDate('13/10/2026')}>13</span>
                        <span className="day" onClick={() => onSelectDate('14/10/2026')}>14</span>
                        <span className="day" onClick={() => onSelectDate('15/10/2026')}>15</span>
                        <span className="day" onClick={() => onSelectDate('16/10/2026')}>16</span>
                        <span className="day" onClick={() => onSelectDate('17/10/2026')}>17</span>
                        <span className="day" onClick={() => onSelectDate('18/10/2026')}>18</span>
                        <span className="day" onClick={() => onSelectDate('19/10/2026')}>19</span>
                        <span className="day" onClick={() => onSelectDate('20/10/2026')}>20</span>
                        <span className="day" onClick={() => onSelectDate('21/10/2026')}>21</span>
                        <span className="day" onClick={() => onSelectDate('22/10/2026')}>22</span>
                        <span className="day" onClick={() => onSelectDate('23/10/2026')}>23</span>
                        <span className="day" onClick={() => onSelectDate('24/10/2026')}>24</span>
                        <span className="day" onClick={() => onSelectDate('25/10/2026')}>25</span>
                        <span className="day" onClick={() => onSelectDate('26/10/2026')}>26</span>
                        <span className="day today" onClick={() => onSelectDate('29/10/2026')}>29</span>
                        <span className="day" onClick={() => onSelectDate('30/10/2026')}>30</span>
                        <span className="day" onClick={() => onSelectDate('31/10/2026')}>31</span>
                      </div>
                    </div>

                    <div className="month-box">
                      <h4>Noviembre 2026</h4>
                      <div className="calendar-grid-header">
                        <span>Do</span><span>Lu</span><span>Ma</span><span>Mi</span><span>Ju</span><span>Vi</span><span>Sá</span>
                      </div>
                      <div className="calendar-days-grid">
                        <span className="day" onClick={() => onSelectDate('01/11/2026')}>1</span>
                        <span className="day" onClick={() => onSelectDate('02/11/2026')}>2</span>
                        <span className="day" onClick={() => onSelectDate('03/11/2026')}>3</span>
                        <span className="day" onClick={() => onSelectDate('04/11/2026')}>4</span>
                        <span className="day" onClick={() => onSelectDate('05/11/2026')}>5</span>
                        <span className="day" onClick={() => onSelectDate('06/11/2026')}>6</span>
                        <span className="day" onClick={() => onSelectDate('07/11/2026')}>7</span>
                        <span className="day" onClick={() => onSelectDate('08/11/2026')}>8</span>
                        <span className="day" onClick={() => onSelectDate('09/11/2026')}>9</span>
                        <span className="day" onClick={() => onSelectDate('10/11/2026')}>10</span>
                        <span className="day" onClick={() => onSelectDate('11/11/2026')}>11</span>
                        <span className="day" onClick={() => onSelectDate('12/11/2026')}>12</span>
                        <span className="day" onClick={() => onSelectDate('13/11/2026')}>13</span>
                        <span className="day" onClick={() => onSelectDate('14/11/2026')}>14</span>
                        <span className="day" onClick={() => onSelectDate('15/11/2026')}>15</span>
                      </div>
                    </div>
                  </div>

                  {/* Banner si hace clic en un día del calendario */}
                  {selectedDate && (
                    <div className="calendar-action-banner">
                      <div>
                        <span style={{ fontSize: '11px', color: '#D4AF37', fontWeight: 'bold', textTransform: 'uppercase' }}>FECHA SELECCIONADA</span>
                        <div style={{ color: '#ffffff', fontWeight: 600 }}>Día {selectedDate} en {room.nombre}</div>
                      </div>
                      <button 
                        className="btn-book-rate"
                        onClick={() => onBook({ room, date: selectedDate.split('/').reverse().join('-') })}
                      >
                        Reservar para esta Fecha <ArrowRight size={14} />
                      </button>
                    </div>
                  )}

                  {/* Bloques de Tarifas Disponibles */}
                  <div className="rates-block-options">
                    <div className="rate-option-card">
                      <div className="rate-option-header">
                        <span className="rate-option-name">Bloque 6 Horas</span>
                        <span className="rate-option-price">{room.desde}</span>
                      </div>
                      <p className="rate-option-desc">Ideal para una estadía corta y reconfortante. Incluye amenidades y cochera.</p>
                      <button 
                        className="btn-book-rate"
                        onClick={() => onBook({ room, rate: '6 HORAS' })}
                      >
                        Reservar Tarifa (6h)
                      </button>
                    </div>

                    <div className="rate-option-card">
                      <div className="rate-option-header">
                        <span className="rate-option-name">Bloque 12 Horas</span>
                        <span className="rate-option-price">S/ {(Number(room.desde.replace('S/ ', '')) + 50).toFixed(2)}</span>
                      </div>
                      <p className="rate-option-desc">Mediodía de descanso pleno con room service y late check-out disponible.</p>
                      <button 
                        className="btn-book-rate"
                        onClick={() => onBook({ room, rate: '12 HORAS' })}
                      >
                        Reservar Tarifa (12h)
                      </button>
                    </div>

                    <div className="rate-option-card">
                      <div className="rate-option-header">
                        <span className="rate-option-name">Pernocte Completo</span>
                        <span className="rate-option-price">S/ {(Number(room.desde.replace('S/ ', '')) + 90).toFixed(2)}</span>
                      </div>
                      <p className="rate-option-desc">Noche completa de descanso ininterrumpido hasta el mediodía siguiente.</p>
                      <button 
                        className="btn-book-rate"
                        onClick={() => onBook({ room, rate: 'PERNOCTE' })}
                      >
                        Reservar Pernocte
                      </button>
                    </div>
                  </div>
                </div>
  );
}
