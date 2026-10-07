// Interactive SVG map of Mexico. Full re-render on every state change is fine
// for a demo — the DOM is small and delegated events survive re-renders.
import { MAP_W, MAP_H, project, unproject, kmToPx } from '../geo.js';
import { mainlandOutline, bajaOutline } from './mexicoOutline.js';
import { ZONE_TYPES } from '../data/zones.js';
import { oxoById, statusInfo } from '../store.js';

const STATUS_COLORS = {
  in_transit: '#3b82f6',
  blocked: '#ef4444',
  at_oxo: '#f59e0b',
  picked_up: '#22c55e',
  redelivery: '#64748b',
  delivered: '#16a34a',
};

// Major cities shown as reference points (keeps the shape readable).
const CITIES = [
  { name: 'Tijuana', lng: -117.03, lat: 32.53 },
  { name: 'Hermosillo', lng: -110.97, lat: 29.08 },
  { name: 'Chihuahua', lng: -106.07, lat: 28.63 },
  { name: 'Monterrey', lng: -100.31, lat: 25.67 },
  { name: 'Guadalajara', lng: -103.35, lat: 20.68 },
  { name: 'CDMX', lng: -99.13, lat: 19.43 },
  { name: 'Puebla', lng: -98.20, lat: 19.04 },
  { name: 'Veracruz', lng: -96.14, lat: 19.19 },
  { name: 'Oaxaca', lng: -96.72, lat: 17.07 },
  { name: 'Acapulco', lng: -99.87, lat: 16.86 },
  { name: 'Mérida', lng: -89.62, lat: 20.97 },
  { name: 'Cancún', lng: -86.85, lat: 21.16 },
];

const toPath = (points) =>
  points.map(([lng, lat], i) => {
    const [x, y] = project([lng, lat]);
    return `${i === 0 ? 'M' : 'L'}${x.toFixed(1)} ${y.toFixed(1)}`;
  }).join(' ') + ' Z';

export function initMap(container, { onMapClick, onPackageClick }) {
  container.innerHTML = `
    <div class="relative">
      <svg id="map-svg" class="map-svg w-full h-auto rounded-xl shadow-sm ring-1 ring-slate-200"
           viewBox="0 0 ${MAP_W} ${MAP_H}" preserveAspectRatio="xMidYMid meet"></svg>
      <div id="map-hint" class="hidden absolute top-3 left-3 right-3 flex items-center gap-2 bg-slate-900/90 text-white text-sm font-medium px-4 py-2 rounded-lg"></div>
    </div>
  `;

  const svg = container.querySelector('#map-svg');
  const hint = container.querySelector('#map-hint');

  // Delegated click handler: marker clicks take priority over map clicks.
  svg.addEventListener('click', (e) => {
    const pkgEl = e.target.closest('[data-pkg]');
    if (pkgEl) {
      onPackageClick(pkgEl.getAttribute('data-pkg'));
      return;
    }
    const rect = svg.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * MAP_W;
    const y = ((e.clientY - rect.top) / rect.height) * MAP_H;
    const [lng, lat] = unproject([x, y]);
    onMapClick({ lng, lat });
  });

  return {
    update(state) {
      // Toggle the "placing zone" affordance.
      container.classList.toggle('zone-placing', Boolean(state.zoneDraft));
      if (state.zoneDraft) {
        const type = ZONE_TYPES[state.zoneDraft.type];
        hint.textContent = `${type.icon} Click the map to place a "${type.label}" zone (severity: ${state.zoneDraft.severity})`;
        hint.classList.remove('hidden');
      } else {
        hint.classList.add('hidden');
      }

      svg.innerHTML = renderSvg(state);
    },
  };
}

function renderSvg(state) {
  return `
    <!-- ocean -->
    <rect width="${MAP_W}" height="${MAP_H}" fill="#e8f3f6" />

    <!-- Mexico landmass -->
    <path d="${toPath(mainlandOutline)}" fill="#d8e8d2" stroke="#9db89a" stroke-width="1.5" />
    <path d="${toPath(bajaOutline)}" fill="#d8e8d2" stroke="#9db89a" stroke-width="1.5" />

    ${renderCities()}
    ${renderZones(state)}
    ${renderRoutes(state)}
    ${renderOxoStores(state)}
    ${renderPackages(state)}
  `;
}

function renderCities() {
  return CITIES.map((c) => {
    const [x, y] = project([c.lng, c.lat]);
    return `
      <g>
        <circle cx="${x}" cy="${y}" r="2.4" fill="#6b7280" opacity="0.7" />
        <text x="${x}" y="${y - 5}" font-size="10" fill="#4b5563" text-anchor="middle" opacity="0.75"
              font-weight="600">${c.name}</text>
      </g>`;
  }).join('');
}

function renderZones(state) {
  return state.zones.map((z) => {
    const [x, y] = project([z.lng, z.lat]);
    const color = ZONE_TYPES[z.type].color;
    const r = kmToPx(z.radiusKm);
    return `
      <g data-zone="${z.id}">
        <circle cx="${x}" cy="${y}" r="${r}" fill="${color}" fill-opacity="0.18"
                stroke="${color}" stroke-width="1.5" stroke-dasharray="5 4">
          <title>${ZONE_TYPES[z.type].icon} ${z.label} — severity: ${z.severity} (reported by ${z.reportedBy})</title>
        </circle>
        <circle cx="${x}" cy="${y}" r="3" fill="${color}" />
        <text x="${x}" y="${y - r - 4}" font-size="11" fill="${color}" text-anchor="middle" font-weight="700">${ZONE_TYPES[z.type].icon}</text>
      </g>`;
  }).join('');
}

function renderRoutes(state) {
  // Dashed "planned" route origin -> destination for every active package.
  return state.packages
    .filter((p) => p.status !== 'delivered')
    .map((p) => {
      const [x1, y1] = project([p.origin.lng, p.origin.lat]);
      const [x2, y2] = project([p.destination.lng, p.destination.lat]);
      const color = STATUS_COLORS[p.status] ?? '#94a3b8';
      const parts = [];
      // Planned route (light dashed).
      parts.push(`<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#cbd5e1" stroke-width="1.5" stroke-dasharray="3 4" />`);
      // Traveled so far (origin -> current), solid.
      const [cx, cy] = project([p.current.lng, p.current.lat]);
      parts.push(`<line x1="${x1}" y1="${y1}" x2="${cx}" y2="${cy}" stroke="${color}" stroke-width="2.5" />`);
      // Fallback leg to the assigned OXO, if any.
      if (p.assignedOxo) {
        const store = oxoById(p.assignedOxo);
        if (store) {
          const [ox, oy] = project([store.lng, store.lat]);
          parts.push(`<line x1="${cx}" y1="${cy}" x2="${ox}" y2="${oy}" stroke="#f59e0b" stroke-width="2" stroke-dasharray="6 4" />`);
        }
      }
      return `<g>${parts.join('')}</g>`;
    })
    .join('');
}

function renderOxoStores(state) {
  return state.oxoStores.map((s) => {
    const [x, y] = project([s.lng, s.lat]);
    return `
      <g data-oxo="${s.id}" class="cursor-pointer">
        <rect x="${x - 7}" y="${y - 7}" width="14" height="14" rx="3" fill="#f97316" stroke="#fff" stroke-width="1.5">
          <title>${s.name} — ${s.address}</title>
        </rect>
        <text x="${x}" y="${y + 4}" font-size="9" fill="#fff" text-anchor="middle" font-weight="800">O</text>
      </g>`;
  }).join('');
}

function renderPackages(state) {
  return state.packages.map((p) => {
    const [x, y] = project([p.current.lng, p.current.lat]);
    const color = STATUS_COLORS[p.status] ?? '#94a3b8';
    const info = statusInfo(p);
    const isSelected = state.selectedPackageId === p.id;
    const selectedRing = isSelected
      ? `<circle class="pulse-ring" cx="${x}" cy="${y}" fill="none" stroke="${color}" stroke-width="2.5" />`
      : '';
    return `
      <g data-pkg="${p.id}" class="cursor-pointer">
        <title>${p.tracking} — ${p.recipient}\n${info.label}\n${p.destination.label}</title>
        ${selectedRing}
        <circle cx="${x}" cy="${y}" r="${isSelected ? 9 : 6.5}" fill="${color}"
                stroke="#fff" stroke-width="2" />
        <text x="${x}" y="${y - (isSelected ? 12 : 9)}" font-size="9.5" fill="#1e293b" text-anchor="middle" font-weight="700"
              paint-order="stroke" stroke="#ffffff" stroke-width="2.5">${p.tracking.replace('AMZ-MX-', '')}</text>
      </g>`;
  }).join('');
}
