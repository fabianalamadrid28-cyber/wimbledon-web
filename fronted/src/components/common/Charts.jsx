import React from 'react';

/**
 * Line chart for monthly revenue estimation
 */
export function LineChartSvg({ data, height = 220, color = "#2563eb", fillGradient = true }) {
  const points = data || [
    { label: 'Ene', value: 8000 },
    { label: 'Feb', value: 12000 },
    { label: 'Mar', value: 10000 },
    { label: 'Abr', value: 14500 },
    { label: 'May', value: 13000 },
    { label: 'Jun', value: 16800 },
    { label: 'Jul', value: 18500 }
  ];

  const maxValue = 20000;
  const chartWidth = 500;
  const chartHeight = height - 50;
  const paddingX = 40;
  const paddingY = 20;

  const getCoordinates = (index, value) => {
    const x = paddingX + (index * (chartWidth - paddingX * 2)) / (points.length - 1);
    const y = chartHeight - (value / maxValue) * (chartHeight - paddingY * 2) + paddingY;
    return { x, y };
  };

  const pathD = points.reduce((acc, point, i) => {
    const { x, y } = getCoordinates(i, point.value);
    return i === 0 ? `M ${x} ${y}` : `${acc} L ${x} ${y}`;
  }, '');

  const areaD = `${pathD} L ${getCoordinates(points.length - 1, 0).x} ${chartHeight + paddingY} L ${getCoordinates(0, 0).x} ${chartHeight + paddingY} Z`;

  return (
    <div style={{ width: '100%', overflowX: 'auto' }}>
      <svg viewBox={`0 0 ${chartWidth} ${height}`} style={{ width: '100%', maxHeight: height }}>
        <defs>
          <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.25" />
            <stop offset="100%" stopColor={color} stopOpacity="0.0" />
          </linearGradient>
        </defs>

        {/* Y Axis Grid lines */}
        {[0, 5000, 10000, 15000, 20000].map((val) => {
          const y = chartHeight - (val / maxValue) * (chartHeight - paddingY * 2) + paddingY;
          return (
            <g key={val}>
              <line x1={paddingX - 10} y1={y} x2={chartWidth - 20} y2={y} stroke="#e2e8f0" strokeDasharray="3 3" />
              <text x={paddingX - 15} y={y + 4} fill="#94a3b8" fontSize="10" textAnchor="end">
                {val.toLocaleString()}
              </text>
            </g>
          );
        })}

        {/* Filled Area */}
        {fillGradient && <path d={areaD} fill="url(#areaGradient)" />}

        {/* Main Line */}
        <path d={pathD} fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" />

        {/* Points & Labels */}
        {points.map((p, i) => {
          const { x, y } = getCoordinates(i, p.value);
          return (
            <g key={i}>
              <circle cx={x} cy={y} r="5" fill="#ffffff" stroke={color} strokeWidth="2.5" />
              <text x={x} y={chartHeight + paddingY + 16} fill="#64748b" fontSize="11" textAnchor="middle" fontWeight="500">
                {p.label}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

/**
 * Bar chart for Room occupancy by type
 */
export function BarChartSvg({ data, height = 220 }) {
  const bars = data || [
    { label: 'Simple', value: 55, color: '#3b82f6' },
    { label: 'Doble', value: 70, color: '#2563eb' },
    { label: 'Suite', value: 80, color: '#1d4ed8' }
  ];

  const maxVal = 100;
  const svgWidth = 400;
  const barWidth = 48;
  const paddingX = 60;
  const chartHeight = height - 50;

  return (
    <div style={{ width: '100%', overflowX: 'auto' }}>
      <svg viewBox={`0 0 ${svgWidth} ${height}`} style={{ width: '100%', maxHeight: height }}>
        {/* Y Axis Grid lines */}
        {[0, 25, 50, 75, 100].map((val) => {
          const y = chartHeight - (val / maxVal) * (chartHeight - 30) + 15;
          return (
            <g key={val}>
              <line x1={paddingX - 10} y1={y} x2={svgWidth - 20} y2={y} stroke="#e2e8f0" strokeDasharray="3 3" />
              <text x={paddingX - 15} y={y + 4} fill="#94a3b8" fontSize="10" textAnchor="end">
                {val}%
              </text>
            </g>
          );
        })}

        {/* Bars */}
        {bars.map((bar, i) => {
          const x = paddingX + 30 + i * ((svgWidth - paddingX * 2) / (bars.length - 1 || 1)) - barWidth / 2;
          const barH = (bar.value / maxVal) * (chartHeight - 30);
          const y = chartHeight - barH + 15;

          return (
            <g key={i}>
              <rect
                x={x}
                y={y}
                width={barWidth}
                height={barH}
                fill={bar.color}
                rx="6"
              />
              <text x={x + barWidth / 2} y={y - 6} fill="#1e293b" fontSize="11" fontWeight="700" textAnchor="middle">
                {bar.value}%
              </text>
              <text x={x + barWidth / 2} y={chartHeight + 32} fill="#64748b" fontSize="12" fontWeight="500" textAnchor="middle">
                {bar.label}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

/**
 * Donut chart for Reservations breakdown or Occupancy
 */
export function DonutChartSvg({ percent = 60, size = 150, strokeWidth = 16, centerLabel = "Ocupación" }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percent / 100) * circumference;

  return (
    <div className="donut-chart-container" style={{ width: size, height: size, margin: '0 auto' }}>
      <svg width={size} height={size}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#e2e8f0"
          strokeWidth={strokeWidth}
          fill="none"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#2563eb"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          fill="none"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </svg>
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        pointerEvents: 'none'
      }}>
        <span style={{ fontSize: '22px', fontWeight: '800', color: '#0f172a', lineHeight: 1 }}>{percent}%</span>
        {centerLabel && <span style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>{centerLabel}</span>}
      </div>
    </div>
  );
}

/**
 * Segmented Donut Chart for Statuses (Confirmadas, Pendientes, Canceladas)
 */
export function StatusDonutChartSvg({ data, total = 42, size = 170 }) {
  const strokeWidth = 22;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  // data = [{ label: 'Confirmadas', percent: 65, color: '#2563eb' }, ...]
  const segments = data || [
    { label: 'Confirmadas', percent: 65, color: '#2563eb' },
    { label: 'Pendientes', percent: 20, color: '#f59e0b' },
    { label: 'Canceladas', percent: 15, color: '#8b5cf6' }
  ];

  let accumulated = 0;

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '20px' }}>
      <div style={{ position: 'relative', width: size, height: size }}>
        <svg width={size} height={size}>
          <circle cx={size / 2} cy={size / 2} r={radius} stroke="#f1f5f9" strokeWidth={strokeWidth} fill="none" />
          {segments.map((seg, i) => {
            const strokeDashoffset = circumference - (seg.percent / 100) * circumference;
            const rotation = (accumulated / 100) * 360 - 90;
            accumulated += seg.percent;

            return (
              <circle
                key={i}
                cx={size / 2}
                cy={size / 2}
                r={radius}
                stroke={seg.color}
                strokeWidth={strokeWidth}
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                fill="none"
                transform={`rotate(${rotation} ${size / 2} ${size / 2})`}
              />
            );
          })}
        </svg>
        <div style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <span style={{ fontSize: '24px', fontWeight: '800', color: '#0f172a', lineHeight: 1 }}>{total}</span>
          <span style={{ fontSize: '11px', color: '#64748b' }}>Total</span>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {segments.map((seg, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12.5px' }}>
            <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: seg.color }}></span>
            <span style={{ color: '#475569' }}>{seg.label}</span>
            <span style={{ fontWeight: '700', color: '#0f172a' }}>{seg.percent}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

