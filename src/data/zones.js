// Pre-seeded "problem zones" so the demo opens with something to look at.
// type: riot | weather | hazard
export const initialZones = [
  {
    id: 'zone-01',
    type: 'riot',
    severity: 'high',
    label: 'Civil unrest / road blockades',
    lng: -99.06,
    lat: 19.36,
    radiusKm: 150,
    reportedBy: 'Carlos Ramírez',
    reportedAt: '2026-10-07T08:12:00',
  },
  {
    id: 'zone-02',
    type: 'weather',
    severity: 'medium',
    label: 'Flooding after heavy rain',
    lng: -98.20,
    lat: 19.05,
    radiusKm: 100,
    reportedBy: 'Lucía Fernández',
    reportedAt: '2026-10-07T06:45:00',
  },
];

// Friendly metadata for each zone type (used for colors, icons, labels).
export const ZONE_TYPES = {
  riot: { label: 'Civil unrest', icon: '🚧', color: '#ef4444' },
  weather: { label: 'Extreme weather', icon: '🌧️', color: '#f59e0b' },
  hazard: { label: 'Regional hazard', icon: '⚠️', color: '#a855f7' },
};

export const SEVERITY_LABELS = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
};

// Demo-scale "affected area" radii in km. These are intentionally larger than
// a real city block so the zones read clearly on a full-country map; they model
// a whole neighborhood/region being affected (plausible for riots or flooding).
export const SEVERITY_RADIUS_KM = {
  low: 60,
  medium: 100,
  high: 150,
};
