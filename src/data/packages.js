// Dummy package data for the demo.
//
// status lifecycle:
//   in_transit  -> on the way to the door
//   blocked     -> door delivery impossible, needs OXO fallback (partner decides)
//   at_oxo      -> dropped off at the OXO pickup point (user decides)
//   picked_up   -> user chose "pick up at OXO"
//   redelivery  -> user chose "wait for later delivery"
//   delivered   -> delivered normally at the door
export const initialPackages = [
  {
    id: 'pkg-01',
    tracking: 'AMZ-MX-10482',
    recipient: 'María González',
    partner: 'Carlos Ramírez',
    vehicle: 'Van #4',
    origin: { label: 'Guadalajara Hub', lng: -103.35, lat: 20.68 },
    destination: { label: 'Calle Hidalgo 45, Iztapalapa, CDMX', lng: -99.07, lat: 19.36 },
    status: 'blocked',
    assignedOxo: 'oxo-02',
    current: { lng: -99.07, lat: 19.36 },
    delayNote: 'Roads blocked near destination. Transferring to pickup point.',
    history: [
      { t: 'Oct 7, 07:50', msg: 'Departed Guadalajara Hub' },
      { t: 'Oct 7, 09:30', msg: 'Arrived in CDMX metro area' },
      { t: 'Oct 7, 09:55', msg: 'Delivery blocked — civil unrest reported' },
    ],
  },
  {
    id: 'pkg-02',
    tracking: 'AMZ-MX-10483',
    recipient: 'Jorge Pérez',
    partner: 'Lucía Fernández',
    vehicle: 'Van #7',
    origin: { label: 'Puebla Hub', lng: -98.20, lat: 19.04 },
    destination: { label: 'Calle 5 Norte 12, Puebla', lng: -98.20, lat: 19.05 },
    status: 'blocked',
    assignedOxo: 'oxo-04',
    current: { lng: -98.20, lat: 19.05 },
    delayNote: 'Severe flooding in area. Nearest pickup point assigned.',
    history: [
      { t: 'Oct 7, 08:00', msg: 'Departed Puebla Hub' },
      { t: 'Oct 7, 08:40', msg: 'Route blocked by flooding' },
    ],
  },
  {
    id: 'pkg-03',
    tracking: 'AMZ-MX-10484',
    recipient: 'Ana Torres',
    partner: 'Carlos Ramírez',
    vehicle: 'Van #4',
    origin: { label: 'Guadalajara Hub', lng: -103.35, lat: 20.68 },
    destination: { label: 'Av. Patria 880, Zapopan', lng: -103.40, lat: 20.72 },
    status: 'at_oxo',
    assignedOxo: 'oxo-06',
    current: { lng: -103.40, lat: 20.72 },
    delayNote: 'Available for pickup at OXO Zapopan.',
    history: [
      { t: 'Oct 7, 07:30', msg: 'Departed Guadalajara Hub' },
      { t: 'Oct 7, 08:10', msg: 'Delivery disrupted — regional hazard reported' },
      { t: 'Oct 7, 08:35', msg: 'Dropped off at OXO Zapopan' },
    ],
  },
  {
    id: 'pkg-04',
    tracking: 'AMZ-MX-10485',
    recipient: 'Pedro Sánchez',
    partner: 'Miguel Ángel',
    vehicle: 'Moto #2',
    origin: { label: 'Monterrey Hub', lng: -100.31, lat: 25.67 },
    destination: { label: 'Av. Morelos 510, Monterrey', lng: -100.31, lat: 25.68 },
    status: 'in_transit',
    assignedOxo: null,
    current: { lng: -100.33, lat: 25.62 },
    delayNote: null,
    history: [
      { t: 'Oct 7, 09:00', msg: 'Departed Monterrey Hub' },
      { t: 'Oct 7, 09:35', msg: 'Out for delivery' },
    ],
  },
  {
    id: 'pkg-05',
    tracking: 'AMZ-MX-10486',
    recipient: 'Sofía Herrera',
    partner: 'Ricardo Núñez',
    vehicle: 'Van #11',
    origin: { label: 'Cancún Hub', lng: -86.85, lat: 21.16 },
    destination: { label: 'Av. Tulum 12, Cancún', lng: -86.85, lat: 21.17 },
    status: 'delivered',
    assignedOxo: null,
    current: { lng: -86.85, lat: 21.17 },
    delayNote: null,
    history: [
      { t: 'Oct 7, 07:10', msg: 'Departed Cancún Hub' },
      { t: 'Oct 7, 08:20', msg: 'Delivered to recipient' },
    ],
  },
];
