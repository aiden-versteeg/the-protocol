// ==========================================
// NUTRITION OS & DINING DECONSTRUCTION TAB
// ==========================================
function renderNutritionTab(rec) {
  const container = document.getElementById('view_nutrition');
  if (!container) return;

  const dynCal = computeDynamicCalories(rec);
  let totalCal = 0, totalP = 0, totalC = 0, totalF = 0;

  MEALS.forEach(m => {
    const d = rec.meals[m.id] || {};
    totalCal += Number(d.cal) || 0;
    totalP += Number(d.p) || 0;
    totalC += Number(d.c) || 0;
    totalF += Number(d.f) || 0;
  });

  const targetCal = userGoals.calories || 2600;
  const targetP = userGoals.protein || 160;
  const calPct = Math.min(100, Math.round((totalCal / targetCal) * 100));
  const pPct = Math.min(100, Math.round((totalP / targetP) * 100));

  container.innerHTML = `
  <!-- MACRO PROGRESS OVERVIEW -->
  <div class="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 shadow-xl space-y-3.5">
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-2">
        <div class="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
          <i data-lucide="pie-chart" class="w-4 h-4"></i>
        </div>
        <div>
          <h2 class="text-sm font-bold text-white">Daily Macro Compliance</h2>
          <div class="text-[10px] text-slate-400">Target: ${targetCal} kcal | ${targetP}g Protein</div>
        </div>
      </div>
      <button onclick="applyDynamicCalorieGoal()" class="text-[9px] font-bold px-2.5 py-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 rounded-lg transition">
        Sync Dynamic TDEE
      </button>
    </div>

    <!-- Progress Bars -->
    <div class="space-y-2 pt-1">
      <div>
        <div class="flex justify-between text-[10px] font-bold mb-1">
          <span class="text-slate-300">Calories (${totalCal} / ${targetCal} kcal)</span>
          <span class="text-slate-400 font-mono">${calPct}%</span>
        </div>
        <div class="w-full h-2 bg-slate-950 rounded-full overflow-hidden">
          <div class="h-full bg-gradient-to-r from-amber-500 to-orange-500 transition-all duration-300" style="width: ${calPct}%"></div>
        </div>
      </div>

      <div>
        <div class="flex justify-between text-[10px] font-bold mb-1">
          <span class="text-amber-300">Protein (${totalP}g / ${targetP}g)</span>
          <span class="text-amber-400 font-mono">${pPct}%</span>
        </div>
        <div class="w-full h-2 bg-slate-950 rounded-full overflow-hidden">
          <div class="h-full bg-gradient-to-r from-amber-400 to-emerald-400 transition-all duration-300" style="width: ${pPct}%"></div>
        </div>
      </div>
    </div>

    <!-- Dynamic Calorie Details -->
    <div class="grid grid-cols-4 gap-1.5 pt-2 text-center text-[9px] font-mono bg-slate-950/60 p-2 rounded-xl border border-slate-800">
      <div><span class="text-slate-500 block">BMR</span><span class="text-slate-200 font-bold">${dynCal.bmr}</span></div>
      <div><span class="text-slate-500 block">NEAT</span><span class="text-slate-200 font-bold">+${dynCal.neat}</span></div>
      <div><span class="text-slate-500 block">EXERCISE</span><span class="text-emerald-400 font-bold">+${dynCal.exercise}</span></div>
      <div><span class="text-slate-500 block">SURPLUS</span><span class="text-amber-400 font-bold">+${dynCal.surplus}</span></div>
    </div>
  </div>

  <!-- MEAL LOGGING & UCSB DINING DECONSTRUCTION CONTAINER -->
  <div class="space-y-3" id="mealsContainer"></div>
  `;

  const isPrior = isDateBeforeStart(currentDate);
  const isFuture = isDateInFuture(currentDate);
  renderMealsList(rec, isPrior, isFuture);
  lucide.createIcons();
}
