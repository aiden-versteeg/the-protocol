// =========================================================================
// PROTOCOL OS: DISCIPLINE MATRIX (GREEN ONLY FOR 100% PERFECT DAYS)
// =========================================================================

function renderMatrixView() {
  const container = document.getElementById('view_matrix');
  const todayKey = getTodayKey();
  
  // Build last 28 days
  const days = [];
  for (let i = 27; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const dayNum = String(d.getDate()).padStart(2, '0');
    days.push(`${y}-${m}-${dayNum}`);
  }

  let totalPerfect = 0;
  let totalEvaluated = 0;

  const gridHtml = days.map(dateStr => {
    const record = appData[dateStr];
    const isFutureOrEmpty = !record;
    
    let isPerfect = false;
    let completedCount = 0;
    
    if (record && record.habits) {
      completedCount = Object.values(record.habits).filter(Boolean).length;
      isPerfect = completedCount === DEFAULT_HABITS.length;
      totalEvaluated++;
      if (isPerfect) totalPerfect++;
    }

    const isToday = dateStr === todayKey;
    const dayLabel = dateStr.slice(-2);

    let cellColor = "bg-slate-950 border-slate-800 text-slate-600";
    if (isPerfect) {
      cellColor = "bg-emerald-500/20 border-emerald-500 text-emerald-300 shadow-sm shadow-emerald-500/30";
    } else if (completedCount > 0) {
      cellColor = "bg-rose-950/30 border-rose-800/80 text-rose-400";
    }

    return `
      <div class="h-14 rounded-xl border flex flex-col items-center justify-between p-1.5 transition ${cellColor} ${isToday ? 'ring-2 ring-emerald-400' : ''}">
        <span class="text-[9px] font-mono font-bold">${dayLabel}</span>
        <div class="text-[10px] font-black">
          ${isPerfect ? '✓' : completedCount > 0 ? `${completedCount}/${DEFAULT_HABITS.length}` : '—'}
        </div>
      </div>
    `;
  }).join('');

  const rate = totalEvaluated > 0 ? Math.round((totalPerfect / totalEvaluated) * 100) : 0;

  container.innerHTML = `
    <div class="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3">
      <div class="flex items-center justify-between border-b border-slate-800 pb-2">
        <h2 class="text-xs font-black tracking-wide text-white uppercase flex items-center gap-1.5">
          <i data-lucide="layout-grid" class="w-4 h-4 text-emerald-400"></i>
          Discipline Matrix (Last 28 Days)
        </h2>
        <span class="text-xs font-bold text-emerald-400">${rate}% Flawless</span>
      </div>

      <div class="grid grid-cols-7 gap-1.5 pt-1">
        ${['S','M','T','W','T','F','S'].map(d => `<div class="text-center text-[9px] font-bold text-slate-500 uppercase">${d}</div>`).join('')}
        ${gridHtml}
      </div>

      <div class="bg-slate-950 border border-slate-800/80 rounded-xl p-3 flex items-center justify-between text-xs">
        <div class="flex items-center gap-2">
          <span class="w-3 h-3 rounded bg-emerald-500/20 border border-emerald-500"></span>
          <span class="text-slate-300 text-[11px]">100% Completed</span>
        </div>
        <div class="flex items-center gap-2">
          <span class="w-3 h-3 rounded bg-rose-950/40 border border-rose-800"></span>
          <span class="text-slate-300 text-[11px]">Incomplete</span>
        </div>
        <div class="flex items-center gap-2">
          <span class="w-3 h-3 rounded bg-slate-950 border border-slate-800"></span>
          <span class="text-slate-300 text-[11px]">No Data</span>
        </div>
      </div>
    </div>
  `;
}
