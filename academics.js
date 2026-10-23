// =========================================================================
// PROTOCOL OS: ACADEMICS & DEEP WORK LOGGER
// =========================================================================

function renderAcademicsView() {
  const container = document.getElementById('view_academics');
  const todayKey = getTodayKey();
  const day = getDayRecord(todayKey);

  const totalMinutes = (day.studyLogs || []).reduce((acc, l) => acc + (l.duration || 0), 0);

  container.innerHTML = `
    <!-- FOCUS SESSION COUNTER -->
    <div class="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3">
      <div class="flex items-center justify-between border-b border-slate-800 pb-2">
        <h2 class="text-xs font-black tracking-wide text-white uppercase flex items-center gap-1.5">
          <i data-lucide="cpu" class="w-4 h-4 text-purple-400"></i>
          Deep Work Anchor (ECE & Engineering)
        </h2>
        <span class="text-xs font-bold text-purple-400">${Math.floor(totalMinutes / 60)}h ${totalMinutes % 60}m Logged</span>
      </div>

      <!-- LOG TIME INPUT -->
      <div class="flex gap-2">
        <input type="text" id="studyTopicInput" placeholder="Topic (e.g. Device Physics / Verilog)" class="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-white placeholder-slate-600" />
        <input type="number" id="studyDurationInput" placeholder="Mins" class="w-20 bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-white text-center" />
        <button onclick="logStudyBlock()" class="px-3.5 py-1.5 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl text-xs transition">
          Log
        </button>
      </div>

      <!-- LOGGED SESSIONS -->
      <div class="space-y-1.5 pt-1">
        ${(day.studyLogs || []).map((s, idx) => `
          <div class="flex items-center justify-between bg-slate-950 border border-slate-800/80 rounded-xl px-3 py-2 text-xs">
            <div>
              <span class="font-bold text-white block">${s.topic}</span>
              <span class="text-[10px] text-slate-400 font-mono">${s.duration} minutes</span>
            </div>
            <button onclick="deleteStudyBlock(${idx})" class="text-slate-500 hover:text-rose-400">✕</button>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

function logStudyBlock() {
  const topicInput = document.getElementById('studyTopicInput');
  const durationInput = document.getElementById('studyDurationInput');
  const topic = topicInput.value.trim();
  const duration = Number(durationInput.value);

  if (!topic || !duration) return;

  const day = getDayRecord(getTodayKey());
  day.studyLogs.push({ topic, duration, timestamp: new Date().toISOString() });

  // Auto-complete deep work habit if >= 90 mins
  const total = day.studyLogs.reduce((acc, l) => acc + (l.duration || 0), 0);
  if (total >= 90) {
    day.habits['h_deepwork'] = true;
  }

  topicInput.value = '';
  durationInput.value = '';
  persist();
}

function deleteStudyBlock(idx) {
  const day = getDayRecord(getTodayKey());
  day.studyLogs.splice(idx, 1);
  persist();
}
