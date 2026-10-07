// Lightweight geo helpers for the mock map.
// We use a simple equirectangular projection over Mexico's bounding box and
// a spherical-ish distance approximation — good enough for a demo.

export const MAP_W = 880;
export const MAP_H = 560;

// Approx. geographic bounds of Mexico (mainland + peninsulas).
const BOUNDS = {
  latMin: 14.3,
  latMax: 32.9,
  lngMin: -117.4,
  lngMax: -86.4,
};

/** Project [lng, lat] -> [x, y] in SVG space. */
export function project([lng, lat]) {
  const x = ((lng - BOUNDS.lngMin) / (BOUNDS.lngMax - BOUNDS.lngMin)) * MAP_W;
  const y = ((BOUNDS.latMax - lat) / (BOUNDS.latMax - BOUNDS.latMin)) * MAP_H;
  return [x, y];
}

/** Inverse of project: [x, y] -> [lng, lat]. */
export function unproject([x, y]) {
  const lng = BOUNDS.lngMin + (x / MAP_W) * (BOUNDS.lngMax - BOUNDS.lngMin);
  const lat = BOUNDS.latMax - (y / MAP_H) * (BOUNDS.latMax - BOUNDS.latMin);
  return [lng, lat];
}

/** Approximate great-circle distance in km between two [lng, lat] points. */
export function distanceKm([lng1, lat1], [lng2, lat2]) {
  const toRad = (d) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const avgLat = toRad((lat1 + lat2) / 2);
  const x = dLng * Math.cos(avgLat);
  const R = 6371; // Earth radius, km
  return Math.sqrt(x * x + dLat * dLat) * R;
}

/** Turn a coordinate object ({lng, lat}) into a [lng, lat] pair. */
export function coordOf({ lng, lat }) {
  return [lng, lat];
}

// Rough scale for turning a real distance (km) into SVG pixels on this
// full-country map. ~0.28 px per km at Mexico's mid-latitude.
export const PX_PER_KM = 0.28;
export const kmToPx = (km) => km * PX_PER_KM;
