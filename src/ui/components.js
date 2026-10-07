// Shared tiny UI building blocks.

const TONE = {
  blue: 'bg-blue-100 text-blue-700 ring-blue-200',
  red: 'bg-red-100 text-red-700 ring-red-200',
  amber: 'bg-amber-100 text-amber-800 ring-amber-200',
  green: 'bg-emerald-100 text-emerald-700 ring-emerald-200',
  slate: 'bg-slate-200 text-slate-700 ring-slate-300',
};

export function badge(label, tone = 'slate') {
  return `<span class="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ring-1 whitespace-nowrap ${TONE[tone] ?? TONE.slate}">${label}</span>`;
}

export function sectionTitle(text, sub) {
  return `
    <div class="px-4 pt-4 pb-2">
      <h3 class="text-sm font-bold text-slate-800">${text}</h3>
      ${sub ? `<p class="text-xs text-slate-500 mt-0.5">${sub}</p>` : ''}
    </div>`;
}
