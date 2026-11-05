// Medios de pago del hotel. Cambia aquí los datos reales del negocio (titular, números, cuentas).
// Los ids deben coincidir con los de backend/.../services/MetodosPago.java.

export const PAGO_YAPE = 'YAPE';
export const PAGO_PLIN = 'PLIN';
export const PAGO_TRANSFERENCIA = 'TRANSFERENCIA';
export const PAGO_EN_HOTEL = 'EN_HOTEL';

// Mismo patrón que valida el backend: solo dígitos, entre 6 y 12
export const REGEX_NUMERO_OPERACION = /^\d{6,12}$/;

export const METODOS_PAGO = [
  {
    id: PAGO_YAPE,
    nombre: 'Yape',
    descripcion: 'Escanea el QR o yapea al número del hotel',
    color: '#742284',
    digital: true,
    titular: 'Hotel Wimbledon S.A.C.', // TODO: nombre que aparece en Yape
    numero: '926 546 855',             // TODO: número Yape del hotel
    qr: '/images/yape-qr.jpg'          // TODO: poner el QR real en fronted/public/images/yape-qr.jpg
  },
  {
    id: PAGO_PLIN,
    nombre: 'Plin',
    descripcion: 'Escanea el QR o plinea al número del hotel',
    color: '#00b5c8',
    digital: true,
    titular: 'Hotel Wimbledon S.A.C.', // TODO
    numero: '926 546 855',             // TODO: número Plin del hotel
    qr: '/images/plin-qr.jpg'          // TODO: poner el QR real en fronted/public/images/plin-qr.jpg
  },
  {
    id: PAGO_TRANSFERENCIA,
    nombre: 'Transferencia bancaria',
    descripcion: 'Desde cualquier banco (BCP, Interbank, BBVA, Scotiabank)',
    color: '#2563eb',
    digital: true,
    titular: 'Hotel Wimbledon S.A.C.', // TODO
    cuentas: [                         // TODO: cuentas reales
      { banco: 'BCP', cuenta: '193-0000000-0-00', cci: '002-193-000000000000-00' },
      { banco: 'Interbank', cuenta: '898-0000000000', cci: '003-898-000000000000-00' }
    ]
  },
  {
    id: PAGO_EN_HOTEL,
    nombre: 'Pagar en el hotel',
    descripcion: 'Efectivo o tarjeta (POS) al llegar',
    color: '#16a34a',
    digital: false
  }
];

export const getMetodoPago = (id) => METODOS_PAGO.find(m => m.id === id) || null;
