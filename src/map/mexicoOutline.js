// Stylized Mexico coastline as [lng, lat] point arrays.
// Mainland + Yucatán peninsula are one polygon; Baja California is separate.
// Roughly accurate — good enough for a recognizable demo map.

export const mainlandOutline = [
  // --- US border, west -> east ---
  [-117.0, 32.53], // Tijuana / Pacific corner
  [-114.8, 32.55], // San Luis Río Colorado
  [-111.05, 31.33], // Nogales
  [-106.5, 31.76], // Ciudad Juárez
  [-103.0, 29.28], // Big Bend
  [-100.9, 29.4], // Del Rio
  [-99.5, 27.6], // Laredo
  [-98.2, 26.2], // Reynosa
  [-97.15, 25.95], // Matamoros
  // --- Gulf coast, heading south ---
  [-97.75, 24.5],
  [-97.85, 22.25], // Tampico
  [-97.6, 21.3], // Tuxpan
  [-96.15, 19.19], // Veracruz
  [-94.75, 18.05], // Coatzacoalcos
  [-92.9, 18.05], // Villahermosa
  [-91.8, 18.65], // Ciudad del Carmen
  // --- Yucatán peninsula ---
  [-90.55, 19.85], // Campeche
  [-89.6, 21.3], // Progreso
  [-87.9, 21.55],
  [-86.8, 21.17], // Cancún
  [-87.05, 20.35], // Tulum / Playa del Carmen
  [-87.8, 19.9],
  [-88.3, 18.5], // Chetumal / Belize border
  [-90.4, 17.85],
  [-92.3, 14.9], // Tapachula / Guatemala border
  // --- Pacific coast, heading north ---
  [-94.8, 15.9], // Tehuantepec
  [-95.2, 16.2], // Salina Cruz
  [-97.6, 15.85], // Puerto Escondido
  [-99.9, 16.85], // Acapulco
  [-101.5, 17.65], // Zihuatanejo
  [-103.7, 18.1],
  [-104.3, 19.05], // Manzanillo
  [-105.25, 20.65], // Puerto Vallarta
  [-106.4, 23.2], // Mazatlán
  [-107.4, 24.8], // Culiacán
  [-108.9, 25.8], // Los Mochis
  [-110.3, 27.75], // Guaymas
  [-111.05, 29.1], // Hermosillo
  [-112.6, 30.3], // Caborca
  [-114.8, 31.2], // Puerto Peñasco (north end of Gulf of California)
  [-114.8, 32.55], // back to the Colorado delta
];

export const bajaOutline = [
  // --- Pacific side, north -> south ---
  [-117.05, 32.53], // Tijuana
  [-116.9, 31.9], // Ensenada
  [-116.2, 30.9],
  [-114.8, 29.6], // Guerrero Negro
  [-113.6, 28.6],
  [-113.1, 27.2], // Mulegé
  [-112.3, 26.4],
  [-111.9, 25.7], // Loreto
  [-110.8, 24.3], // La Paz
  [-110.35, 23.1], // Cabo San Lucas
  // --- Gulf of California side, south -> north ---
  [-110.8, 24.2],
  [-111.5, 25.3],
  [-112.1, 26.3],
  [-113.1, 27.3],
  [-114.0, 28.8],
  [-114.75, 30.5],
  [-114.8, 31.2], // San Felipe
  [-116.0, 32.0], // back toward Tijuana
];
