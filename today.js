// ==========================================
// TODAY TAB LOGIC, DECONSTRUCTION & KEY ROTATION
// ==========================================

const mealImages = { m_breakfast: [], m_lunch: [], m_dinner: [], m_snacks: [] };

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
    complete: { t: "100% Complete ✓", c: "text-emerald-400" }
  };

  const wVol = (isPrior || isFuture) ? 0 : getWaterVolume(rec.water);
  // Water target: 3000 ml (3L)
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

      <!-- MORNING FOCUS COMMITMENTS -->
      <div class="bg-slate-900/80 border border-indigo-500/30 rounded-2xl p-3.5 shadow-lg space-y-2.5">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <div class="w-7 h-7 rounded-lg bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400"><i data-lucide="lock" class="w-3.5 h-3.5"></i></div>
            <div>
              <h2 class="text-xs font-bold text-white">Morning Focus Commitments</h2>
              <div class="text-[9px] text-slate-400">Locks permanently 1 min after typing • 100% required</div>
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
            <div><h2 class="text-xs font-bold text-white">Weekly Sprints & Objectives</h2><div class="text-[9px] text-slate-400 font-medium">Non-daily targets • Tracked by weekly quota</div></div>
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

      <!-- MEALS -->
      <details open class="group bg-slate-900/80 border border-slate-800 rounded-2xl shadow-lg">
        <summary class="flex items-center justify-between p-3.5 cursor-pointer">
          <div class="flex items-center gap-2">
            <div class="w-7 h-7 rounded-lg bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400"><i data-lucide="utensils" class="w-3.5 h-3.5"></i></div>
            <div><h2 class="text-xs font-bold text-white">Meal & Nutrition Tracker</h2><div class="text-[9px] text-slate-400 font-medium">Deconstructed UCSB Dining & Self-Audit</div></div>
          </div>
          <i data-lucide="chevron-down" class="w-4 h-4 text-slate-500 group-open:rotate-180 transition-transform duration-300"></i>
        </summary>
        <div class="px-3.5 pb-3.5 border-t border-slate-800/50 pt-3 space-y-3">
          <div class="bg-slate-950/70 border border-amber-500/20 rounded-xl p-2.5 space-y-2">
            <div class="flex items-center justify-between">
              <span class="text-[10px] font-bold text-amber-300 flex items-center gap-1"><i data-lucide="calculator" class="w-3 h-3 text-amber-400"></i> Dynamic Calorie Intake</span>
              <button onclick="applyDynamicCalorieGoal()" class="text-[9px] font-bold px-2 py-0.5 rounded bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 transition">Set as Target</button>
            </div>
            <div class="flex items-baseline justify-between">
              <div><span class="text-base font-black text-white">${dynCal.total.toLocaleString()}</span><span class="text-[10px] text-slate-400 font-bold ml-0.5">kcal / day</span></div>
              <div class="text-[9px] text-slate-400 font-mono text-right">BMR: ${dynCal.bmr} • Act: +${dynCal.exercise} • Bulk: +${dynCal.surplus}</div>
            </div>
          </div>

          <div class="grid grid-cols-4 gap-1 bg-slate-950/60 border border-slate-800/80 p-2 rounded-xl mb-2 text-center">
            <div><div class="text-[8px] text-slate-400 font-bold uppercase">Calories</div><div class="text-[11px] font-black text-white">${totalCal}</div><div class="text-[7px] text-slate-500">/ ${userGoals.calories}</div></div>
            <div><div class="text-[8px] text-amber-400 font-bold uppercase">Protein</div><div class="text-[11px] font-black text-amber-400">${totalP}g</div><div class="text-[7px] text-slate-500">/ ${userGoals.protein}g</div></div>
            <div><div class="text-[8px] text-cyan-400 font-bold uppercase">Carbs</div><div class="text-[11px] font-black text-cyan-400">${totalC}g</div><div class="text-[7px] text-slate-500">/ ${userGoals.carbs}g</div></div>
            <div><div class="text-[8px] text-rose-400 font-bold uppercase">Fats</div><div class="text-[11px] font-black text-rose-400">${totalF}g</div><div class="text-[7px] text-slate-500">/ ${userGoals.fat}g</div></div>
          </div>

          <div id="mealsContainer" class="space-y-3"></div>
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
  renderMealsList(rec, isPrior, isFuture);
}

function renderCommitmentTasks(rec) {
  const list = document.getElementById('customCommitmentsList');
  if (!list) return;
  list.innerHTML = '';
  const tasks = rec.customTasks || [];
  if (tasks.length === 0) {
    list.innerHTML = `<div class="text-[10px] text-slate-500 italic py-1">No custom morning commitments set for today yet.</div>`;
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
          : `<span class="text-[8px] font-bold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">Locks in ${remaining}s</span>
             <button onclick="deleteCommitmentTask('${t.id}')" class="text-slate-500 hover:text-rose-400 p-0.5"><i data-lucide="trash-2" class="w-3 h-3"></i></button>`
        }
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

function renderMealsList(rec, isPrior, isFuture) {
  const mlC = document.getElementById('mealsContainer');
  if (!mlC) return;
  mlC.innerHTML = '';
  MEALS.forEach(m => {
    const mD = rec.meals[m.id] || { text: '', cal: 0, p: 0, c: 0, f: 0, diningHall: 'DLG', portion: '1.0', isUcsb: true, items: [] };
    const card = document.createElement('div');
    card.className = 'bg-slate-950/50 border border-slate-800 rounded-xl p-3 space-y-2';

    let itemsHtml = '';
    if (mD.items && mD.items.length > 0) {
      const rows = mD.items.map(it => `
        <tr class="border-b border-slate-800/60 text-[9px]">
          <td class="py-1 text-slate-200 font-semibold">${it.name} <span class="text-slate-500">(${it.portion || '1 serving'})</span></td>
          <td class="text-right text-amber-400 font-bold">${it.p}g</td>
          <td class="text-right text-cyan-400">${it.c}g</td>
          <td class="text-right text-rose-400">${it.f}g</td>
          <td class="text-right text-slate-300 font-bold">${it.cal}</td>
        </tr>
      `).join('');

      itemsHtml = `
        <details class="group bg-slate-900/60 border border-slate-800/80 rounded-lg p-2 text-[10px] mt-1.5">
          <summary class="cursor-pointer text-amber-400 font-bold flex items-center justify-between">
            <span class="flex items-center gap-1"><i data-lucide="check-check" class="w-3 h-3 text-emerald-400"></i> View Deconstructed Items & Audit</span>
            <i data-lucide="chevron-down" class="w-3 h-3 text-slate-500 group-open:rotate-180 transition-transform"></i>
          </summary>
          <div class="pt-2 overflow-x-auto">
            <table class="w-full text-left">
              <thead>
                <tr class="text-[8px] text-slate-400 border-b border-slate-800">
                  <th class="pb-1">Item</th>
                  <th class="pb-1 text-right">P</th>
                  <th class="pb-1 text-right">C</th>
                  <th class="pb-1 text-right">F</th>
                  <th class="pb-1 text-right">Cal</th>
                </tr>
              </thead>
              <tbody>${rows}</tbody>
            </table>
            ${mD.auditNote ? `<div class="mt-2 text-[8px] text-slate-400 italic border-t border-slate-800 pt-1 leading-normal"><span class="text-emerald-400 font-bold">Audit Check:</span> ${mD.auditNote}</div>` : ''}
          </div>
        </details>
      `;
    }

    card.innerHTML = `
      <div class="flex items-center justify-between">
        <span class="text-xs font-bold text-slate-200">${m.label}</span>
        <div class="flex items-center gap-1.5 text-[9px]">
          <span class="text-slate-400 font-semibold">${mD.cal || 0} kcal</span>
          <span class="text-amber-400 font-bold">${mD.p || 0}g P</span>
          <span class="text-cyan-400 font-bold">${mD.c || 0}g C</span>
          <span class="text-rose-400 font-bold">${mD.f || 0}g F</span>
        </div>
      </div>

      <div class="flex gap-1.5 items-center">
        <input type="text" value="${mD.text || ''}" ${isPrior || isFuture ? 'disabled' : ''} placeholder="Describe foods (e.g. 2 scoops beef fajitas, rice, beans)..." onchange="updateMealField('${m.id}', 'text', this.value)" class="flex-1 bg-slate-900/80 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 placeholder-slate-600" />
        <label class="p-2 bg-slate-800 rounded-lg text-slate-400 hover:text-white cursor-pointer transition flex items-center justify-center shrink-0 border border-slate-700">
          <i data-lucide="camera" class="w-4 h-4"></i>
          <input type="file" accept="image/*" multiple class="hidden" onchange="handleImageSelection(event, '${m.id}')" ${isPrior || isFuture ? 'disabled' : ''} />
        </label>
      </div>

      <div class="bg-slate-900/60 border border-slate-800/80 rounded-lg p-2 space-y-1.5">
        <div class="flex items-center justify-between">
          <label class="flex items-center gap-1.5 text-[10px] text-slate-300 font-semibold cursor-pointer">
            <input type="checkbox" id="ucsb_${m.id}" ${mD.isUcsb !== false ? 'checked' : ''} onchange="updateMealField('${m.id}', 'isUcsb', this.checked)" class="rounded bg-slate-950 border-slate-700 w-3 h-3 text-emerald-500" ${isPrior || isFuture ? 'disabled' : ''} />
            UCSB Dining Hall Meal
          </label>
          <span class="text-[8px] text-emerald-400 font-mono font-bold">NetNutrition Mode</span>
        </div>

        <div class="grid grid-cols-2 gap-2 pt-0.5">
          <div>
            <label class="block text-[8px] text-slate-400 uppercase font-bold mb-0.5">Dining Hall</label>
            <select onchange="updateMealField('${m.id}', 'diningHall', this.value)" ${isPrior || isFuture ? 'disabled' : ''} class="w-full bg-slate-950 border border-slate-800 rounded px-1.5 py-1 text-[10px] text-white font-bold">
              <option value="DLG" ${(mD.diningHall || 'DLG') === 'DLG' ? 'selected' : ''}>De La Guerra (DLG)</option>
              <option value="Carrillo" ${mD.diningHall === 'Carrillo' ? 'selected' : ''}>Carrillo</option>
              <option value="Portola" ${mD.diningHall === 'Portola' ? 'selected' : ''}>Portola</option>
              <option value="Ortega" ${mD.diningHall === 'Ortega' ? 'selected' : ''}>Ortega Take-Out</option>
            </select>
          </div>
          <div>
            <label class="block text-[8px] text-slate-400 uppercase font-bold mb-0.5">Portion Multiplier</label>
            <select onchange="updateMealField('${m.id}', 'portion', this.value)" ${isPrior || isFuture ? 'disabled' : ''} class="w-full bg-slate-950 border border-slate-800 rounded px-1.5 py-1 text-[10px] text-white font-bold">
              <option value="0.75" ${mD.portion === '0.75' ? 'selected' : ''}>Light (0.75x)</option>
              <option value="1.0" ${(mD.portion || '1.0') === '1.0' ? 'selected' : ''}>Standard (1.0x)</option>
              <option value="1.35" ${mD.portion === '1.35' ? 'selected' : ''}>Heaping (1.35x)</option>
              <option value="2.0" ${mD.portion === '2.0' ? 'selected' : ''}>Double Plate (2.0x)</option>
            </select>
          </div>
        </div>
      </div>
      
      <div id="preview_${m.id}" class="flex gap-1 overflow-x-auto custom-scroll"></div>

      <div class="flex items-center gap-1.5 pt-1">
        <button type="button" ${isPrior || isFuture ? 'disabled' : ''} onclick="triggerLocalEst('${m.id}')" class="flex-1 py-1.5 bg-slate-800 hover:bg-slate-700 text-[10px] font-bold text-slate-300 rounded-lg border border-slate-700 transition">⚡ Quick Est</button>
        <button type="button" id="btnCloud_${m.id}" ${isPrior || isFuture ? 'disabled' : ''} onclick="triggerCloudAiEst('${m.id}')" class="flex-[1.6] py-1.5 bg-gradient-to-r from-purple-900/40 via-indigo-900/40 to-blue-900/40 hover:from-purple-900/60 text-[10px] font-bold text-indigo-300 rounded-lg border border-indigo-500/40 transition flex items-center justify-center gap-1">
          <i data-lucide="sparkles" class="w-3 h-3 text-indigo-400"></i>
          <span>✨ Deconstruct & Audit</span>
        </button>
      </div>

      <div class="grid grid-cols-4 gap-1 pt-0.5">
        <div><input type="number" value="${mD.cal || ''}" ${isPrior || isFuture ? 'disabled' : ''} placeholder="Cal" onchange="updateMealField('${m.id}', 'cal', this.value)" class="w-full bg-slate-900 border border-slate-800 rounded px-1 py-0.5 text-[9px] text-white text-center font-bold" /></div>
        <div><input type="number" value="${mD.p || ''}" ${isPrior || isFuture ? 'disabled' : ''} placeholder="Pro" onchange="updateMealField('${m.id}', 'p', this.value)" class="w-full bg-slate-900 border border-slate-800 rounded px-1 py-0.5 text-[9px] text-amber-400 text-center font-bold" /></div>
        <div><input type="number" value="${mD.c || ''}" ${isPrior || isFuture ? 'disabled' : ''} placeholder="Carb" onchange="updateMealField('${m.id}', 'c', this.value)" class="w-full bg-slate-900 border border-slate-800 rounded px-1 py-0.5 text-[9px] text-cyan-400 text-center font-bold" /></div>
        <div><input type="number" value="${mD.f || ''}" ${isPrior || isFuture ? 'disabled' : ''} placeholder="Fat" onchange="updateMealField('${m.id}', 'f', this.value)" class="w-full bg-slate-900 border border-slate-800 rounded px-1 py-0.5 text-[9px] text-rose-400 text-center font-bold" /></div>
      </div>

      ${itemsHtml}
    `;
    mlC.appendChild(card);
    setTimeout(() => renderImagePreviews(m.id), 0);
  });
}

function handleImageSelection(event, mealId) {
  mealImages[mealId] = Array.from(event.target.files);
  renderImagePreviews(mealId);
}

function renderImagePreviews(mealId) {
  const container = document.getElementById(`preview_${mealId}`);
  if (!container) return;
  container.innerHTML = '';
  const files = mealImages[mealId] || [];
  files.forEach((file) => {
    const url = URL.createObjectURL(file);
    const img = document.createElement('img');
    img.src = url;
    img.className = "w-10 h-10 object-cover rounded-md border border-slate-700 shrink-0";
    container.appendChild(img);
  });
}

async function parseCloudAiMacros(queryText, diningHall, portionMultiplier, isUcsb, files) {
  const keys = userGoals.apiKeys || [];
  if (keys.length === 0) {
    alert("Please add at least one Gemini API Key in Settings (gear icon).");
    toggleSettingsModal();
    return null;
  }

  const prompt = `You are a clinical sports nutritionist and expert on University of California, Santa Barbara (UCSB) Campus Dining Hall operations.
Analyze this meal: "${queryText}".
Context:
- UCSB Dining Hall: ${isUcsb ? diningHall : 'Non-dining hall meal'}
- Portion Scale Factor: ${portionMultiplier}x
${isUcsb ? `
UCSB NetNutrition Guidelines:
- De La Guerra (DLG): Authentic Taqueria, late-night grill items, house beans, marinated fajitas, carne asada, carnitas, salad bar, Mongolian wok.
- Carrillo: Artisan pizza, pasta, rotisserie roast chicken, carved meats, salad bar.
- Portola: International cuisine, comfort homestyle entrees, grill station.
- Ortega: Grab-and-go specialty rice bowls, noodles, and wraps.
Account for standard dining hall flat-top cooking oils (+5-10g fat per meat/veggie portion) and cafeteria ladle serving sizes.
` : ''}

TASK:
1. Deconstruct the meal into its discrete items and estimated realistic gram/ounce yields.
2. Calculate individual calories, protein (P), carbs (C), and fat (F) for each item.
3. DOUBLE-CHECK & SELF-AUDIT STEP:
   - Verify that lean meats yield ~7g-8.5g protein per cooked oz (not raw).
   - Ensure (4 * total_P) + (4 * total_C) + (9 * total_F) equals total_calories within +/- 5%.
   - Ensure high precision on protein for athletic hypertrophy.

If photos are attached and the food is covered or too blurry to identify, set "needs_more_photos": true with a short "reason".

OUTPUT FORMAT: Strict valid JSON with NO markdown or code fences:
{
  "cal": number,
  "p": number,
  "c": number,
  "f": number,
  "items": [
    { "name": "Item Name", "portion": "e.g. 5 oz", "cal": number, "p": number, "c": number, "f": number }
  ],
  "audit_note": "Short 1-sentence note confirming how protein and cooking oils were verified",
  "needs_more_photos": boolean,
  "reason": string
}`;

  const parts = [{ text: prompt }];
  for (const file of files) {
    const base64Data = await new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result.split(',')[1]);
      reader.readAsDataURL(file);
    });
    parts.push({ inlineData: { mimeType: file.type, data: base64Data } });
  }

  let lastError = null;
  const startIndex = userGoals.activeKeyIndex % keys.length;

  for (let attempt = 0; attempt < keys.length; attempt++) {
    const keyIdx = (startIndex + attempt) % keys.length;
    const apiKey = keys[keyIdx].trim();

    try {
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent?key=${encodeURIComponent(apiKey)}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contents: [{ parts: parts }] })
      });

      if (res.status === 429 || res.status === 403 || res.status === 400) {
        const errJson = await res.json().catch(() => ({}));
        console.warn(`Key #${keyIdx + 1} (${apiKey.slice(0, 7)}...) hit error:`, errJson.error?.message || res.status);
        lastError = new Error(errJson.error?.message || `HTTP ${res.status}`);
        continue;
      }

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const data = await res.json();
      const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!rawText) throw new Error("Empty response from Gemini.");

      const cleanJson = rawText.replace(/```json|```/g, '').trim();
      const parsed = JSON.parse(cleanJson);

      userGoals.activeKeyIndex = keyIdx;
      localStorage.setItem('protocol_os_goals', JSON.stringify(userGoals));
      return parsed;

    } catch (err) {
      console.warn(`Attempt with key #${keyIdx + 1} failed:`, err.message);
      lastError = err;
    }
  }

  throw new Error(`All ${keys.length} API keys in your pool failed. Last error: ${lastError?.message || 'Quota exhausted'}`);
}

async function triggerCloudAiEst(mId) {
  if (isDateInFuture(currentDate) || isDateBeforeStart(currentDate)) return;
  const rec = getDayRecord(getDayKey(currentDate));
  const m = rec.meals[mId];
  const files = mealImages[mId] || [];

  if (!m.text && files.length === 0) {
    alert("Please type a meal description or take a photo first.");
    return;
  }

  const diningHall = m.diningHall || 'DLG';
  const portion = m.portion || '1.0';
  const isUcsb = m.isUcsb !== false;

  const btn = document.getElementById(`btnCloud_${mId}`);
  const orig = btn ? btn.innerHTML : '';
  if (btn) {
    btn.innerHTML = `<span class="animate-pulse">Auditing NetNutrition...</span>`;
    btn.disabled = true;
  }

  try {
    const est = await parseCloudAiMacros(m.text, diningHall, portion, isUcsb, files);
    if (est) {
      if (est.needs_more_photos) {
        alert(`AI Needs Another Angle / Clearer View:\n\n${est.reason}`);
      } else {
        m.cal = Math.round(Number(est.cal) || 0);
        m.p = Math.round(Number(est.p) || 0);
        m.c = Math.round(Number(est.c) || 0);
        m.f = Math.round(Number(est.f) || 0);
        m.items = est.items || [];
        m.auditNote = est.audit_note || '';

        mealImages[mId] = [];
        syncAutomations(rec);
        persist();
      }
    }
  } catch (err) {
    alert(`Deconstruction Error: ${err.message}`);
  } finally {
    if (btn) {
      btn.innerHTML = orig;
      btn.disabled = false;
      lucide.createIcons();
    }
  }
}

function parseLocalMacros(queryText) {
  const text = queryText.toLowerCase().trim();
  if (!text) return { cal: 0, p: 0, c: 0, f: 0 };
  let cal = 0, p = 0, c = 0, f = 0;
  const ozMatch = text.match(/(\d+(\.\d+)?)\s*oz\s*(chicken|breast|steak|beef|salmon|turkey|tuna|fish)/);
  if (ozMatch) {
    const oz = parseFloat(ozMatch[1]);
    const isC = text.includes('chicken') || text.includes('turkey');
    p += Math.round(oz * 7.5);
    f += Math.round(oz * (isC ? 1.5 : 4));
    cal += Math.round(oz * (isC ? 45 : 65));
  }
  const eggMatch = text.match(/(\d+)\s*(whole\s*)?eggs?/);
  if (eggMatch) { const ct = parseInt(eggMatch[1], 10); cal += ct * 72; p += ct * 6; f += ct * 5; c += ct * 0.5; }
  const scoopMatch = text.match(/(\d+)\s*scoops?/);
  if (scoopMatch) { const ct = parseInt(scoopMatch[1], 10); cal += ct * 125; p += ct * 25; c += ct * 3; f += ct * 1.5; }
  const toastMatch = text.match(/(\d+)\s*slices?\s*(bread|toast|sourdough)?/);
  if (toastMatch) { const ct = parseInt(toastMatch[1], 10); cal += ct * 80; c += ct * 15; p += ct * 3; f += ct * 1; }
  if (text.includes("greek yogurt")) { cal += 130; p += 18; c += 7; }
  if (text.includes("fairlife")) { cal += 150; p += 30; c += 6; f += 2.5; }
  if (text.includes("chipotle")) { const d = text.includes("double"); cal += d ? 950 : 750; p += d ? 55 : 38; c += 80; f += d ? 32 : 24; }
  if (cal === 0 && p === 0) { cal = 400; p = 25; c = 45; f = 14; }
  return { cal, p, c, f };
}

function triggerLocalEst(mId) {
  if (isDateInFuture(currentDate) || isDateBeforeStart(currentDate)) return;
  const rec = getDayRecord(getDayKey(currentDate));
  const m = rec.meals[mId];
  if (m.text) {
    const est = parseLocalMacros(m.text);
    m.cal = est.cal; m.p = est.p; m.c = est.c; m.f = est.f;
    m.items = [];
    m.auditNote = 'Local regex heuristic parsed.';
    syncAutomations(rec);
    persist();
  }
}

function updateMealField(mId, field, val) {
  if (isDateInFuture(currentDate) || isDateBeforeStart(currentDate)) return;
  const rec = getDayRecord(getDayKey(currentDate));
  rec.meals[mId][field] = (field === 'cal' || field === 'p' || field === 'c' || field === 'f') ? (parseInt(val, 10) || 0) : val;
  syncAutomations(rec);
  persist();
}

function computeDynamicCalories(rec) {
  let w = rec.weight;
  if (!w) {
    const datesWithW = Object.keys(appData).filter(k => appData[k].weight).sort();
    w = datesWithW.length ? appData[datesWithW[datesWithW.length - 1]].weight : 165;
  }
  const hIn = userGoals.height || 71;
  const age = userGoals.age || 19;
  const surplus = userGoals.surplus || 250;
  const wKg = w * 0.453592;
  const hCm = hIn * 2.54;

  const bmr = (10 * wKg) + (6.25 * hCm) - (5 * age) + 5;
  const neat = bmr * 0.20;

  let exercise = 0;
  if (rec.workout?.completed) exercise += 300;
  if (rec.actions?.['a_cardio']) exercise += 200;
  if (rec.climbing) exercise += 350;

  const total = Math.round(bmr + neat + exercise + surplus);
  return { bmr: Math.round(bmr), neat: Math.round(neat), exercise, surplus, total };
}

function applyDynamicCalorieGoal() {
  const rec = getDayRecord(getDayKey(currentDate));
  const calc = computeDynamicCalories(rec);
  userGoals.calories = calc.total;
  localStorage.setItem('protocol_os_goals', JSON.stringify(userGoals));
  persist();
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
