// ==========================================
// STATE MANAGEMENT & DATA PERSISTENCE
// ==========================================
function getDayKey(date) {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

let START_DATE_KEY = localStorage.getItem('protocol_start_date');
if (!START_DATE_KEY) {
  START_DATE_KEY = getDayKey(new Date());
  localStorage.setItem('protocol_start_date', START_DATE_KEY);
}

const BOUNDARIES = [
  { id: "b_morning_phone", label: "Zero Phone First 60 Min", desc: "No notifications or screen dopamine upon waking" },
  { id: "b_sugar", label: "No Sugar", desc: "Zero added sugar or sweets" },
  { id: "b_porn", label: "No Porn", desc: "Absolute zero-tolerance boundary" },
  { id: "b_processed", label: "No Processed Outside Dining Hall", desc: "Whole clean fuel only" },
  { id: "b_alcohol", label: "No Alcohol", desc: "Zero alcohol consumption" },
  { id: "b_scrolling", label: "No Scrolling of Any Form", desc: "Zero feed browsing (IG, TikTok, X, Reels)" },
  { id: "b_youtube", label: "No YouTube", desc: "Zero distraction rabbit holes" },
  { id: "b_fakeprod", label: "No Fake Productivity", desc: "Real deep engineering/coursework only" },
  { id: "b_stupid_ai", label: "No Stupid AI Questions", desc: "Think deeply through problems first" },
  { id: "b_touch_face", label: "Keep Hands Off Face", desc: "Protect skin pores from oil transfer" }
];

const DAILY_ACTIONS = [
  { id: "a_creatine", label: "5g Creatine Monohydrate", desc: "Daily saturation & muscular power" },
  { id: "a_cardio", label: "Light Cardio Everyday", desc: "Zone 2 walk, run, swim, or cycle" },
  { id: "a_water", label: "3+ Liters Water + Electrolytes", desc: "Tracked automatically via bottles", isWaterLinked: true },
  { id: "a_protein", label: "Hit Protein Target (160g+)", desc: "Calculated from meal logs", isProteinLinked: true },
  { id: "a_sleep", label: "Circadian Schedule (Sleep 12–12:30 AM)", desc: "Maintain sleep/wake rhythm", weekdayOnly: true },
  { id: "a_shower", label: "Shower Post-Workout", desc: "Wash away sweat to prevent breakouts" }
];

const MEALS = [
  { id: "m_breakfast", label: "Breakfast" },
  { id: "m_lunch", label: "Lunch" },
  { id: "m_dinner", label: "Dinner" },
  { id: "m_snacks", label: "Post-Workout / Snacks" }
];

let currentDate = new Date();
let currentMainTab = 'today';
let appData = JSON.parse(localStorage.getItem('protocol_os_master') || '{}');
let workoutHistory = JSON.parse(localStorage.getItem('protocol_os_workout_history') || '{}');

// Custom user presets stored in localStorage
let customPresets = JSON.parse(localStorage.getItem('protocol_os_presets') || 'null');

let userGoals = JSON.parse(localStorage.getItem('protocol_os_goals') || '{}');
userGoals = Object.assign({
  calories: 2600,
  protein: 160,
  carbs: 300,
  fat: 70,
  height: 71,
  age: 19,
  surplus: 250,
  apiKeys: [],
  activeKeyIndex: 0,
  defaultRestSeconds: 90,
  adaptiveRestEnabled: true
}, userGoals);

if (userGoals.apiKey && (!userGoals.apiKeys || userGoals.apiKeys.length === 0)) {
  userGoals.apiKeys = [userGoals.apiKey.trim()];
}

function isDateBeforeStart(date) { return getDayKey(date) < START_DATE_KEY; }
function isDateInFuture(date) { 
  const today = new Date(); today.setHours(0,0,0,0);
  const target = new Date(date); target.setHours(0,0,0,0);
  return target > today;
}

function getDayRecord(dateKey) {
  if (!appData[dateKey]) {
    appData[dateKey] = {
      boundaries: {}, actions: {}, water: { b1000: 0, b710: 0 }, weight: null, pt: false, prehab: false, climbing: false, drone: { done: false, notes: '' },
      customTasks: [],
      meals: {
        m_breakfast: { text: '', cal: 0, p: 0, c: 0, f: 0, diningHall: 'DLG', portion: '1.0', isUcsb: true, items: [] },
        m_lunch: { text: '', cal: 0, p: 0, c: 0, f: 0, diningHall: 'DLG', portion: '1.0', isUcsb: true, items: [] },
        m_dinner: { text: '', cal: 0, p: 0, c: 0, f: 0, diningHall: 'DLG', portion: '1.0', isUcsb: true, items: [] },
        m_snacks: { text: '', cal: 0, p: 0, c: 0, f: 0, diningHall: 'DLG', portion: '1.0', isUcsb: false, items: [] }
      },
      workout: { 
        title: "Custom Session", 
        completed: false, 
        startTime: null, 
        durationSeconds: 0, 
        restEndTime: null, 
        exercises: [] 
      },
      academics: { courseNotes: [], brainstorms: [] }
    };
  }

  const rec = appData[dateKey];
  if (!rec.customTasks) rec.customTasks = [];
  if (!rec.academics) rec.academics = { courseNotes: [], brainstorms: [] };
  if (!rec.academics.courseNotes) rec.academics.courseNotes = [];
  if (!rec.academics.brainstorms) rec.academics.brainstorms = [];
  if (!rec.workout) rec.workout = { title: "Custom Session", completed: false, startTime: null, durationSeconds: 0, restEndTime: null, exercises: [] };
  if (!rec.workout.exercises) rec.workout.exercises = [];
  if (!rec.drone) rec.drone = { done: false, notes: '' };
  if (!rec.water) rec.water = { b1000: 0, b710: 0 };
  if (!rec.meals) rec.meals = {};

  return rec;
}

function persist() {
  localStorage.setItem('protocol_os_master', JSON.stringify(appData));
  localStorage.setItem('protocol_os_workout_history', JSON.stringify(workoutHistory));
  if (customPresets) localStorage.setItem('protocol_os_presets', JSON.stringify(customPresets));
  render();
}

function shiftDate(days) {
  currentDate.setDate(currentDate.getDate() + days);
  render();
}

// ====== ROUTING & NAVIGATION ======
function toggleNavDropdown() {
  const menu = document.getElementById('navDropdownMenu');
  if (menu) menu.classList.toggle('hidden');
}

function selectDropdownTab(tab, label) {
  document.getElementById('navDropdownMenu')?.classList.add('hidden');
  const labelEl = document.getElementById('activeDropdownLabel');
  if (labelEl) labelEl.innerText = label;
  switchMainTab(tab);
}

function switchMainTab(tab) {
  currentMainTab = tab;
  ['today', 'matrix', 'athletics', 'nutrition', 'academics'].forEach(t => {
    const el = document.getElementById(`view_${t}`);
    if (el) el.classList.toggle('hidden', t !== tab);
  });

  const btnToday = document.getElementById('navBtn_today');
  const btnMatrix = document.getElementById('navBtn_matrix');
  const ddTrigger = document.getElementById('dropdownNavTrigger');

  if (tab === 'today') {
    if (btnToday) btnToday.className = "py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30";
    if (btnMatrix) btnMatrix.className = "py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 text-slate-400 hover:text-slate-200";
    if (ddTrigger) ddTrigger.className = "h-full px-3 py-2.5 rounded-xl text-xs font-bold bg-slate-950/80 border border-slate-800 text-slate-300 hover:border-slate-700 flex items-center gap-1.5 transition";
  } else if (tab === 'matrix') {
    if (btnMatrix) btnMatrix.className = "py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 bg-cyan-500/20 text-cyan-400 border border-cyan-500/30";
    if (btnToday) btnToday.className = "py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 text-slate-400 hover:text-slate-200";
    if (ddTrigger) ddTrigger.className = "h-full px-3 py-2.5 rounded-xl text-xs font-bold bg-slate-950/80 border border-slate-800 text-slate-300 hover:border-slate-700 flex items-center gap-1.5 transition";
  } else {
    if (btnToday) btnToday.className = "py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 text-slate-400 hover:text-slate-200";
    if (btnMatrix) btnMatrix.className = "py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 text-slate-400 hover:text-slate-200";
    if (ddTrigger) ddTrigger.className = "h-full px-3 py-2.5 rounded-xl text-xs font-bold bg-orange-950/30 border border-orange-500/40 text-orange-300 flex items-center gap-1.5 transition";
  }

  render();
}

function getWaterVolume(water) { 
  return ((water?.b1000 || 0) * 1000) + ((water?.b710 || 0) * 710); 
}

function syncAutomations(rec) {
  rec.actions['a_water'] = getWaterVolume(rec.water) >= 3000;
  rec.actions['a_protein'] = Object.values(rec.meals).reduce((s, m) => s + (Number(m.p) || 0), 0) >= (userGoals.protein || 160);
}

function evaluateDayStatus(rec, date) {
  if (isDateBeforeStart(date)) return "unactivated";
  if (isDateInFuture(date)) return "locked";
  if (Object.values(rec.boundaries || {}).some(v => v === true)) return "breached";

  const isWeekend = (date.getDay() === 0 || date.getDay() === 6);
  const dailyActionsDone = DAILY_ACTIONS.every(a => (a.weekdayOnly && isWeekend) || rec.actions[a.id]);
  const morningTasksDone = !rec.customTasks || rec.customTasks.every(t => t.done);

  return (dailyActionsDone && morningTasksDone) ? "complete" : "pending";
}

function getWeekDateKeys(d) {
  const current = new Date(d);
  const diff = current.getDate() - current.getDay() + (current.getDay() === 0 ? -6 : 1);
  const monday = new Date(current.setDate(diff));
  const keys = [];
  for (let i = 0; i < 7; i++) {
    const nextDay = new Date(monday);
    nextDay.setDate(monday.getDate() + i);
    keys.push(getDayKey(nextDay));
  }
  return keys;
}

function getWeeklyStat(metricKey, date) {
  return getWeekDateKeys(date).reduce((acc, k) => {
    const rec = appData[k];
    if (!rec) return acc;
    if (metricKey === 'drone') return acc + (rec.drone?.done ? 1 : 0);
    if (metricKey === 'pt') return acc + (rec.pt ? 1 : 0);
    if (metricKey === 'prehab') return acc + (rec.prehab ? 1 : 0);
    return acc;
  }, 0);
}

// API Key Management
function addApiKeyToPool() {
  const input = document.getElementById('newKeyPoolInput');
  const val = input.value.trim();
  if (!val) return;
  if (!userGoals.apiKeys) userGoals.apiKeys = [];
  if (!userGoals.apiKeys.includes(val)) {
    userGoals.apiKeys.push(val);
    localStorage.setItem('protocol_os_goals', JSON.stringify(userGoals));
    input.value = '';
    renderKeyPoolList();
  }
}

function removeApiKeyFromPool(index) {
  if (!userGoals.apiKeys) return;
  userGoals.apiKeys.splice(index, 1);
  if (userGoals.activeKeyIndex >= userGoals.apiKeys.length) {
    userGoals.activeKeyIndex = 0;
  }
  localStorage.setItem('protocol_os_goals', JSON.stringify(userGoals));
  renderKeyPoolList();
}

function renderKeyPoolList() {
  const list = document.getElementById('apiKeysPoolList');
  const badge = document.getElementById('keyPoolCountBadge');
  if (!list) return;
  const keys = userGoals.apiKeys || [];
  badge.innerText = `${keys.length} Key${keys.length === 1 ? '' : 's'}`;
  list.innerHTML = '';

  if (keys.length === 0) {
    list.innerHTML = `<div class="text-[10px] text-slate-500 italic py-1">No API keys in pool. Add at least one to enable Cloud AI parsing.</div>`;
    return;
  }

  keys.forEach((k, idx) => {
    const isCurrent = idx === (userGoals.activeKeyIndex % keys.length);
    const masked = k.slice(0, 7) + '...' + k.slice(-4);
    const div = document.createElement('div');
    div.className = `flex items-center justify-between p-2 rounded-lg border text-[11px] ${
      isCurrent ? 'bg-purple-950/40 border-purple-500/50 text-purple-200' : 'bg-slate-900 border-slate-800 text-slate-400'
    }`;
    div.innerHTML = `
      <div class="flex items-center gap-2">
        <span class="w-2 h-2 rounded-full ${isCurrent ? 'bg-emerald-400' : 'bg-slate-600'}"></span>
        <span class="font-mono">${masked}</span>
        ${isCurrent ? '<span class="text-[8px] px-1 py-0.2 rounded bg-purple-900 text-purple-300 font-bold uppercase">Active</span>' : ''}
      </div>
      <button onclick="removeApiKeyFromPool(${idx})" class="text-slate-500 hover:text-rose-400 p-0.5">
        <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
      </button>
    `;
    list.appendChild(div);
  });
  lucide.createIcons();
}

// Router
function render() {
  const key = getDayKey(currentDate);
  const rec = getDayRecord(key);
  syncAutomations(rec);
  const startNotice = document.getElementById('protocolStartNotice');
  if (startNotice) startNotice.innerText = `Protocol Active: ${START_DATE_KEY}`;

  if (currentMainTab === 'today' && typeof renderTodayTab === 'function') renderTodayTab(rec);
  if (currentMainTab === 'matrix' && typeof renderMatrixCalendar === 'function') renderMatrixCalendar();
  if (currentMainTab === 'athletics' && typeof renderAthleticsTab === 'function') renderAthleticsTab(rec);
  if (currentMainTab === 'nutrition' && typeof renderNutritionTab === 'function') renderNutritionTab(rec);
  if (currentMainTab === 'academics' && typeof renderAcademicsTab === 'function') renderAcademicsTab(rec);

  lucide.createIcons();
}

function toggleSettingsModal() {
  const m = document.getElementById('settingsModal');
  m.classList.toggle('hidden');
  if (!m.classList.contains('hidden')) {
    document.getElementById('settingStartDate').value = START_DATE_KEY;
    document.getElementById('settingHeight').value = userGoals.height || 71;
    document.getElementById('settingAge').value = userGoals.age || 19;
    document.getElementById('settingGoalCal').value = userGoals.calories;
    document.getElementById('settingGoalProt').value = userGoals.protein;
    document.getElementById('settingGoalCarb').value = userGoals.carbs;
    document.getElementById('settingGoalFat').value = userGoals.fat;
    document.getElementById('settingDefaultRest').value = userGoals.defaultRestSeconds || 90;
    document.getElementById('settingAdaptiveRest').checked = userGoals.adaptiveRestEnabled !== false;
    renderKeyPoolList();
  }
}

function saveSettings() {
  const newStart = document.getElementById('settingStartDate').value;
  if (newStart) {
    START_DATE_KEY = newStart;
    localStorage.setItem('protocol_start_date', START_DATE_KEY);
  }
  userGoals.height = parseInt(document.getElementById('settingHeight').value, 10) || 71;
  userGoals.age = parseInt(document.getElementById('settingAge').value, 10) || 19;
  userGoals.calories = parseInt(document.getElementById('settingGoalCal').value, 10) || 2600;
  userGoals.protein = parseInt(document.getElementById('settingGoalProt').value, 10) || 160;
  userGoals.carbs = parseInt(document.getElementById('settingGoalCarb').value, 10) || 300;
  userGoals.fat = parseInt(document.getElementById('settingGoalFat').value, 10) || 70;
  userGoals.defaultRestSeconds = parseInt(document.getElementById('settingDefaultRest').value, 10) || 90;
  userGoals.adaptiveRestEnabled = document.getElementById('settingAdaptiveRest').checked;

  localStorage.setItem('protocol_os_goals', JSON.stringify(userGoals));
  toggleSettingsModal();
  render();
}

function exportData() {
  const payload = {
    startDate: START_DATE_KEY,
    goals: userGoals,
    data: appData,
    workoutHistory: workoutHistory,
    customPresets: customPresets
  };
  const a = document.createElement('a');
  a.setAttribute("href", "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(payload, null, 2)));
  a.setAttribute("download", `protocol_os_backup_${getDayKey(new Date())}.json`);
  document.body.appendChild(a);
  a.click();
  a.remove();
}

function importData(e) {
  if (!e.target.files[0]) return;
  const r = new FileReader();
  r.onload = function(evt) {
    try {
      const i = JSON.parse(evt.target.result);
      if (i.data) {
        appData = i.data;
        if (i.goals) userGoals = i.goals;
        if (i.workoutHistory) workoutHistory = i.workoutHistory;
        if (i.customPresets) customPresets = i.customPresets;
        if (i.startDate) {
          START_DATE_KEY = i.startDate;
          localStorage.setItem('protocol_start_date', START_DATE_KEY);
        }
      } else {
        appData = i;
      }
      persist();
      alert('Data restored successfully!');
    } catch (err) { alert('Invalid backup JSON file.'); }
  };
  r.readAsText(e.target.files[0]);
}
