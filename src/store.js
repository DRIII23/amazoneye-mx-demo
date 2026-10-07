// Tiny reactive store. Plain JS object + subscribe/emit, no framework.
import { initialPackages } from './data/packages.js';
import { initialZones } from './data/zones.js';
import { SEVERITY_RADIUS_KM, ZONE_TYPES } from './data/zones.js';
import { oxoStores } from './data/oxoStores.js';
import { distanceKm, coordOf } from './geo.js';

export const oxoById = (id) => oxoStores.find((s) => s.id === id);

export const state = {
  role: 'partner', // 'partner' | 'user'
  packages: structuredClone(initialPackages),
  zones: structuredClone(initialZones),
  oxoStores,
  notifications: [],
  selectedPackageId: null,
  zoneDraft: null, // { type, severity } while the partner is placing a zone
  toast: null, // { message, tone }
};

const listeners = new Set();

export function subscribe(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

// Seed the notification feed from pre-existing disrupted packages so the demo
// opens with content in the End User view.
{
  let n = 0;
  for (const pkg of state.packages) {
    const s = oxoById(pkg.assignedOxo);
    if (pkg.status === 'blocked') {
      state.notifications.push({
        id: `notif-seed-${++n}`,
        pkgId: pkg.id,
        message: `Delivery disrupted for ${pkg.tracking}. Rerouting to ${s?.name ?? 'OXO'}.`,
        tone: 'amber',
        time: 'Oct 7, 09:55',
      });
    } else if (pkg.status === 'at_oxo') {
      state.notifications.push({
        id: `notif-seed-${++n}`,
        pkgId: pkg.id,
        message: `Your package ${pkg.tracking} is ready for pickup at ${s?.name ?? 'OXO'}.`,
        tone: 'green',
        time: 'Oct 7, 08:35',
      });
    }
  }
}

function emit() {
  listeners.forEach((fn) => fn(state));
}

// ---------------------------------------------------------------------------
// Derived helpers
// ---------------------------------------------------------------------------

export function packageById(id) {
  return state.packages.find((p) => p.id === id);
}

export function nearestOxo(coord) {
  let best = null;
  let bestD = Infinity;
  for (const store of oxoStores) {
    const d = distanceKm(coordOf(coord), [store.lng, store.lat]);
    if (d < bestD) {
      bestD = d;
      best = store;
    }
  }
  return { store: best, distanceKm: bestD };
}

export function insideZone(coord, zone) {
  return distanceKm(coordOf(coord), [zone.lng, zone.lat]) <= zone.radiusKm;
}

/** Which zones currently block a package's destination. */
export function zonesBlocking(pkg) {
  return state.zones.filter((z) => insideZone(pkg.destination, z));
}

/** Human-readable status label + tone for badges. */
export function statusInfo(pkg) {
  const map = {
    in_transit: { label: 'In transit', tone: 'blue' },
    blocked: { label: 'Blocked — reroute', tone: 'red' },
    at_oxo: { label: 'At OXO pickup', tone: 'amber' },
    picked_up: { label: 'Picked up', tone: 'green' },
    redelivery: { label: 'Waiting re-delivery', tone: 'slate' },
    delivered: { label: 'Delivered', tone: 'green' },
  };
  return map[pkg.status] ?? { label: pkg.status, tone: 'slate' };
}

// ---------------------------------------------------------------------------
// Actions
// ---------------------------------------------------------------------------

let seq = 0;
const nextId = (prefix) => `${prefix}-${++seq}-${Math.floor(Math.random() * 9000 + 1000)}`;

function nowTime() {
  const d = new Date();
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const hh = String(d.getHours()).padStart(2, '0');
  const mm = String(d.getMinutes()).padStart(2, '0');
  return `${months[d.getMonth()]} ${d.getDate()}, ${hh}:${mm}`;
}

function pushHistory(pkg, msg) {
  pkg.history.push({ t: nowTime(), msg });
}

function notify(pkg, message, tone = 'amber') {
  state.notifications.unshift({
    id: nextId('notif'),
    pkgId: pkg.id,
    message,
    tone,
    time: nowTime(),
  });
}

export function setRole(role) {
  state.role = role;
  state.selectedPackageId = null;
  emit();
}

export function selectPackage(id) {
  state.selectedPackageId = id;
  emit();
}

export function showToast(message, tone = 'slate') {
  state.toast = { message, tone };
  emit();
}

export function dismissToast() {
  state.toast = null;
  emit();
}

export function startZoneDraft(type, severity) {
  state.zoneDraft = { type, severity };
  emit();
}

export function cancelZoneDraft() {
  state.zoneDraft = null;
  emit();
}

/** Partner clicks the map while a draft is active -> create a zone. */
export function addZone({ type, severity, lng, lat }) {
  const zone = {
    id: nextId('zone'),
    type,
    severity,
    label: ZONE_TYPES[type].label,
    lng,
    lat,
    radiusKm: SEVERITY_RADIUS_KM[severity] ?? 2.5,
    reportedBy: 'You (Carlos Ramírez)',
    reportedAt: new Date().toISOString(),
  };
  state.zones.push(zone);

  // Auto-block any active package whose destination now falls inside the zone.
  for (const pkg of state.packages) {
    if ((pkg.status === 'in_transit' || pkg.status === 'blocked') && insideZone(pkg.destination, zone)) {
      pkg.status = 'blocked';
      if (!pkg.assignedOxo) {
        const { store } = nearestOxo(pkg.destination);
        pkg.assignedOxo = store.id;
        pkg.delayNote = `Disrupted (${ZONE_TYPES[type].label.toLowerCase()}). Nearest pickup point assigned.`;
        pushHistory(pkg, `Delivery blocked — ${ZONE_TYPES[type].label.toLowerCase()} reported`);
        notify(pkg, `Delivery disrupted for ${pkg.tracking}. Rerouting to ${store.name}.`, 'amber');
      }
    }
  }

  state.zoneDraft = null;
  showToast(`${ZONE_TYPES[type].icon} Zone reported: ${ZONE_TYPES[type].label}`, 'slate');
  emit();
}

/** Partner confirms the package was dropped off at its assigned OXO. */
export function dropOffAtOxo(pkgId) {
  const pkg = packageById(pkgId);
  if (!pkg || pkg.status !== 'blocked' || !pkg.assignedOxo) return;
  const store = oxoById(pkg.assignedOxo);
  pkg.status = 'at_oxo';
  pkg.current = { lng: store.lng, lat: store.lat };
  pkg.delayNote = `Available for pickup at ${store.name}.`;
  pushHistory(pkg, `Dropped off at ${store.name}`);
  notify(pkg, `Your package ${pkg.tracking} is ready for pickup at ${store.name}.`, 'green');
  showToast(`📦 ${pkg.tracking} dropped off at ${store.name}`, 'green');
  emit();
}

/** End user chooses an action for a package held at OXO. */
export function userDecision(pkgId, decision) {
  const pkg = packageById(pkgId);
  if (!pkg || pkg.status !== 'at_oxo') return;
  if (decision === 'pickup') {
    pkg.status = 'picked_up';
    pkg.delayNote = 'You will pick up your package at the OXO store.';
    pushHistory(pkg, 'Recipient confirmed pickup at OXO');
    showToast('✅ Pickup confirmed at OXO', 'green');
  } else {
    pkg.status = 'redelivery';
    pkg.delayNote = 'You chose to wait — we will re-attempt delivery later.';
    pushHistory(pkg, 'Recipient requested later re-delivery');
    showToast('🕓 Re-delivery scheduled', 'slate');
  }
  emit();
}
