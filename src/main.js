import './style.css';
import {
  state,
  subscribe,
  setRole,
  selectPackage,
  startZoneDraft,
  cancelZoneDraft,
  addZone,
  dropOffAtOxo,
  userDecision,
  showToast,
  dismissToast,
} from './store.js';
import { initMap } from './map/map.js';
import { renderPartnerPanel } from './ui/partner.js';
import { renderUserPanel } from './ui/user.js';

// --- App shell -------------------------------------------------------------
document.querySelector('#app').innerHTML = `
  <div class="min-h-screen flex flex-col">
    <header class="bg-white border-b border-slate-200 shadow-sm">
      <div class="max-w-[1400px] w-full mx-auto px-5 py-3 flex items-center gap-4">
        <div class="flex items-center gap-2.5">
          <span class="text-2xl">📦</span>
          <div>
            <h1 class="text-lg font-bold leading-tight tracking-tight">AmazonEye <span class="text-amber-600">MX</span></h1>
            <p class="text-[11px] text-slate-500 -mt-0.5">Delivery Partner Platform · Mexico (Demo)</p>
          </div>
        </div>
        <div class="ml-auto flex rounded-lg bg-slate-100 p-1">
          <button data-action="set-role" data-role="partner" id="role-partner"
            class="px-4 py-1.5 rounded-md text-sm font-semibold transition">🚚 Delivery Partner</button>
          <button data-action="set-role" data-role="user" id="role-user"
            class="px-4 py-1.5 rounded-md text-sm font-semibold transition">👤 End User</button>
        </div>
      </div>
    </header>

    <main class="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-4 p-4 max-w-[1400px] w-full mx-auto">
      <section id="map" class="lg:col-span-2"></section>
      <aside id="panel" class="lg:col-span-1 bg-white rounded-xl shadow-sm ring-1 ring-slate-200 overflow-hidden"></aside>
    </main>

    <div id="toast" class="hidden fixed bottom-5 right-5 z-50"></div>
  </div>
`;

// --- Map --------------------------------------------------------------------
const map = initMap(document.querySelector('#map'), {
  onMapClick({ lng, lat }) {
    // Placing a zone is the only thing a bare map click does, and only for partners.
    if (state.role === 'partner' && state.zoneDraft) {
      addZone({ type: state.zoneDraft.type, severity: state.zoneDraft.severity, lng, lat });
    }
  },
  onPackageClick(id) {
    selectPackage(id);
  },
});

// --- Delegated action router ------------------------------------------------
document.addEventListener('click', (e) => {
  const el = e.target.closest('[data-action]');
  if (!el) return;
  const action = el.getAttribute('data-action');
  const pkg = el.getAttribute('data-pkg');

  switch (action) {
    case 'set-role':
      setRole(el.getAttribute('data-role'));
      break;
    case 'select-package':
      selectPackage(pkg);
      break;
    case 'start-zone': {
      const type = document.querySelector('#zone-type')?.value ?? 'riot';
      const severity = document.querySelector('#zone-severity')?.value ?? 'medium';
      startZoneDraft(type, severity);
      break;
    }
    case 'cancel-zone':
      cancelZoneDraft();
      break;
    case 'drop-off':
      dropOffAtOxo(pkg);
      break;
    case 'pickup':
      userDecision(pkg, 'pickup');
      break;
    case 'wait':
      userDecision(pkg, 'wait');
      break;
  }
});

// Keep the active zone draft in sync if the user changes the reason/severity
// selects while a draft is already active.
document.addEventListener('change', (e) => {
  if (e.target.id === 'zone-type' || e.target.id === 'zone-severity') {
    if (state.zoneDraft) {
      const type = document.querySelector('#zone-type')?.value ?? 'riot';
      const severity = document.querySelector('#zone-severity')?.value ?? 'medium';
      startZoneDraft(type, severity);
    }
  }
});

// --- Render loop -------------------------------------------------------------
let toastTimer = null;

function render() {
  const panel = document.querySelector('#panel');
  panel.innerHTML =
    state.role === 'partner' ? renderPartnerPanel(state) : renderUserPanel(state);

  map.update(state);

  // Role tab active styles.
  const partnerBtn = document.querySelector('#role-partner');
  const userBtn = document.querySelector('#role-user');
  partnerBtn.className =
    'px-4 py-1.5 rounded-md text-sm font-semibold transition ' +
    (state.role === 'partner' ? 'bg-white shadow text-slate-900' : 'text-slate-500 hover:text-slate-700');
  userBtn.className =
    'px-4 py-1.5 rounded-md text-sm font-semibold transition ' +
    (state.role === 'user' ? 'bg-white shadow text-slate-900' : 'text-slate-500 hover:text-slate-700');

  // Toast.
  const toast = document.querySelector('#toast');
  if (state.toast) {
    const tones = { green: 'bg-emerald-600', amber: 'bg-amber-500', slate: 'bg-slate-800' };
    toast.className = `fixed bottom-5 right-5 z-50 px-4 py-2.5 rounded-lg text-white text-sm font-semibold shadow-lg ${tones[state.toast.tone] ?? tones.slate}`;
    toast.textContent = state.toast.message;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(dismissToast, 2800);
  } else {
    toast.className = 'hidden';
  }
}

subscribe(render);
render();
