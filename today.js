// =========================================================================
// PROTOCOL OS: TODAY VIEW (COMMITMENTS, HABITS, NUTRITION, HYDRATION)
// =========================================================================

function renderTodayView() {
  const container = document.getElementById('view_today');
  const todayKey = getTodayKey();
  const day = getDayRecord(todayKey);

  // Auto-lock commitment calculation
  let isLocked = false;
  let remainingLockSecs = 0;
  if (day.commitmentLockedAt) {
    const elapsed = Math.floor((Date.now() - day.commitmentLockedAt) / 1000);
    if (elapsed > 60) {
      isLocked = true;
    } else {
      remainingLockSecs = 60 - elapsed;
    }
  }

  // Nutrition Totals
  const totals = (day.nutritionLogs || []).reduce((acc, item) => ({
    cal: acc.cal + (item.cal || 0),
    p: acc.p + (item.p || 0),
    c: acc.c + (item.c || 0),
    f: acc.f + (item.f || 0)
  }), { cal: 0, p: 0, c: 0, f: 0 });

  container.innerHTML = `
    <!-- MORNING COMMITMENT -->
    <div class="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-2.5">
      <div class="flex items-center justify-between">
        <h2 class="text-xs font-black tracking-wide text-white uppercase flex items-center gap-1.5">
          <i data-lucide="shield-alert" class="w-4 h-4 text-emerald-400"></i>
          Morning Non-Negotiable
        </h2>
        ${isLocked 
          ? `<span class="text-[9px] font-bold px-2 py-0.5 rounded-full bg-rose-950 text-rose-300 border border-rose-800 flex items-center gap-1"><i data-lucide="lock" class="w-3 h-3"></i> LOCKED</span>`
          : day.commitmentLockedAt 
            ? `<span class="text-[9px] font-bold text-amber-400">Locking in ${remainingLockSecs}s</span>`
            : `<span class="text-[9px] font-bold text-slate-500">Locks 60s after typing</span>`
        }
      </div>
      <textarea 
        id="commitmentInput" 
        rows="2" 
        ${isLocked ? 'disabled' : ''} 
        oninput="handleCommitmentInput(this.value)" 
        placeholder="Define your single non-negotiable objective for today..." 
        class="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white placeholder-slate-600 resize-none ${isLocked ? 'opacity-70 bg-slate-900/60' : ''}"
      >${day.commitment || ''}</textarea>
    </div>

    <!-- HABIT EXECUTION MATRIX -->
    <div class="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3">
      <div class="flex items-center justify-between border-b border-slate-800 pb-2">
        <h2 class="text-xs font-black tracking-wide text-white uppercase flex items-center gap-1.5">
          <i data-lucide="check-circle-2" class="w-4 h-4 text-emerald-400"></i>
          Daily Discipline Protocol
        </h2>
        <span class="text-[10px] text-slate-400 font-bold">${Object.values(day.habits || {}).filter(Boolean).length} / ${DEFAULT_HABITS.length}</span>
      </div>
      <div class="space-y-1.5">
        ${DEFAULT_HABITS.map(h => {
          const checked = !!(day.habits && day.habits[h.id]);
          return `
            <div onclick="toggleHabit('${h.id}')" class="flex items-center justify-between p-2.5 rounded-xl border cursor-pointer transition ${checked ? 'bg-emerald-950/20 border-emerald-500/40 text-white' : 'bg-slate-950 border-slate-800/80 text-slate-400 hover:border-slate-700'}">
              <span class="text-xs font-medium">${h.name}</span>
              <div class="w-4 h-4 rounded-md border flex items-center justify-center ${checked ? 'bg-emerald-500 border-emerald-500 text-slate-950' : 'border-slate-700 bg-slate-900'}">
                ${checked ? `<i data-lucide="check" class="w-3 h-3 stroke-[3]"></i>` : ''}
              </div>
            </div>
          `;
        }).join('')}
      </div>
    </div>

    <!-- WATER TRACKER (3 LITERS) -->
    <div class="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3">
      <div class="flex items-center justify-between">
        <h2 class="text-xs font-black tracking-wide text-white uppercase flex items-center gap-1.5">
          <i data-lucide="droplet" class="w-4 h-4 text-cyan-400"></i>
          Hydration Anchor (3 Liters)
        </h2>
        <span class="text-xs font-bold text-cyan-400">${(day.waterCount * 0.5).toFixed(1)} / 3.0 L</span>
      </div>
      <div class="grid grid-cols-6 gap-2">
        ${[1, 2, 3, 4, 5, 6].map(i => {
          const filled = i <= (day.waterCount || 0);
          return `
            <button onclick="setWaterLevel(${i})" class="h-10 rounded-xl border flex flex-col items-center justify-center transition ${filled ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300' : 'bg-slate-950 border-slate-800 text-slate-600'}">
              <i data-lucide="droplet" class="w-3.5 h-3.5 ${filled ? 'fill-cyan-400' : ''}"></i>
              <span class="text-[9px] font-bold mt-0.5">.5L</span>
            </button>
          `;
        }).join('')}
      </div>
    </div>

    <!-- NUTRITION & MULTIMODAL AUDIT -->
    <div class="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3">
      <div class="flex items-center justify-between border-b border-slate-800 pb-2">
        <h2 class="text-xs font-black tracking-wide text-white uppercase flex items-center gap-1.5">
          <i data-lucide="pie-chart" class="w-4 h-4 text-amber-400"></i>
          Nutritional Deconstruction
        </h2>
        <span class="text-[10px] font-bold text-slate-400">${totals.cal} / ${userGoals.calories} kcal</span>
      </div>

      <!-- MACRO BARS -->
      <div class="grid grid-cols-3 gap-2 text-center">
        <div class="bg-slate-950 border border-slate-800 rounded-xl p-2">
          <span class="text-[9px] text-amber-400 font-bold block uppercase">Protein</span>
          <span class="text-xs font-black text-white">${totals.p}g / ${userGoals.protein}g</span>
        </div>
        <div class="bg-slate-950 border border-slate-800 rounded-xl p-2">
          <span class="text-[9px] text-cyan-400 font-bold block uppercase">Carbs</span>
          <span class="text-xs font-black text-white">${totals.c}g / ${userGoals.carbs}g</span>
        </div>
        <div class="bg-slate-950 border border-slate-800 rounded-xl p-2">
          <span class="text-[9px] text-rose-400 font-bold block uppercase">Fats</span>
          <span class="text-xs font-black text-white">${totals.f}g / ${userGoals.fat}g</span>
        </div>
      </div>

      <!-- QUICK MEAL ADD -->
      <div class="flex gap-1.5">
        <input type="text" id="manualMealName" placeholder="Meal name (e.g. DLG Chicken Breast & Rice)" class="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-white placeholder-slate-600" />
        <button onclick="handleQuickMealAdd()" class="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-xl text-xs transition">
          + Add
        </button>
      </div>

      <!-- LOGGED MEALS LIST -->
      <div class="space-y-1.5">
        ${(day.nutritionLogs || []).map((m, idx) => `
          <div class="flex items-center justify-between bg-slate-950 border border-slate-800/80 rounded-xl px-3 py-2 text-xs">
            <div>
              <span class="font-bold text-white block">${m.name}</span>
              <span class="text-[10px] text-slate-400">${m.cal} kcal | P: ${m.p}g | C: ${m.c}g | F: ${m.f}g</span>
            </div>
            <button onclick="deleteMealItem(${idx})" class="text-slate-500 hover:text-rose-400">✕</button>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

function handleCommitmentInput(val) {
  const day = getDayRecord(getTodayKey());
  day.commitment = val;
  if (!day.commitmentLockedAt && val.trim().length > 0) {
    day.commitmentLockedAt = Date.now();
  }
  persist();
}

function toggleHabit(id) {
  const day = getDayRecord(getTodayKey());
  day.habits[id] = !day.habits[id];
  persist();
}

function setWaterLevel(lvl) {
  const day = getDayRecord(getTodayKey());
  day.waterCount = (day.waterCount === lvl) ? lvl - 1 : lvl;
  persist();
}

function handleQuickMealAdd() {
  const input = document.getElementById('manualMealName');
  const name = input.value.trim();
  if (!name) return;

  const day = getDayRecord(getTodayKey());
  day.nutritionLogs.push({
    name,
    cal: 550,
    p: 45,
    c: 60,
    f: 14,
    timestamp: new Date().toISOString()
  });
  input.value = '';
  persist();
}

function deleteMealItem(idx) {
  const day = getDayRecord(getTodayKey());
  day.nutritionLogs.splice(idx, 1);
  persist();
}
