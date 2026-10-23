// ==========================================
// MATRIX TAB (CALENDAR AUDIT & STATS)
// ==========================================

function renderMatrixCalendar() {
  const container = document.getElementById('view_matrix');
  if (!container) return;

  const y = currentDate.getFullYear();
  const m = currentDate.getMonth();
  const monthName = new Date(y, m, 1).toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
  const lD = new Date(y, m + 1, 0).getDate();

  container.innerHTML = `
    <div class="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 shadow-lg">
      <div class="flex items-center justify-between mb-4">
        <div><h2 class="text-base font-bold text-white">${monthName}</h2><div class="text-xs text-slate-400">Strict Green = 100% Habit & Commitment Completion</div></div>
        <div class="flex items-center gap-2 text-[10px] font-bold">
          <span class="flex items-center gap-1 text-emerald-400"><span class="w-2 h-2 rounded-full bg-emerald-500"></span>Complete</span>
          <span class="flex items-center gap-1 text-rose-400"><span class="w-2 h-2 rounded-full bg-rose-500"></span>Breached</span>
        </div>
      </div>
      <div class="grid grid-cols-7 gap-1.5 text-center text-[10px] text-slate-500 font-bold mb-2 uppercase"><div>M</div><div>T</div><div>W</div><div>T</div><div>F</div><div>S</div><div>S</div></div>
      <div id="monthGrid" class="grid grid-cols-7 gap-1.5 text-center"></div>
    </div>
    <div class="grid grid-cols-3 gap-2.5">
      <div class="bg-slate-900/80 border border-slate-800 rounded-2xl p-3 text-center"><div class="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">Full Green</div><div id="monthlyFullGreen" class="text-lg font-black text-emerald-400">0</div></div>
      <div class="bg-slate-900/80 border border-slate-800 rounded-2xl p-3 text-center"><div class="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">Drone Hours</div><div id="monthlyDroneCount" class="text-lg font-black text-indigo-400">0 hrs</div></div>
      <div class="bg-slate-900/80 border border-slate-800 rounded-2xl p-3 text-center"><div class="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">Adherence</div><div id="monthlyAdherence" class="text-lg font-black text-cyan-400">100%</div></div>
    </div>
  `;

  const grid = document.getElementById('monthGrid');
  let fG = 0, dH = 0, eD = 0, cA = 0;
  let dO = new Date(y, m, 1).getDay() - 1;
  if (dO === -1) dO = 6;

  for (let i = 0; i < dO; i++) {
    const e = document.createElement('div');
    e.className = 'h-10 rounded-lg bg-slate-950/20';
    grid.appendChild(e);
  }

  for (let d = 1; d <= lD; d++) {
    const tD = new Date(y, m, d);
    const rec = appData[getDayKey(tD)] || { boundaries: {}, actions: {} };
    const s = evaluateDayStatus(rec, tD);
    const c = document.createElement('button');
    c.onclick = () => { currentDate = new Date(y, m, d); switchMainTab('today'); };

    let bg = 'bg-slate-950/40 border-slate-900 text-slate-600';
    let b = '';

    if (s === 'unactivated') {
      bg = 'bg-slate-950/30 border-slate-900 text-slate-600';
    } else if (s === 'locked') {
      bg = 'bg-slate-950/60 border-slate-900 text-slate-700 cursor-not-allowed';
      b = '<span class="text-[6px] absolute top-0.5 right-1">🔒</span>';
    } else {
      eD++;
      if (s === 'breached') {
        bg = 'bg-rose-950/40 border-rose-600/50 text-rose-300 font-bold';
      } else if (s === 'complete') {
        bg = 'bg-emerald-950/50 border-emerald-500 text-emerald-300 font-extrabold shadow-sm shadow-emerald-500/20';
        fG++; cA++;
      } else {
        bg = 'bg-amber-950/30 border-amber-500/40 text-amber-300 font-bold';
        cA++;
      }
      if (rec.drone?.done) {
        dH++;
        b = '<span class="text-[7px] absolute top-0.5 right-0.5">🚁</span>';
      }
    }

    c.className = `relative h-10 rounded-lg border flex flex-col items-center justify-center text-[11px] transition hover:scale-105 ${bg}`;
    c.innerHTML = `<span>${d}</span>${b}`;
    grid.appendChild(c);
  }

  document.getElementById('monthlyFullGreen').innerText = fG;
  document.getElementById('monthlyDroneCount').innerText = `${dH} hrs`;
  document.getElementById('monthlyAdherence').innerText = `${eD > 0 ? Math.round((cA / eD) * 100) : 100}%`;
}
