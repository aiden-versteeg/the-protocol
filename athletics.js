// =========================================================================
// PROTOCOL OS: ATHLETICS & LIFTOFF WORKOUT ENGINE (UCSB MAC GYM)
// =========================================================================

const MAC_EXERCISE_LIBRARY = [
  // CHEST
  { id: 'bb_bench', name: 'Barbell Flat Bench Press', category: 'Chest', tier: 'compound', primary: 'chest' },
  { id: 'db_incline_bench', name: 'Incline Dumbbell Press', category: 'Chest', tier: 'accessory', primary: 'chest' },
  { id: 'cable_crossover', name: 'Standing Cable Flye', category: 'Chest', tier: 'isolation', primary: 'chest' },
  { id: 'dips_weighted', name: 'Chest Dips (Parallel Bars)', category: 'Chest', tier: 'compound', primary: 'chest' },

  // BACK
  { id: 'bb_deadlift', name: 'Conventional Deadlift', category: 'Back', tier: 'compound', primary: 'back' },
  { id: 'bb_row', name: 'Barbell Bent-Over Row', category: 'Back', tier: 'compound', primary: 'back' },
  { id: 'lat_pulldown', name: 'Lat Pulldown (Neutral/Wide)', category: 'Back', tier: 'accessory', primary: 'back' },
  { id: 'cable_seated_row', name: 'Seated Cable Row', category: 'Back', tier: 'accessory', primary: 'back' },

  // SHOULDERS
  { id: 'ohp_barbell', name: 'Overhead Barbell Press', category: 'Shoulders', tier: 'compound', primary: 'shoulders' },
  { id: 'db_lateral_raise', name: 'Dumbbell Lateral Raise', category: 'Shoulders', tier: 'isolation', primary: 'shoulders' },
  { id: 'face_pulls', name: 'Rope Face Pull', category: 'Shoulders', tier: 'isolation', primary: 'shoulders' },

  // LEGS
  { id: 'bb_squat', name: 'Back Squat (Olympic/Low Bar)', category: 'Legs', tier: 'compound', primary: 'quads' },
  { id: 'rdl_barbell', name: 'Romanian Deadlift (RDL)', category: 'Legs', tier: 'compound', primary: 'hamstrings' },
  { id: 'leg_press_mac', name: 'MAC 45-Degree Leg Press', category: 'Legs', tier: 'accessory', primary: 'quads' },
  { id: 'leg_curl_seated', name: 'Seated Leg Curl', category: 'Legs', tier: 'isolation', primary: 'hamstrings' },

  // ARMS
  { id: 'ez_bar_curl', name: 'EZ-Bar Biceps Curl', category: 'Arms', tier: 'isolation', primary: 'biceps' },
  { id: 'triceps_rope_pushdown', name: 'Cable Triceps Rope Pushdown', category: 'Arms', tier: 'isolation', primary: 'triceps' },
  { id: 'incline_db_curl', name: 'Incline Dumbbell Curl', category: 'Arms', tier: 'isolation', primary: 'biceps' },

  // CORE & CLIMBING
  { id: 'hanging_leg_raise', name: 'Hanging Leg Raise', category: 'Core & Climbing', tier: 'isolation', primary: 'core' },
  { id: 'ab_wheel', name: 'Ab Wheel Rollout', category: 'Core & Climbing', tier: 'accessory', primary: 'core' },
  { id: 'pullups_weighted', name: 'Weighted Pull-Ups', category: 'Core & Climbing', tier: 'compound', primary: 'back' }
];

let activeSession = null;
let sessionRestTimer = null;
let currentExerciseCategory = 'all';

function renderAthleticsView() {
  const container = document.getElementById('view_athletics');

  container.innerHTML = `
    <!-- LIFTOFF ACTIVE SESSION LAUNCHER -->
    <div class="bg-gradient-to-br from-orange-950/40 via-slate-900 to-slate-900 border border-orange-500/30 rounded-2xl p-5 space-y-3">
      <div class="flex items-center justify-between">
        <div>
          <h2 class="text-sm font-black text-white flex items-center gap-2">
            <i data-lucide="zap" class="w-4 h-4 text-orange-400"></i>
            LIFTOFF WORKOUT ENGINE
          </h2>
          <p class="text-[10px] text-slate-400 mt-0.5">UCSB MAC Machine & Free-Weight Protocol</p>
        </div>
        <button onclick="startNewWorkoutSession()" class="px-3.5 py-2 bg-orange-600 hover:bg-orange-500 text-white font-black text-xs rounded-xl shadow-lg transition flex items-center gap-1.5">
          <i data-lucide="play" class="w-3.5 h-3.5"></i> Start Workout
        </button>
      </div>
    </div>

    <!-- ANATOMICAL MUSCLE HEATMAP -->
    <div class="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3">
      <div class="flex items-center justify-between border-b border-slate-800 pb-2">
        <h3 class="text-xs font-black tracking-wide text-white uppercase flex items-center gap-1.5">
          <i data-lucide="activity" class="w-4 h-4 text-emerald-400"></i>
          Anatomical Strain Heatmap (Last 72h)
        </h3>
      </div>
      <div class="py-2 flex justify-center">
        ${renderSvgMuscleHeatmap()}
      </div>
    </div>

    <!-- WORKOUT LOG HISTORY -->
    <div class="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3">
      <div class="flex items-center justify-between border-b border-slate-800 pb-2">
        <h3 class="text-xs font-black tracking-wide text-white uppercase flex items-center gap-1.5">
          <i data-lucide="history" class="w-4 h-4 text-slate-400"></i>
          Session History
        </h3>
        <span class="text-[10px] text-slate-500 font-bold">${workoutHistory.length} Sessions</span>
      </div>
      <div class="space-y-2">
        ${workoutHistory.slice(-5).reverse().map(w => `
          <div class="bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs space-y-1">
            <div class="flex items-center justify-between">
              <span class="font-bold text-white">${w.title || 'UCSB MAC Session'}</span>
              <span class="text-[10px] text-slate-400 font-mono">${w.date}</span>
            </div>
            <p class="text-[10px] text-slate-400">${(w.exercises || []).map(e => e.name).join(' • ')}</p>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

function renderSvgMuscleHeatmap() {
  const trainedMuscles = {};
  const now = Date.now();
  
  workoutHistory.forEach(w => {
    const sessionTime = new Date(w.date).getTime();
    if (now - sessionTime < 72 * 60 * 60 * 1000) {
      (w.exercises || []).forEach(ex => {
        const item = MAC_EXERCISE_LIBRARY.find(m => m.name === ex.name);
        if (item) trainedMuscles[item.primary] = true;
      });
    }
  });

  const getColor = (group) => trainedMuscles[group] ? '#f97316' : '#1e293b';

  return `
    <svg viewBox="0 0 200 240" class="w-44 h-auto">
      <!-- Head -->
      <circle cx="100" cy="25" r="14" fill="#334155" />
      <!-- Shoulders -->
      <path d="M 65 48 L 135 48 L 145 68 L 55 68 Z" fill="${getColor('shoulders')}" />
      <!-- Chest -->
      <rect x="70" y="68" width="60" height="30" rx="3" fill="${getColor('chest')}" />
      <!-- Core -->
      <rect x="75" y="100" width="50" height="35" rx="3" fill="${getColor('core')}" />
      <!-- Biceps / Arms -->
      <rect x="44" y="68" width="16" height="42" rx="4" fill="${getColor('biceps')}" />
      <rect x="140" y="68" width="16" height="42" rx="4" fill="${getColor('biceps')}" />
      <!-- Quads / Legs -->
      <rect x="72" y="140" width="24" height="60" rx="4" fill="${getColor('quads')}" />
      <rect x="104" y="140" width="24" height="60" rx="4" fill="${getColor('quads')}" />
    </svg>
  `;
}

function startNewWorkoutSession() {
  activeSession = {
    title: 'UCSB MAC Training',
    date: getTodayKey(),
    exercises: []
  };
  renderActiveWorkoutOverlay();
}

function renderActiveWorkoutOverlay() {
  const overlay = document.getElementById('fullScreenWorkoutOverlay');
  if (!activeSession) {
    overlay.classList.add('hidden');
    return;
  }

  overlay.classList.remove('hidden');
  overlay.innerHTML = `
    <div class="flex flex-col h-full max-w-xl mx-auto w-full p-4 justify-between">
      <div class="flex items-center justify-between pb-3 border-b border-slate-800">
        <div>
          <h2 class="text-sm font-black text-white flex items-center gap-2">
            <span class="w-2 h-2 rounded-full bg-orange-500 animate-ping"></span>
            ACTIVE SESSION
          </h2>
          <p class="text-[10px] text-slate-400 font-mono">${activeSession.date}</p>
        </div>
        <div class="flex items-center gap-2">
          <button onclick="openExerciseModal()" class="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-bold">
            + Exercise
          </button>
          <button onclick="finishWorkoutSession()" class="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-black shadow-lg">
            Finish
          </button>
        </div>
      </div>

      <!-- EXERCISE LIST -->
      <div class="flex-1 overflow-y-auto py-3 space-y-3 custom-scroll">
        ${activeSession.exercises.length === 0 ? `<p class="text-xs text-slate-500 text-center pt-8">No exercises logged yet. Tap "+ Exercise" to add from the MAC Library.</p>` : ''}
        ${activeSession.exercises.map((ex, exIdx) => `
          <div class="bg-slate-900 border border-slate-800 rounded-xl p-3 space-y-2">
            <div class="flex items-center justify-between">
              <span class="text-xs font-black text-white">${ex.name}</span>
              <button onclick="addSetToExercise(${exIdx})" class="text-[10px] font-bold text-orange-400 hover:text-orange-300">+ Add Set</button>
            </div>
            <div class="space-y-1">
              ${(ex.sets || []).map((s, sIdx) => `
                <div class="flex items-center gap-2 text-xs">
                  <span class="text-slate-500 font-mono w-4">${sIdx + 1}</span>
                  <input type="number" placeholder="lbs" value="${s.weight || ''}" onchange="updateSetData(${exIdx}, ${sIdx}, 'weight', this.value)" class="w-16 bg-slate-950 border border-slate-800 rounded px-2 py-1 text-center font-bold text-white text-xs" />
                  <input type="number" placeholder="reps" value="${s.reps || ''}" onchange="updateSetData(${exIdx}, ${sIdx}, 'reps', this.value)" class="w-16 bg-slate-950 border border-slate-800 rounded px-2 py-1 text-center font-bold text-white text-xs" />
                  <button onclick="completeSetWithAdaptiveRest('${ex.tier}')" class="flex-1 py-1 bg-emerald-950 border border-emerald-800 text-emerald-400 font-bold rounded text-[10px] text-center">
                    Log & Rest
                  </button>
                </div>
              `).join('')}
            </div>
          </div>
        `).join('')}
      </div>

      <!-- ADAPTIVE REST TIMER DOCK -->
      <div id="restTimerDock" class="bg-slate-900 border border-slate-800 rounded-xl p-3 flex items-center justify-between">
        <span class="text-xs text-slate-400 font-bold flex items-center gap-1.5">
          <i data-lucide="timer" class="w-4 h-4 text-orange-400"></i> Rest Interval
        </span>
        <span id="restTimerDisplay" class="text-sm font-mono font-black text-white">00:00</span>
      </div>
    </div>
  `;
  if (window.lucide) lucide.createIcons();
}

function completeSetWithAdaptiveRest(tier) {
  let restSecs = userGoals.defaultRestSecs || 90;
  if (userGoals.adaptiveRest) {
    if (tier === 'compound') restSecs = 180;
    else if (tier === 'accessory') restSecs = 120;
    else if (tier === 'isolation') restSecs = 75;
  }

  clearInterval(sessionRestTimer);
  let remaining = restSecs;
  const display = document.getElementById('restTimerDisplay');

  sessionRestTimer = setInterval(() => {
    remaining--;
    const m = String(Math.floor(remaining / 60)).padStart(2, '0');
    const s = String(remaining % 60).padStart(2, '0');
    if (display) display.innerText = `${m}:${s}`;
    if (remaining <= 0) {
      clearInterval(sessionRestTimer);
      if (display) display.innerText = "READY";
    }
  }, 1000);
}

function updateSetData(exIdx, sIdx, field, val) {
  if (activeSession && activeSession.exercises[exIdx]) {
    activeSession.exercises[exIdx].sets[sIdx][field] = Number(val);
  }
}

function addSetToExercise(exIdx) {
  if (activeSession && activeSession.exercises[exIdx]) {
    activeSession.exercises[exIdx].sets.push({ weight: 0, reps: 0 });
    renderActiveWorkoutOverlay();
  }
}

function finishWorkoutSession() {
  if (!activeSession) return;
  workoutHistory.push(activeSession);
  
  // Check off workout habit
  const day = getDayRecord(getTodayKey());
  day.habits['h_workout'] = true;

  activeSession = null;
  clearInterval(sessionRestTimer);
  renderActiveWorkoutOverlay();
  persist();
}

// Exercise Library Selection Modal
function openExerciseModal() {
  const modal = document.getElementById('exerciseModal');
  if (modal) {
    renderFilteredExerciseList('');
    modal.classList.remove('hidden');
  }
}

function closeExerciseModal() {
  const modal = document.getElementById('exerciseModal');
  if (modal) modal.classList.add('hidden');
}

function setExerciseCategory(cat) {
  currentExerciseCategory = cat;
  filterExerciseLibrary(document.getElementById('exerciseSearchInput').value || '');
}

function filterExerciseLibrary(term) {
  renderFilteredExerciseList(term.toLowerCase());
}

function renderFilteredExerciseList(query) {
  const list = document.getElementById('exerciseLibraryList');
  if (!list) return;

  const filtered = MAC_EXERCISE_LIBRARY.filter(item => {
    const matchesCat = currentExerciseCategory === 'all' || item.category === currentExerciseCategory;
    const matchesSearch = item.name.toLowerCase().includes(query) || item.category.toLowerCase().includes(query);
    return matchesCat && matchesSearch;
  });

  list.innerHTML = filtered.map(item => `
    <div onclick="selectExerciseForActiveSession('${item.id}')" class="p-2.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-orange-500/50 cursor-pointer flex items-center justify-between">
      <div>
        <span class="text-xs font-bold text-white block">${item.name}</span>
        <span class="text-[9px] text-slate-400 uppercase">${item.category} • ${item.tier}</span>
      </div>
      <i data-lucide="plus" class="w-4 h-4 text-orange-400"></i>
    </div>
  `).join('');
  if (window.lucide) lucide.createIcons();
}

function selectExerciseForActiveSession(id) {
  const item = MAC_EXERCISE_LIBRARY.find(m => m.id === id);
  if (item && activeSession) {
    activeSession.exercises.push({
      name: item.name,
      tier: item.tier,
      sets: [{ weight: 0, reps: 0 }]
    });
    closeExerciseModal();
    renderActiveWorkoutOverlay();
  }
}
