import { useMemo, useState } from 'react';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';

const MESES = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
const DIAS = ['Do', 'Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sá'];
const pad = (n) => String(n).padStart(2, '0');
const dateKey = (d) => `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
const atMidnight = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
const dateFromKey = (key) => {
  const [d, m, y] = key.split('/').map(Number);
  return new Date(y, m - 1, d);
};
const addMonths = (base, amount) => new Date(base.getFullYear(), base.getMonth() + amount, 1);

export default function RoomRatesPanel({ room, selectedDate, onSelectDate, onBook }) {
  const today = atMidnight(new Date());
  const start = new Date(today.getFullYear(), today.getMonth(), 1);
  const mesesDisponibles = useMemo(() => Array.from({ length: 12 }, (_, i) => addMonths(start, i)), []);
  const [monthOffset, setMonthOffset] = useState(0);

  const month = addMonths(start, monthOffset);
  const daysInMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
  const leadingBlanks = new Date(month.getFullYear(), month.getMonth(), 1).getDay();
  const monthLabel = `${MESES[month.getMonth()]} ${month.getFullYear()}`;

  const basePrice = Number(String(room.desde).replace('S/ ', ''));
  const selected = selectedDate ? atMidnight(dateFromKey(selectedDate)) : null;
  const isSelectable = (day) => new Date(month.getFullYear(), month.getMonth(), day) >= today;

  const selectDay = (day) => {
    if (!isSelectable(day)) return;
    onSelectDate(dateKey(new Date(month.getFullYear(), month.getMonth(), day)));
  };

  return (
    <div className="calendar-dropdown-box">
      <div className="month-selector" role="group" aria-label="Elegir mes">
        <button
          type="button"
          className="month-nav"
          aria-label="Mes anterior"
          disabled={monthOffset === 0}
          onClick={() => setMonthOffset((value) => Math.max(0, value - 1))}
        >
          <ChevronLeft size={20} />
        </button>

        <select
          className="month-select"
          value={monthOffset}
          onChange={(event) => setMonthOffset(Number(event.target.value))}
          aria-label="Mes de la reserva"
        >
          {mesesDisponibles.map((m, index) => (
            <option key={index} value={index}>
              {MESES[m.getMonth()]} {m.getFullYear()}
            </option>
          ))}
        </select>

        <button
          type="button"
          className="month-nav"
          aria-label="Mes siguiente"
          disabled={monthOffset === mesesDisponibles.length - 1}
          onClick={() => setMonthOffset((value) => Math.min(mesesDisponibles.length - 1, value + 1))}
        >
          <ChevronRight size={20} />
        </button>
      </div>

      <div className="calendar-grid-header" aria-hidden="true">
        {DIAS.map((dia) => <span key={dia}>{dia}</span>)}
      </div>

      <div className="calendar-days-grid" role="grid" aria-label={monthLabel}>
        {Array.from({ length: leadingBlanks }).map((_, index) => (
          <span key={`blank-${index}`} aria-hidden="true" />
        ))}
        {Array.from({ length: daysInMonth }, (_, index) => index + 1).map((day) => {
          const date = new Date(month.getFullYear(), month.getMonth(), day);
          const key = dateKey(date);
          const isToday = date.getTime() === today.getTime();
          const isSelected = key === selectedDate;
          const disabled = !isSelectable(day);
          return (
            <button
              type="button"
              key={key}
              role="gridcell"
              disabled={disabled}
              className={`day${isToday ? ' today' : ''}${isSelected ? ' selected' : ''}${disabled ? ' past' : ''}`}
              aria-selected={isSelected}
              aria-label={`${day} de ${MESES[month.getMonth()]} de ${month.getFullYear()}`}
              onClick={() => selectDay(day)}
            >
              {day}
            </button>
          );
        })}
      </div>

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
            <span className="rate-option-price">S/ {(basePrice + 50).toFixed(2)}</span>
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
            <span className="rate-option-price">S/ {(basePrice + 90).toFixed(2)}</span>
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
