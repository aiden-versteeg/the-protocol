// =========================================================================
// PROTOCOL OS: CORE STATE & LOCAL PERSISTENCE ENGINE
// =========================================================================

let START_DATE_KEY = localStorage.getItem('protocol_start_date') || new Date().toISOString().split('T')[0];

const DEFAULT_HABITS = [
  { id: 'h_wake', name: 'Wake by 06:30' },
  { id: 'h_workout', name: 'Athletic Training / Session Complete' },
  { id: 'h_macros', name: 'Hit Macro Targets (Protein & Calorie Anchor)' },
  { id: 'h_water', name: 'Complete 3L Water Target' },
  { id: 'h_deepwork', name: '90m Pure Deep Work (ECE / Labs)' },
  { id: 'h_reading', name: '20m Reading or Technical Writing' },
  { id: 'h_screens', name: 'No Screens 60m Prior to Sleep' }
];

let userGoals = JSON.parse(localStorage.getItem('protocol_os_goals') || 'null') || {
  heightInches: 71,
  age: 20,
  calories: 2800,
  protein: 180,
  carbs: 320,
  fat: 75,
  defaultRestSecs: 90,
  adaptiveRest: true
};

let appData = JSON.parse(localStorage.getItem('protocol_os_master') || '{}');
let workoutHistory = JSON.parse(localStorage.getItem('protocol_os_workout_history') || '[]');
let customPresets = JSON.parse(localStorage.getItem('protocol_os_presets') || 'null') || [];
let apiKeyPool = JSON.parse(localStorage.getItem('protocol_gemini_pool') || '[]');
let activeKeyPoolIndex = 0;

let currentTab = 'today';

function getTodayKey() {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function getDayRecord(dateKey) {
  if (!appData[dateKey]) {
    appData[dateKey] = {
      habits: {},
      commitment: '',
      commitmentLockedAt: null,
      waterCount: 0,
      nutritionLogs: [],
      studyLogs: [],
      avoidance: { sugar: false, distraction: false, slouch: false }
    };
  }
  return appData[dateKey];
}

function persist() {
  localStorage.setItem('protocol_os_master', JSON.stringify(appData));
  localStorage.setItem('protocol_os_workout_history', JSON.stringify(workoutHistory));
  localStorage.setItem('protocol_os_goals', JSON.stringify(userGoals));
  localStorage.setItem('protocol_start_date', START_DATE_KEY);
  if (customPresets) localStorage.setItem('protocol_os_presets', JSON.stringify(customPresets));
  
  if (typeof queueEncryptedSync === 'function') {
    queueEncryptedSync();
  }
  render();
}

function switchMainTab(tabName) {
  currentTab = tabName;
  ['today', 'matrix', 'athletics', 'academics'].forEach(t => {
    const btn = document.getElementById(`navBtn_${t}`);
    const view = document.getElementById(`view_${t}`);
    if (t === tabName) {
      btn.className = "py-2 rounded-xl text-xs font-bold transition flex flex-col items-center gap-0.5 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30";
      view.classList.remove('hidden');
    } else {
      btn.className = "py-2 rounded-xl text-xs font-bold transition flex flex-col items-center gap-0.5 text-slate-400 hover:text-slate-200";
      view.classList.add('hidden');
    }
  });
  render();
}

function render() {
  const notice = document.getElementById('protocolStartNotice');
  if (notice) notice.innerText = `Protocol Day: ${calculateProtocolDay()}`;

  if (currentTab === 'today' && typeof renderTodayView === 'function') renderTodayView();
  if (currentTab === 'matrix' && typeof renderMatrixView === 'function') renderMatrixView();
  if (currentTab === 'athletics' && typeof renderAthleticsView === 'function') renderAthleticsView();
  if (currentTab === 'academics' && typeof renderAcademicsView === 'function') renderAcademicsView();
  
  if (window.lucide) lucide.createIcons();
}

function calculateProtocolDay() {
  const start = new Date(START_DATE_KEY);
  const now = new Date(getTodayKey());
  const diffTime = Math.abs(now - start);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  return isNaN(diffDays) ? 1 : diffDays;
}

// Gemini Key Pool Rotation
function getNextGeminiKey() {
  if (!apiKeyPool || apiKeyPool.length === 0) return null;
  activeKeyPoolIndex = (activeKeyPoolIndex + 1) % apiKeyPool.length;
  return apiKeyPool[activeKeyPoolIndex];
}

function addApiKeyToPool() {
  const input = document.getElementById('newKeyPoolInput');
  const val = input.value.trim();
  if (!val) return;
  if (!apiKeyPool.includes(val)) {
    apiKeyPool.push(val);
    localStorage.setItem('protocol_gemini_pool', JSON.stringify(apiKeyPool));
    input.value = '';
    renderSettingsKeyPool();
  }
}

function removeApiKeyFromPool(idx) {
  apiKeyPool.splice(idx, 1);
  localStorage.setItem('protocol_gemini_pool', JSON.stringify(apiKeyPool));
  renderSettingsKeyPool();
}

function renderSettingsKeyPool() {
  const list = document.getElementById('apiKeysPoolList');
  const badge = document.getElementById('keyPoolCountBadge');
  if (badge) badge.innerText = `${apiKeyPool.length} Keys`;
  if (!list) return;
  list.innerHTML = apiKeyPool.map((k, i) => `
    <div class="flex items-center justify-between bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1 text-[10px]">
      <span class="text-slate-400 font-mono">${k.substring(0, 8)}••••••••${k.slice(-4)}</span>
      <button onclick="removeApiKeyFromPool(${i})" class="text-rose-400 hover:text-rose-300">✕</button>
    </div>
  `).join('');
}

// Settings Modal
function toggleSettingsModal() {
  const modal = document.getElementById('settingsModal');
  if (!modal) return;
  if (modal.classList.contains('hidden')) {
    document.getElementById('settingStartDate').value = START_DATE_KEY;
    document.getElementById('settingHeight').value = userGoals.heightInches;
    document.getElementById('settingAge').value = userGoals.age;
    document.getElementById('settingGoalCal').value = userGoals.calories;
    document.getElementById('settingGoalProt').value = userGoals.protein;
    document.getElementById('settingGoalCarb').value = userGoals.carbs;
    document.getElementById('settingGoalFat').value = userGoals.fat;
    document.getElementById('settingDefaultRest').value = userGoals.defaultRestSecs || 90;
    document.getElementById('settingAdaptiveRest').checked = userGoals.adaptiveRest !== false;
    renderSettingsKeyPool();
    modal.classList.remove('hidden');
  } else {
    modal.classList.add('hidden');
  }
}

function saveSettings() {
  START_DATE_KEY = document.getElementById('settingStartDate').value || START_DATE_KEY;
  userGoals.heightInches = Number(document.getElementById('settingHeight').value) || 71;
  userGoals.age = Number(document.getElementById('settingAge').value) || 20;
  userGoals.calories = Number(document.getElementById('settingGoalCal').value) || 2800;
  userGoals.protein = Number(document.getElementById('settingGoalProt').value) || 180;
  userGoals.carbs = Number(document.getElementById('settingGoalCarb').value) || 320;
  userGoals.fat = Number(document.getElementById('settingGoalFat').value) || 75;
  userGoals.defaultRestSecs = Number(document.getElementById('settingDefaultRest').value) || 90;
  userGoals.adaptiveRest = document.getElementById('settingAdaptiveRest').checked;
  toggleSettingsModal();
  persist();
}

// Local JSON Backup / Restore
function exportData() {
  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify({
    startDate: START_DATE_KEY,
    userGoals,
    appData,
    workoutHistory,
    customPresets
  }, null, 2));
  const el = document.createElement('a');
  el.setAttribute("href", dataStr);
  el.setAttribute("download", `protocol_backup_${getTodayKey()}.json`);
  document.body.appendChild(el);
  el.click();
  el.remove();
}

function importData(event) {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const parsed = JSON.parse(e.target.result);
      if (parsed.appData) appData = parsed.appData;
      if (parsed.userGoals) userGoals = parsed.userGoals;
      if (parsed.workoutHistory) workoutHistory = parsed.workoutHistory;
      if (parsed.customPresets) customPresets = parsed.customPresets;
      if (parsed.startDate) START_DATE_KEY = parsed.startDate;
      persist();
      alert("Protocol database restored successfully!");
    } catch (err) {
      alert("Invalid backup file: " + err.message);
    }
  };
  reader.readAsText(file);
}

function initApp() {
  render();
}
