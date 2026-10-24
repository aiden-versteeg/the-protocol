// ===============================================
// TODAY TAB LOGIC: DAILY PROTOCOL & KPI OVERVIEW
// ===============================================

function renderTodayTab(rec) {
  const container = document.getElementById('view_today');
  if (!container) return;

  const isFuture = isDateInFuture(currentDate);
  const isPrior = isDateBeforeStart(currentDate);
  const isWeekend = (currentDate.getDay() === 0 || currentDate.getDay() === 6);
  const dayStatus = evaluateDayStatus(rec, currentDate);

  const statusMap = {
    unactivated: { t: "Unactivated", c: "text-slate-500" },
    locked: { t: "Locked", c: "text-slate-500" },
    breached: { t: "Breached", c: "text-rose-400" },
    pending: { t: "Incomplete", c: "text-amber-400" },
    complete: { t: "100% Complete", c: "text-emerald-400" }
  };

  const wVol = (isPrior || isFuture) ? 0 : getWaterVolume(rec.water);
  const wPct = Math.min(100, Math.round((wVol / 3000) * 100));

  let totalCal = 0, totalP = 0, totalC = 0, totalF = 0;
  MEALS.forEach(m => {
    const mD = rec.meals[m.id] || {};
    totalCal += Number(mD.cal) || 0;
    totalP += Number(mD.p) || 0;
    totalC += Number(mD.c) || 0;
    totalF += Number(mD.f) || 0;
  });

  const dynCal = computeDynamicCalories(rec);
  const targetCal = userGoals.calories || 2600;
  const targetP = userGoals.protein || 160;
  const calPct = Math.min(100, Math.round((totalCal / targetCal) * 100));
  const protPct = Math.min(100, Math.round((totalP / targetP) * 100));

  container.innerHTML = `
    <!-- DATE CONTROLS -->
    <div class="flex items-center justify-between bg-slate-900/60 border border-slate-800/80 rounded-xl px-3 py-2 backdrop-blur-sm shadow-sm">
      <button onclick="shiftDate(-1)" class="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"><i data-lucide="chevron-left" class="w-5 h-5"></i></button>
      <div class="text-center flex flex-col items-center">
        <span class="text-sm font-bold text-slate-200">${currentDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
        <span class="text-[9px] px-2 py-0.5 mt-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700">${isWeekend ? 'Weekend' : 'Weekday'}</span>
      </div>
      <button onclick="shiftDate(1)" class="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"><i data-lucide="chevron-right" class="w-5 h-5"></i></button>
    </div>

    ${isPrior ? '<div class="rounded-xl p-3 flex items-center gap-2.5 text-xs font-semibold border bg-slate-900 border-slate-800 text-slate-400"><i data-lucide="info" class="w-4 h-4 text-slate-400"></i><span>Pre-Protocol Date: Before chosen start date.</span></div>' : ''}
    ${isFuture ? '<div class="rounded-xl p-3 flex items-center gap-2.5 text-xs font-semibold border bg-amber-500/10 border-amber-500/30 text-amber-300"><i data-lucide="lock" class="w-4 h-4 text-amber-400"></i><span>Future Date Locked.</span></div>' : ''}

    <!-- KPI ROW -->
    <div class="grid grid-cols-3 gap-2.5">
      <div class="bg-slate-900/80 border border-slate-800 p-3 rounded-2xl text-center">
        <div class="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">Status</div>
        <div class="text-[10px] font-extrabold ${statusMap[dayStatus].c}">${statusMap[dayStatus].t}</div>
      </div>
      <div class="bg-slate-900/80 border border-slate-800 p-3 rounded-2xl text-center">
        <div class="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">Water</div>
        <div class="text-xs font-extrabold text-cyan-400">${wVol.toLocaleString()} ml</div>
      </div>
      <div class="bg-slate-900/80 border border-slate-800 p-3 rounded-2xl text-center">
        <div class="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">Nutrition</div>
        <div class="text-[10px] font-extrabold text-amber-400">${totalCal} kcal • ${totalP}g P</div>
      </div>
    </div>

    <div class="${(isFuture || isPrior) ? 'space-y-3 locked-overlay' : 'space-y-3'}">
      <!-- WEIGH IN -->
      <div class="bg-slate-900/80 border border-slate-800 rounded-2xl p-3 flex items-center justify-between shadow-lg">
        <div class="flex items-center gap-2.5">
          <div class="w-7 h-7 rounded-lg bg-violet-500/20 border border-violet-500/30 flex items-center justify-center text-violet-400"><i data-lucide="scale" class="w-3.5 h-3.5"></i></div>
          <div><div class="text-xs font-bold text-slate-200">Morning Weigh-In</div><div class="text-[9px] text-slate-400">Fasted, post-restroom metric</div></div>
        </div>
        <div class="flex items-center gap-1.5">
          <input type="number" step="0.1" value="${rec.weight !== null ? rec.weight : ''}" placeholder="lbs" onchange="saveTodayWeight(this.value)" class="w-16 bg-slate-950 border border-slate-800 rounded-lg px-2 py-1 text-xs font-extrabold text-violet-300 text-center" />
          <span class="text-xs text-slate-500 font-bold">lbs</span>
        </div>
      </div>

      <!-- NUTRITION PERFORMANCE SUMMARY CARD (COMPACT COCKPIT) -->
      <div class="bg-slate-900/80 border border-slate-800 rounded-2xl p-3.5 shadow-lg space-y-3">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <div class="w-7 h-7 rounded-lg bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <i data-lucide="pie-chart" class="w-3.5 h-3.5"></i>
            </div>
            <div>
              <h2 class="text-xs font-bold text-white">Nutrition Performance Summary</h2>
              <div class="text-[9px] text-slate-400">${totalCal} / ${targetCal} kcal (${totalP}g / ${targetP}g P)</div>
            </div>
          </div>
          <button onclick="selectDropdownTab('nutrition', 'Nutrition')" class="px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-[10px] font-bold transition flex items-center gap-1">
            <span>Track Meals</span>
            <i data-lucide="arrow-right" class="w-3 h-3"></i>
          </button>
        </div>

        <!-- Mini Progress Bars -->
        <div class="space-y-1.5">
          <div>
            <div class="flex justify-between text-[9px] font-semibold text-slate-400 mb-0.5">
              <span>Energy Intake</span>
              <span class="font-mono text-slate-300">${calPct}%</span>
            </div>
            <div class="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden">
              <div class="h-full bg-gradient-to-r from-amber-500 to-orange-500" style="width: ${calPct}%"></div>
            </div>
          </div>
          <div>
            <div class="flex justify-between text-[9px] font-semibold text-slate-400 mb-0.5">
              <span>Hypertrophy Protein</span>
              <span class="font-mono text-amber-400">${protPct}%</span>
            </div>
            <div class="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden">
              <div class="h-full bg-gradient-to-r from-amber-400 to-emerald-400" style="width: ${protPct}%"></div>
            </div>
          </div>
        </div>

        <!-- 4-Macro Key Breakdown -->
        <div class="grid grid-cols-4 gap-1 pt-1 text-center bg-slate-950/60 p-2 rounded-xl border border-slate-800/80">
          <div>
            <span class="text-[8px] text-slate-400 uppercase font-bold block">Calories</span>
            <span class="text-[11px] font-black text-white">${totalCal}</span>
          </div>
          <div>
            <span class="text-[8px] text-amber-400 uppercase font-bold block">Protein</span>
            <span class="text-[11px] font-black text-amber-400">${totalP}g</span>
          </div>
          <div>
            <span class="text-[8px] text-cyan-400 uppercase font-bold block">Carbs</span>
            <span class="text-[11px] font-black text-cyan-400">${totalC}g</span>
          </div>
          <div>
            <span class="text-[8px] text-rose-400 uppercase font-bold block">Fats</span>
            <span class="text-[11px] font-black text-rose-400">${totalF}g</span>
          </div>
        </div>

        <!-- Dynamic Burn Footprint -->
        <div class="flex items-center justify-between text-[9px] font-mono text-slate-400 px-1 pt-0.5 border-t border-slate-800/60">
          <span>Target TDEE: <strong class="text-white">${dynCal.total} kcal</strong></span>
          <span>BMR ${dynCal.bmr} • Burn +${dynCal.exercise}</span>
        </div>
      </div>

      <!-- MORNING FOCUS COMMITMENTS -->
      <div class="bg-slate-900/80 border border-indigo-500/30 rounded-2xl p-3.5 shadow-lg space-y-2.5">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <div class="w-7 h-7 rounded-lg bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400"><i data-lucide="lock" class="w-3.5 h-3.5"></i></div>
            <div>
              <h2 class="text-xs font-bold text-white">Morning Focus Commitments</h2>
              <div class="text-[9px] text-slate-400">Locks permanently 1 min after typing. 100% required</div>
            </div>
          </div>
          <span class="text-[9px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
            ${rec.customTasks.filter(t => t.done).length}/${rec.customTasks.length} Done
          </span>
        </div>
        <div class="flex gap-1.5">
          <input type="text" id="newCommitmentInput" placeholder="Add morning task..." class="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-[11px] text-slate-200 placeholder-slate-600" onkeydown="if(event.key==='Enter') addCommitmentTask()" />
          <button onclick="addCommitmentTask()" class="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] font-bold rounded-lg transition flex items-center gap-1 shrink-0">
            <i data-lucide="plus" class="w-3 h-3"></i> Commit
          </button>
        </div>
        <div id="customCommitmentsList" class="space-y-1.5 pt-1"></div>
      </div>

      <!-- DAILY BASELINE HABITS -->
      <details open class="group bg-slate-900/80 border border-slate-800 rounded-2xl shadow-lg">
        <summary class="flex items-center justify-between p-3.5 cursor-pointer">
          <div class="flex items-center gap-2">
            <div class="w-7 h-7 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400"><i data-lucide="check-circle-2" class="w-3.5 h-3.5"></i></div>
            <div><h2 class="text-xs font-bold text-white">Daily Baseline Regimen</h2><div class="text-[9px] text-slate-400 font-medium">Mandatory every day for green status</div></div>
          </div>
          <i data-lucide="chevron-down" class="w-4 h-4 text-slate-500 group-open:rotate-180 transition-transform duration-300"></i>
        </summary>
        <div class="px-3.5 pb-3.5 space-y-1.5 border-t border-slate-800/50 pt-3" id="actionsList"></div>
      </details>

      <!-- WEEKLY SPRINTS & NON-DAILY TARGETS -->
      <details open class="group bg-slate-900/80 border border-indigo-500/20 rounded-2xl shadow-lg">
        <summary class="flex items-center justify-between p-3.5 cursor-pointer">
          <div class="flex items-center gap-2">
            <div class="w-7 h-7 rounded-lg bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400"><i data-lucide="target" class="w-3.5 h-3.5"></i></div>
            <div><h2 class="text-xs font-bold text-white">Weekly Sprints & Objectives</h2><div class="text-[9px] text-slate-400 font-medium">Non-daily targets tracked by weekly quota</div></div>
          </div>
          <i data-lucide="chevron-down" class="w-4 h-4 text-slate-500 group-open:rotate-180 transition-transform duration-300"></i>
        </summary>
        <div class="px-3.5 pb-3.5 space-y-2 border-t border-slate-800/50 pt-3" id="weeklySprintsList"></div>
      </details>

      <!-- HYDRATION (3.0L TARGET) -->
      <details open class="group bg-slate-900/80 border border-slate-800 rounded-2xl shadow-lg">
        <summary class="flex items-center justify-between p-3.5 cursor-pointer">
          <div class="flex items-center gap-2">
            <div class="w-7 h-7 rounded-lg bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400"><i data-lucide="droplet" class="w-3.5 h-3.5"></i></div>
            <div><h2 class="text-xs font-bold text-white">Hydration Tracker</h2><div class="text-[9px] text-slate-400 font-medium">Target: 3,000+ ml (3L)</div></div>
          </div>
          <div class="flex items-center gap-2">
            <div class="text-[9px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700">${wPct}% (${wVol}/3L)</div>
            <i data-lucide="chevron-down" class="w-4 h-4 text-slate-500 group-open:rotate-180 transition-transform duration-300"></i>
          </div>
        </summary>
        <div class="px-3.5 pb-3.5 border-t border-slate-800/50 pt-3">
          <div class="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden mb-3"><div class="h-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-300" style="width: ${wPct}%"></div></div>
          <div class="grid grid-cols-2 gap-2.5">
            <div class="bg-slate-950/60 border border-slate-800 rounded-xl p-2.5 flex items-center justify-between">
              <div><div class="text-[10px] font-bold text-slate-200">1.0L Bottle</div><div class="text-sm font-black text-cyan-400">${rec.water.b1000 || 0}x</div></div>
              <div class="flex items-center gap-1"><button onclick="decrementBottle('b1000')" class="w-6 h-6 bg-slate-800 hover:bg-slate-700 rounded-md text-slate-300 text-xs font-bold">-</button><button onclick="incrementBottle('b1000')" class="px-2 h-6 bg-cyan-600/30 border border-cyan-500/40 rounded-md text-cyan-300 text-[10px] font-bold">+1L</button></div>
            </div>
            <div class="bg-slate-950/60 border border-slate-800 rounded-xl p-2.5 flex items-center justify-between">
              <div><div class="text-[10px] font-bold text-slate-200">710ml Bottle</div><div class="text-sm font-black text-cyan-400">${rec.water.b710 || 0}x</div></div>
              <div class="flex items-center gap-1"><button onclick="decrementBottle('b710')" class="w-6 h-6 bg-slate-800 hover:bg-slate-700 rounded-md text-slate-300 text-xs font-bold">-</button><button onclick="incrementBottle('b710')" class="px-2 h-6 bg-cyan-600/30 border border-cyan-500/40 rounded-md text-cyan-300 text-[10px] font-bold">+710</button></div>
            </div>
          </div>
        </div>
      </details>

      <!-- BOUNDARIES -->
      <details class="group bg-slate-900/80 border border-slate-800 rounded-2xl shadow-lg">
        <summary class="flex items-center justify-between p-3.5 cursor-pointer">
          <div class="flex items-center gap-2">
            <div class="w-7 h-7 rounded-lg bg-rose-500/20 border border-rose-500/30 flex items-center justify-center text-rose-400"><i data-lucide="shield-alert" class="w-3.5 h-3.5"></i></div>
            <div><h2 class="text-xs font-bold text-white">Avoidance Boundaries</h2><div class="text-[9px] text-slate-400 font-medium">Defaults to Clean • Expand to fail</div></div>
          </div>
          <i data-lucide="chevron-down" class="w-4 h-4 text-slate-500 group-open:rotate-180 transition-transform duration-300"></i>
        </summary>
        <div class="px-3.5 pb-3.5 space-y-1.5 border-t border-slate-800/50 pt-3" id="boundariesList"></div>
      </details>
    </div>
  `;

  renderCommitmentTasks(rec);
  renderActionsList(rec, isPrior, isFuture, isWeekend);
  renderWeeklySprintsList(rec, isPrior, isFuture);
  renderBoundariesList(rec, isPrior, isFuture);
  lucide.createIcons();
}

function renderCommitmentTasks(rec) {
  const list = document.getElementById('customCommitmentsList');
  if (!list) return;
  list.innerHTML = '';
  const tasks = rec.customTasks || [];
  if (tasks.length === 0) {
    list.innerHTML = '<div class="text-[10px] text-slate-500 italic py-1">No custom morning commitments set for today yet.</div>';
    return;
  }

  const now = Date.now();
  tasks.forEach(t => {
    const elapsed = Math.floor((now - t.createdAt) / 1000);
    const remaining = Math.max(0, 60 - elapsed);
    const isLocked = remaining === 0;

    const div = document.createElement('div');
    div.className = `flex items-center justify-between p-2 rounded-xl border transition ${t.done ? 'bg-indigo-950/20 border-indigo-500/40' : 'bg-slate-950/60 border-slate-800'}`;
    div.innerHTML = `
      <div class="flex items-center gap-2.5 flex-1 pr-2">
        <input type="checkbox" ${t.done ? 'checked' : ''} onchange="toggleCommitmentTask('${t.id}')" class="w-3.5 h-3.5 rounded text-indigo-500 bg-slate-900 border-slate-700 cursor-pointer accent-indigo-500" />
        <span class="text-[11px] font-semibold ${t.done ? 'line-through text-slate-500' : 'text-slate-200'}">${t.text}</span>
      </div>
      <div class="flex items-center gap-1.5 shrink-0">
        ${isLocked 
          ? `<span class="text-[8px] font-extrabold px-1.5 py-0.5 rounded bg-rose-950/50 text-rose-300 border border-rose-800/40 flex items-center gap-0.5"><i data-lucide="lock" class="w-2.5 h-2.5"></i> Locked</span>` 
          : `<span class="text-[8px] font-bold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">Locks in ${remaining}s</span>`
        }
        <button onclick="deleteCommitmentTask('${t.id}')" class="text-slate-500 hover:text-rose-400 p-0.5"><i data-lucide="trash-2" class="w-3 h-3"></i></button>
      </div>
    `;
    list.appendChild(div);
  });
}

function renderActionsList(rec, isPrior, isFuture, isWeekend) {
  const actC = document.getElementById('actionsList');
  if (!actC) return;
  actC.innerHTML = '';

  DAILY_ACTIONS.forEach(a => {
    const checked = !isPrior && !isFuture && !!rec.actions[a.id];
    const badge = (a.weekdayOnly && isWeekend) ? '<span class="text-[8px] px-1 rounded bg-slate-800 text-slate-400 ml-1">Weekend Off</span>' : '';
    const div = document.createElement('label');
    div.className = `flex items-center justify-between p-2 rounded-xl border transition ${checked ? 'bg-emerald-950/20 border-emerald-500/40' : 'bg-slate-950/40 border-slate-800'}`;
    div.innerHTML = `
      <div class="flex items-center gap-2.5">
        <input type="checkbox" ${checked ? 'checked' : ''} ${isPrior || isFuture || a.isWaterLinked || a.isProteinLinked ? 'disabled' : ''} class="w-3.5 h-3.5 rounded text-emerald-500 bg-slate-900 border-slate-700" />
        <div><div class="text-[11px] font-bold text-slate-200 flex items-center">${a.label} ${badge}</div><div class="text-[9px] text-slate-500">${a.desc}</div></div>
      </div>
      <div class="text-[9px] font-extrabold ${checked ? 'text-emerald-400' : 'text-slate-600'}">${(isPrior || isFuture) ? 'Locked' : (checked ? 'Done' : 'Req')}</div>
    `;
    if (!isPrior && !isFuture && !a.isWaterLinked && !a.isProteinLinked) {
      div.querySelector('input').addEventListener('change', (e) => { rec.actions[a.id] = e.target.checked; persist(); });
    }
    actC.appendChild(div);
  });
}

function renderWeeklySprintsList(rec, isPrior, isFuture) {
  const weeklyC = document.getElementById('weeklySprintsList');
  if (!weeklyC) return;
  weeklyC.innerHTML = '';

  const weeklyDrone = getWeeklyStat('drone', currentDate);
  const weeklyPt = getWeeklyStat('pt', currentDate);
  const weeklyPrehab = getWeeklyStat('prehab', currentDate);

  const nonDailyItems = [
    { id: 'lift', label: 'PPLPP Weight Training', statusText: rec.workout?.completed ? 'Completed ✓' : 'Tap to start live session', isDone: rec.workout?.completed, actionFn: 'launchLiveWorkoutSession()' },
    { id: 'drone', label: 'Drone Build Sprint (1 Hr)', statusText: `${weeklyDrone}/5 this wk`, isDone: rec.drone?.done, actionFn: 'toggleDroneSprint()' },
    { id: 'pt', label: 'Groin Injury PT', statusText: `${weeklyPt}/3 this wk`, isDone: rec.pt, actionFn: 'togglePtToday()' },
    { id: 'prehab', label: 'Joint & Hip Prehab', statusText: `${weeklyPrehab}/4 this wk`, isDone: rec.prehab, actionFn: 'togglePrehabToday()' },
    { id: 'climb', label: 'Bouldering / Rock Climbing', statusText: rec.climbing ? 'Logged (+350 kcal)' : 'Optional', isDone: rec.climbing, actionFn: 'toggleClimbToday()' }
  ];

  nonDailyItems.forEach(item => {
    const div = document.createElement('div');
    div.className = `flex items-center justify-between p-2 rounded-xl border transition ${item.isDone ? 'bg-indigo-950/20 border-indigo-500/40' : 'bg-slate-950/50 border-slate-800'}`;
    div.innerHTML = `
      <div>
        <div class="text-[11px] font-bold ${item.isDone ? 'text-indigo-300' : 'text-slate-200'}">${item.label}</div>
        <div class="text-[9px] text-slate-500 font-mono">${item.statusText}</div>
      </div>
      <button onclick="${item.actionFn}" ${isPrior || isFuture ? 'disabled' : ''} class="px-2.5 py-1 rounded-lg text-[10px] font-bold border transition ${
        item.isDone ? 'bg-indigo-600 border-indigo-400 text-white' : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-300'
      }">${item.isDone ? 'Completed ✓' : 'Start Target'}</button>
    `;
    weeklyC.appendChild(div);
  });
}

function renderBoundariesList(rec, isPrior, isFuture) {
  const bndC = document.getElementById('boundariesList');
  if (!bndC) return;
  bndC.innerHTML = '';

  BOUNDARIES.forEach(b => {
    const failed = !isPrior && !isFuture && !!rec.boundaries[b.id];
    const div = document.createElement('div');
    div.className = `flex items-center justify-between p-2 rounded-xl border transition-all ${failed ? 'bg-rose-950/20 border-rose-600/40' : 'bg-slate-950/40 border-slate-800'}`;
    div.innerHTML = `
      <div class="pr-2"><div class="text-[11px] font-bold ${failed ? 'text-rose-300' : 'text-slate-200'}">${b.label}</div><div class="text-[9px] text-slate-500">${b.desc}</div></div>
      <div class="flex items-center gap-1 bg-slate-900 border border-slate-800 p-0.5 rounded-lg">
        <button onclick="setBoundary('${b.id}', false)" ${isPrior || isFuture ? 'disabled' : ''} class="px-2 py-0.5 rounded text-[9px] font-bold transition ${!failed && !isPrior && !isFuture ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'text-slate-600'}">Clean</button>
        <button onclick="setBoundary('${b.id}', true)" ${isPrior || isFuture ? 'disabled' : ''} class="px-2 py-0.5 rounded text-[9px] font-bold transition ${failed ? 'bg-rose-600 text-white' : 'text-slate-600 hover:text-rose-400'}">Fail</button>
      </div>
    `;
    bndC.appendChild(div);
  });
}

function saveTodayWeight(val) {
  if (isDateInFuture(currentDate) || isDateBeforeStart(currentDate)) return;
  const rec = getDayRecord(getDayKey(currentDate));
  rec.weight = val ? parseFloat(val) : null;
  persist();
}

function incrementBottle(type) {
  if (isDateInFuture(currentDate) || isDateBeforeStart(currentDate)) return;
  const rec = getDayRecord(getDayKey(currentDate));
  rec.water[type] = (rec.water[type] || 0) + 1;
  syncAutomations(rec);
  persist();
}

function decrementBottle(type) {
  if (isDateInFuture(currentDate) || isDateBeforeStart(currentDate)) return;
  const rec = getDayRecord(getDayKey(currentDate));
  if ((rec.water[type] || 0) > 0) {
    rec.water[type]--;
    syncAutomations(rec);
    persist();
  }
}

function setBoundary(bId, val) {
  if (isDateInFuture(currentDate) || isDateBeforeStart(currentDate)) return;
  const rec = getDayRecord(getDayKey(currentDate));
  rec.boundaries[bId] = val;
  persist();
}

function addCommitmentTask() {
  if (isDateInFuture(currentDate) || isDateBeforeStart(currentDate)) return;
  const input = document.getElementById('newCommitmentInput');
  const text = input.value.trim();
  if (!text) return;
  const rec = getDayRecord(getDayKey(currentDate));
  rec.customTasks.push({ id: 'ct_' + Date.now(), text, createdAt: Date.now(), done: false });
  input.value = '';
  persist();
}

function toggleCommitmentTask(taskId) {
  if (isDateInFuture(currentDate) || isDateBeforeStart(currentDate)) return;
  const rec = getDayRecord(getDayKey(currentDate));
  const t = rec.customTasks.find(x => x.id === taskId);
  if (t) { t.done = !t.done; persist(); }
}

function deleteCommitmentTask(taskId) {
  if (isDateInFuture(currentDate) || isDateBeforeStart(currentDate)) return;
  const rec = getDayRecord(getDayKey(currentDate));
  const t = rec.customTasks.find(x => x.id === taskId);
  if (!t) return;
  const elapsed = Math.floor((Date.now() - t.createdAt) / 1000);
  if (elapsed >= 60) {
    alert("Locked 1 minute after typing. It cannot be deleted!");
    return;
  }
  rec.customTasks = rec.customTasks.filter(x => x.id !== taskId);
  persist();
}
