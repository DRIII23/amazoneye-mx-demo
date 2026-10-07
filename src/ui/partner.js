// Delivery Partner side panel.
import { ZONE_TYPES, SEVERITY_LABELS } from '../data/zones.js';
import { oxoById, statusInfo } from '../store.js';
import { distanceKm, coordOf } from '../geo.js';
import { badge, sectionTitle } from './components.js';

export function renderPartnerPanel(state) {
  return `
    <div class="overflow-y-auto scroll-thin">
      ${renderReportForm(state)}
      ${renderZones(state)}
      ${renderDeliveries(state)}
    </div>`;
}

function renderReportForm(state) {
  const typeOptions = Object.entries(ZONE_TYPES)
    .map(([key, t]) => `<option value="${key}">${t.icon} ${t.label}</option>`)
    .join('');
  const sevOptions = Object.entries(SEVERITY_LABELS)
    .map(([key, label]) => `<option value="${key}">${label}</option>`)
    .join('');

  const placing = Boolean(state.zoneDraft);
  const btn = placing
    ? `<button data-action="cancel-zone" class="mt-3 w-full rounded-lg bg-slate-700 text-white text-sm font-semibold py-2 hover:bg-slate-800 transition">Cancel zone placement</button>`
    : `<button data-action="start-zone" class="mt-3 w-full rounded-lg bg-slate-900 text-white text-sm font-semibold py-2 hover:bg-slate-700 transition">📍 Place zone on map</button>`;

  return `
    <div class="p-4 border-b border-slate-200">
      <h3 class="text-sm font-bold text-slate-800">Report a blocked zone</h3>
      <p class="text-xs text-slate-500 mt-0.5 mb-3">Mark roads that are blocked, unsafe, or impassable so packages can be rerouted to OXO.</p>

      <label class="block text-xs font-semibold text-slate-600 mb-1">Reason</label>
      <select id="zone-type" class="w-full rounded-lg border border-slate-300 text-sm px-2 py-1.5 mb-3 bg-white">${typeOptions}</select>

      <label class="block text-xs font-semibold text-slate-600 mb-1">Severity (affected area)</label>
      <select id="zone-severity" class="w-full rounded-lg border border-slate-300 text-sm px-2 py-1.5 bg-white">${sevOptions}</select>

      ${btn}
      ${placing ? `<p class="text-xs text-amber-700 bg-amber-50 rounded-md px-2 py-1.5 mt-2 font-medium">👆 Now click the map to drop the zone.</p>` : ''}
    </div>`;
}

function renderZones(state) {
  const items = state.zones
    .map((z) => {
      const type = ZONE_TYPES[z.type];
      return `
        <li class="flex items-start gap-2.5 px-4 py-2.5 border-b border-slate-100">
          <span class="text-lg leading-none mt-0.5">${type.icon}</span>
          <div class="min-w-0 flex-1">
            <div class="flex items-center gap-2">
              <span class="text-sm font-semibold text-slate-800">${z.label}</span>
              ${badge(SEVERITY_LABELS[z.severity], z.severity === 'high' ? 'red' : z.severity === 'medium' ? 'amber' : 'slate')}
            </div>
            <p class="text-xs text-slate-500">Reported by ${z.reportedBy}</p>
          </div>
        </li>`;
    })
    .join('');

  return `
    <div class="border-b border-slate-200">
      ${sectionTitle(`Active hazard zones (${state.zones.length})`)}
      <ul>${items}</ul>
    </div>`;
}

function renderDeliveries(state) {
  const myPackages = state.packages.filter((p) => p.status !== 'delivered');
  const cards = myPackages.map((p) => renderPackageCard(p)).join('');

  return `
    <div>
      ${sectionTitle(`My deliveries (${myPackages.length})`)}
      <div class="px-3 pb-4 space-y-3">${cards}</div>
    </div>`;
}

function renderPackageCard(pkg) {
  const info = statusInfo(pkg);
  const store = oxoById(pkg.assignedOxo);
  const last = pkg.history[pkg.history.length - 1];

  let action = '';
  if (pkg.status === 'blocked' && store) {
    const d = distanceKm(coordOf(pkg.destination), [store.lng, store.lat]).toFixed(1);
    action = `
      <div class="mt-2 rounded-md bg-amber-50 ring-1 ring-amber-200 px-2.5 py-2">
        <p class="text-xs font-medium text-amber-800">🚧 Door delivery blocked</p>
        <p class="text-xs text-slate-600 mt-1">Nearest pickup point: <span class="font-semibold">${store.name}</span> · ${d} km away</p>
        <button data-action="drop-off" data-pkg="${pkg.id}" class="mt-2 w-full rounded-md bg-amber-500 text-white text-xs font-bold py-1.5 hover:bg-amber-600 transition">Confirm drop-off at OXO</button>
      </div>`;
  } else if (pkg.status === 'at_oxo' && store) {
    action = `
      <div class="mt-2 rounded-md bg-emerald-50 ring-1 ring-emerald-200 px-2.5 py-2">
        <p class="text-xs font-medium text-emerald-800">✅ Held at ${store.name} — awaiting customer decision</p>
      </div>`;
  } else if (pkg.status === 'picked_up') {
    action = `<p class="mt-2 text-xs text-emerald-700">Customer will pick up at OXO.</p>`;
  } else if (pkg.status === 'redelivery') {
    action = `<p class="mt-2 text-xs text-slate-600">Re-delivery scheduled for later.</p>`;
  }

  return `
    <div class="rounded-lg ring-1 ring-slate-200 bg-white p-3">
      <div class="flex items-center justify-between gap-2">
        <span class="text-xs font-bold text-slate-800">${pkg.tracking}</span>
        ${badge(info.label, info.tone)}
      </div>
      <p class="text-xs text-slate-500 mt-1">👤 ${pkg.recipient} · ${pkg.vehicle}</p>
      <p class="text-xs text-slate-600 mt-0.5">📍 ${pkg.destination.label}</p>
      <p class="text-xs text-slate-400 mt-1">${last ? `${last.t} — ${last.msg}` : ''}</p>
      ${action}
    </div>`;
}
