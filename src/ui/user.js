// End User side panel.
import { oxoById, statusInfo } from '../store.js';
import { badge, sectionTitle } from './components.js';

export function renderUserPanel(state) {
  return `
    <div class="overflow-y-auto scroll-thin">
      ${renderNotifications(state)}
      ${renderPackages(state)}
    </div>`;
}

function renderNotifications(state) {
  const items = state.notifications
    .slice(0, 6)
    .map((n) => {
      const tone =
        n.tone === 'green'
          ? 'bg-emerald-50 ring-emerald-200 text-emerald-800'
          : 'bg-amber-50 ring-amber-200 text-amber-800';
      const icon = n.tone === 'green' ? '✅' : '⚠️';
      return `
        <li class="rounded-lg ring-1 ${tone} px-3 py-2.5">
          <div class="flex items-start gap-2">
            <span>${icon}</span>
            <div class="min-w-0">
              <p class="text-xs font-medium leading-snug">${n.message}</p>
              <p class="text-[11px] opacity-70 mt-0.5">${n.time}</p>
            </div>
          </div>
        </li>`;
    })
    .join('');

  return `
    <div class="border-b border-slate-200">
      ${sectionTitle('Notifications')}
      <ul class="px-3 pb-4 space-y-2">${items || '<li class="text-xs text-slate-400 px-1">No notifications.</li>'}</ul>
    </div>`;
}

function renderPackages(state) {
  const myPackages = state.packages.filter((p) => p.status !== 'delivered');
  const cards = myPackages.map((p) => renderPackageCard(p)).join('');
  return `
    <div>
      ${sectionTitle(`My packages (${myPackages.length})`)}
      <div class="px-3 pb-4 space-y-3">${cards}</div>
    </div>`;
}

function renderPackageCard(pkg) {
  const info = statusInfo(pkg);
  const store = oxoById(pkg.assignedOxo);
  const last = pkg.history[pkg.history.length - 1];

  let alert = '';
  let action = '';

  if (pkg.status === 'at_oxo' && store) {
    alert = `
      <div class="mt-2 rounded-md bg-amber-50 ring-1 ring-amber-300 px-3 py-2">
        <p class="text-xs font-semibold text-amber-800">⏳ Delivery delayed</p>
        <p class="text-xs text-slate-700 mt-1">Your package can't reach your door right now. It's being held at <span class="font-semibold">${store.name}</span>.</p>
        <p class="text-xs text-slate-500 mt-1">${store.address}</p>
      </div>`;
    action = `
      <div class="mt-2 flex gap-2">
        <button data-action="pickup" data-pkg="${pkg.id}" class="flex-1 rounded-md bg-emerald-600 text-white text-xs font-bold py-1.5 hover:bg-emerald-700 transition">📦 Pick up at OXO</button>
        <button data-action="wait" data-pkg="${pkg.id}" class="flex-1 rounded-md bg-white ring-1 ring-slate-300 text-slate-700 text-xs font-bold py-1.5 hover:bg-slate-50 transition">🕓 Wait for later delivery</button>
      </div>`;
  } else if (pkg.status === 'blocked' && store) {
    alert = `
      <div class="mt-2 rounded-md bg-amber-50 ring-1 ring-amber-300 px-3 py-2">
        <p class="text-xs font-semibold text-amber-800">⚠️ Delivery disrupted</p>
        <p class="text-xs text-slate-700 mt-1">Your package is being rerouted to the nearest OXO store (<span class="font-semibold">${store.name}</span>).</p>
      </div>`;
  } else if (pkg.status === 'picked_up') {
    alert = `<p class="mt-2 text-xs text-emerald-700 font-medium">You're picking up at OXO — show the code at the counter.</p>`;
  } else if (pkg.status === 'redelivery') {
    alert = `<p class="mt-2 text-xs text-slate-600 font-medium">We'll re-attempt delivery to your door when conditions improve.</p>`;
  } else if (pkg.status === 'in_transit') {
    alert = `<p class="mt-2 text-xs text-blue-600 font-medium">On the way — no disruptions reported for your route.</p>`;
  }

  return `
    <div class="rounded-lg ring-1 ring-slate-200 bg-white p-3">
      <div class="flex items-center justify-between gap-2">
        <span class="text-xs font-bold text-slate-800">${pkg.tracking}</span>
        ${badge(info.label, info.tone)}
      </div>
      <p class="text-xs text-slate-500 mt-1">🚚 ${pkg.vehicle} · ${pkg.partner}</p>
      <p class="text-xs text-slate-600 mt-0.5">📍 ${pkg.destination.label}</p>
      <p class="text-xs text-slate-400 mt-1">${last ? `${last.t} — ${last.msg}` : ''}</p>
      <button data-action="select-package" data-pkg="${pkg.id}" class="mt-2 text-xs font-semibold text-blue-600 hover:text-blue-800">📍 Track on map →</button>
      ${alert}
      ${action}
    </div>`;
}
