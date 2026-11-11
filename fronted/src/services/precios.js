// Tarifas del hotel Wimbledon.
// El precio guardado en cada habitación (precioBloque) corresponde al bloque base de 6 HORAS.
// Las demás modalidades se calculan sumando un recargo fijo, igual que en la carta de tarifas.
export const RECARGOS_BLOQUE = {
  '6 HORAS': 0,
  '12 HORAS': 50,
  PERNOCTE: 90
};

export const BLOQUES = [
  { id: '6 HORAS', nombre: 'Bloque 6 Horas' },
  { id: '12 HORAS', nombre: 'Bloque 12 Horas' },
  { id: 'PERNOCTE', nombre: 'Pernocte / 24 Horas' }
];

export function normalizarBloque(bloque) {
  const valor = String(bloque || '').toUpperCase().trim();
  if (valor.includes('6')) return '6 HORAS';
  if (valor.includes('12')) return '12 HORAS';
  return 'PERNOCTE';
}

// Precio final de la modalidad seleccionada a partir de la tarifa base (6 h).
export function calcularPrecioBloque(precioBase, bloque) {
  const base = Number(precioBase);
  const recargo = RECARGOS_BLOQUE[normalizarBloque(bloque)] ?? 0;
  if (!Number.isFinite(base)) return recargo;
  return Math.round((base + recargo) * 100) / 100;
}

// Convierte un texto tipo "S/ 125.00" o "S/ 125" en número.
export function precioDesdeTexto(desde) {
  const numero = Number(String(desde ?? '').replace(/[^\d.]/g, ''));
  return Number.isFinite(numero) ? numero : 0;
}

export function formatearSoles(monto) {
  const numero = Number(monto);
  return `S/ ${(Number.isFinite(numero) ? numero : 0).toFixed(2)}`;
}
