// ==========================================
// ACADEMICS TAB (DRONE, STUDY, BRAINSTORM)
// ==========================================

function renderAcademicsTab(rec) {
  const container = document.getElementById('view_academics');
  if (!container) return;

  // Defensive auto-initialization
  if (!rec.academics) rec.academics = { courseNotes: [], brainstorms: [] };
  if (!rec.academics.courseNotes) rec.academics.courseNotes = [];
  if (!rec.academics.brainstorms) rec.academics.brainstorms = [];
  if (!rec.drone) rec.drone = { done: false, notes: '' };

  const isPrior = isDateBeforeStart(currentDate);
  const isFuture = isDateInFuture(currentDate);
  const weeklyDroneCount = getWeeklyStat('drone', currentDate);

  container.innerHTML = `
    <!-- DRONE BUILD SPRINT -->
    <div class="bg-gradient-to-br from-indigo-950/40 via-slate-900/90 to-purple-950/30 border border-indigo-500/30 rounded-2xl p-4 shadow-xl">
      <div class="flex items-start justify-between gap-3">
        <div class="flex items-center gap-2.5">
          <div class="w-8 h-8 rounded-xl bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
            <i data-lucide="cpu" class="w-4 h-4"></i>
          </div>
          <div>
            <div class="flex items-center gap-2">
              <h2 class="text-sm font-bold text-indigo-200">Drone Build Sprint</h2>
              <span class="text-[9px] px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-semibold">1 Hr • 5x/wk</span>
            </div>
            <p class="text-[10px] text-slate-400 mt-0.5">This Week: ${weeklyDroneCount} / 5 sessions logged</p>
          </div>
        </div>
        <button onclick="toggleDroneSprint()" ${isPrior || isFuture ? 'disabled' : ''} class="px-2.5 py-1.5 rounded-xl text-xs font-bold border transition-all flex items-center gap-1 ${
          rec.drone.done ? 'bg-indigo-600 text-white border-indigo-400 shadow-md shadow-indigo-600/30' : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:border-slate-600'
        }">
          <i data-lucide="clock" class="w-3 h-3"></i><span>${rec.drone.done ? '1 Hr Done ✓' : 'Log 1 Hr'}</span>
        </button>
      </div>

      <div class="mt-3.5 flex items-center gap-1.5">
        <div class="h-1.5 flex-1 rounded-full ${weeklyDroneCount >= 1 ? 'bg-indigo-500' : 'bg-slate-800'}"></div>
        <div class="h-1.5 flex-1 rounded-full ${weeklyDroneCount >= 2 ? 'bg-indigo-500' : 'bg-slate-800'}"></div>
        <div class="h-1.5 flex-1 rounded-full ${weeklyDroneCount >= 3 ? 'bg-indigo-500' : 'bg-slate-800'}"></div>
        <div class="h-1.5 flex-1 rounded-full ${weeklyDroneCount >= 4 ? 'bg-indigo-500' : 'bg-slate-800'}"></div>
        <div class="h-1.5 flex-1 rounded-full ${weeklyDroneCount >= 5 ? 'bg-indigo-500' : 'bg-slate-800'}"></div>
      </div>
    </div>

    <!-- COURSEWORK & STUDY NOTES -->
    <div class="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 shadow-lg space-y-3">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-2">
          <div class="w-7 h-7 rounded-lg bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
            <i data-lucide="book-open" class="w-3.5 h-3.5"></i>
          </div>
          <div>
            <h2 class="text-sm font-bold text-white">Deep Study Log</h2>
            <div class="text-[10px] text-slate-400">Course problem sets & derivations</div>
          </div>
        </div>
        <button onclick="addCourseNote()" ${isPrior || isFuture ? 'disabled' : ''} class="px-2 py-1 bg-blue-600/30 hover:bg-blue-600/40 border border-blue-500/30 text-blue-300 rounded-md text-[10px] font-bold flex items-center gap-1 transition">
          <i data-lucide="plus" class="w-3 h-3"></i> Note
        </button>
      </div>
      <div id="courseNotesList" class="space-y-2"></div>
    </div>

    <!-- HARDWARE & FLIGHT BRAINSTORM BOARD -->
    <div class="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 shadow-lg space-y-3">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-2">
          <div class="w-7 h-7 rounded-lg bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-400">
            <i data-lucide="lightbulb" class="w-3.5 h-3.5"></i>
          </div>
          <div>
            <h2 class="text-sm font-bold text-white">Hardware & Flight Brainstorm</h2>
            <div class="text-[10px] text-slate-400">CAD tolerances, motor tests, firmware notes</div>
          </div>
        </div>
        <button onclick="addBrainstormCard()" ${isPrior || isFuture ? 'disabled' : ''} class="px-2 py-1 bg-purple-600/30 hover:bg-purple-600/40 border border-purple-500/30 text-purple-300 rounded-md text-[10px] font-bold flex items-center gap-1 transition">
          <i data-lucide="plus" class="w-3 h-3"></i> Idea
        </button>
      </div>
      <div id="brainstormCardsList" class="space-y-2"></div>
    </div>
  `;

  renderCourseNotes(rec);
  renderBrainstorms(rec);
  lucide.createIcons();
}

function renderCourseNotes(rec) {
  const cC = document.getElementById('courseNotesList');
  if (!cC) return;
  cC.innerHTML = '';
  const notes = rec.academics.courseNotes || [];
  if (notes.length === 0) {
    cC.innerHTML = `<div class="text-center py-4 text-[10px] text-slate-600 font-semibold border border-dashed border-slate-800 rounded-xl">No study notes logged today. Tap "+ Note" to track your problem sets.</div>`;
  } else {
    notes.forEach((n, idx) => {
      const d = document.createElement('div');
      d.className = "bg-slate-950/60 border border-slate-800 rounded-xl p-2.5 space-y-1.5";
      d.innerHTML = `
        <div class="flex items-center justify-between">
          <span class="text-[11px] font-bold text-blue-300">${n.title}</span>
          <button onclick="deleteCourseNote(${idx})" class="text-slate-600 hover:text-rose-400 p-0.5"><i data-lucide="trash" class="w-3 h-3"></i></button>
        </div>
        <textarea rows="2" placeholder="Key equations, problem sets worked on, derivations..." oninput="updateCourseNoteText(${idx}, this.value)" class="w-full bg-slate-900/60 border border-slate-800 rounded-lg p-2 text-[10px] text-slate-200 placeholder-slate-600 resize-none">${n.text || ''}</textarea>
      `;
      cC.appendChild(d);
    });
  }
}

function renderBrainstorms(rec) {
  const bC = document.getElementById('brainstormCardsList');
  if (!bC) return;
  bC.innerHTML = '';
  const cards = rec.academics.brainstorms || [];
  if (cards.length === 0) {
    bC.innerHTML = `<div class="text-center py-4 text-[10px] text-slate-600 font-semibold border border-dashed border-slate-800 rounded-xl">Brainstorm board clean. Tap "+ Idea" to sketch flight specs or schematic updates.</div>`;
  } else {
    cards.forEach((c, idx) => {
      const d = document.createElement('div');
      d.className = "bg-slate-950/60 border border-slate-800 rounded-xl p-2.5 space-y-1.5";
      d.innerHTML = `
        <div class="flex items-center justify-between">
          <span class="text-[11px] font-bold text-purple-300">${c.title}</span>
          <button onclick="deleteBrainstormCard(${idx})" class="text-slate-600 hover:text-rose-400 p-0.5"><i data-lucide="trash" class="w-3 h-3"></i></button>
        </div>
        <textarea rows="2" placeholder="CAD dimensions, flight controller pinouts, soldering notes..." oninput="updateBrainstormBody(${idx}, this.value)" class="w-full bg-slate-900/60 border border-slate-800 rounded-lg p-2 text-[10px] text-slate-200 placeholder-slate-600 resize-none">${c.body || ''}</textarea>
      `;
      bC.appendChild(d);
    });
  }
}

function toggleDroneSprint() {
  if (isDateInFuture(currentDate) || isDateBeforeStart(currentDate)) return;
  const rec = getDayRecord(getDayKey(currentDate));
  rec.drone.done = !rec.drone.done;
  persist();
}

function addCourseNote() {
  const rec = getDayRecord(getDayKey(currentDate));
  const title = prompt("Course / Study Focus (e.g. ECE Circuits, Physics, Algorithms):");
  if (title) {
    rec.academics.courseNotes.push({ id: Date.now(), title, text: "" });
    persist();
  }
}

function updateCourseNoteText(idx, val) {
  const rec = getDayRecord(getDayKey(currentDate));
  if (rec.academics.courseNotes[idx]) {
    rec.academics.courseNotes[idx].text = val;
    localStorage.setItem('protocol_os_master', JSON.stringify(appData));
  }
}

function deleteCourseNote(idx) {
  const rec = getDayRecord(getDayKey(currentDate));
  rec.academics.courseNotes.splice(idx, 1);
  persist();
}

function addBrainstormCard() {
  const rec = getDayRecord(getDayKey(currentDate));
  const title = prompt("New Idea / Subsystem Title (e.g. ESC Telemetry, Frame CAD):");
  if (title) {
    rec.academics.brainstorms.push({ id: Date.now(), title, body: "" });
    persist();
  }
}

function updateBrainstormBody(idx, val) {
  const rec = getDayRecord(getDayKey(currentDate));
  if (rec.academics.brainstorms[idx]) {
    rec.academics.brainstorms[idx].body = val;
    localStorage.setItem('protocol_os_master', JSON.stringify(appData));
  }
}

function deleteBrainstormCard(idx) {
  const rec = getDayRecord(getDayKey(currentDate));
  rec.academics.brainstorms.splice(idx, 1);
  persist();
}
