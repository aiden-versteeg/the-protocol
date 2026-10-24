// ============================================================================
// NUTRITION OS & CALORIE TRACKER: NETNUTRITION, AI AUDIT & DINING DECONSTRUCTION
// ============================================================================

const mealImages = { m_breakfast: [], m_lunch: [], m_dinner: [], m_snacks: [] };

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
  const targetC = userGoals.carbs || 300;
  const targetF = userGoals.fat || 70;

  const calPct = Math.min(100, Math.round((totalCal / targetCal) * 100));
  const pPct = Math.min(100, Math.round((totalP / targetP) * 100));
  const cPct = Math.min(100, Math.round((totalC / targetC) * 100));
  const fPct = Math.min(100, Math.round((totalF / targetF) * 100));

  container.innerHTML = `
    <!-- DYNAMIC TDEE & TARGETS COCKPIT -->
    <div class="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 shadow-xl space-y-3.5">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-2">
          <div class="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <i data-lucide="calculator" class="w-4 h-4"></i>
          </div>
          <div>
            <h2 class="text-sm font-bold text-white">Daily Calorie & Macro Target</h2>
            <div class="text-[10px] text-slate-400">UCSB NetNutrition & Hypertrophy Targets</div>
          </div>
        </div>
        <button onclick="applyDynamicCalorieGoal()" class="text-[9px] font-bold px-2.5 py-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 rounded-lg transition">
          Sync Dynamic TDEE
        </button>
      </div>

      <!-- Macro Meter Grid -->
      <div class="grid grid-cols-4 gap-2 pt-1 text-center">
        <div class="bg-slate-950/60 border border-slate-800 p-2 rounded-xl">
          <span class="text-[8px] text-slate-400 uppercase font-bold block mb-0.5">Calories</span>
          <span class="text-xs font-black text-white">${totalCal}</span>
          <span class="text-[7px] text-slate-500 block">/ ${targetCal}</span>
          <div class="w-full h-1 bg-slate-900 rounded-full mt-1.5 overflow-hidden">
            <div class="h-full bg-orange-500" style="width: ${calPct}%"></div>
          </div>
        </div>

        <div class="bg-slate-950/60 border border-slate-800 p-2 rounded-xl">
          <span class="text-[8px] text-amber-400 uppercase font-bold block mb-0.5">Protein</span>
          <span class="text-xs font-black text-amber-400">${totalP}g</span>
          <span class="text-[7px] text-slate-500 block">/ ${targetP}g</span>
          <div class="w-full h-1 bg-slate-900 rounded-full mt-1.5 overflow-hidden">
            <div class="h-full bg-amber-400" style="width: ${pPct}%"></div>
          </div>
        </div>

        <div class="bg-slate-950/60 border border-slate-800 p-2 rounded-xl">
          <span class="text-[8px] text-cyan-400 uppercase font-bold block mb-0.5">Carbs</span>
          <span class="text-xs font-black text-cyan-400">${totalC}g</span>
          <span class="text-[7px] text-slate-500 block">/ ${targetC}g</span>
          <div class="w-full h-1 bg-slate-900 rounded-full mt-1.5 overflow-hidden">
            <div class="h-full bg-cyan-400" style="width: ${cPct}%"></div>
          </div>
        </div>

        <div class="bg-slate-950/60 border border-slate-800 p-2 rounded-xl">
          <span class="text-[8px] text-rose-400 uppercase font-bold block mb-0.5">Fats</span>
          <span class="text-xs font-black text-rose-400">${totalF}g</span>
          <span class="text-[7px] text-slate-500 block">/ ${targetF}g</span>
          <div class="w-full h-1 bg-slate-900 rounded-full mt-1.5 overflow-hidden">
            <div class="h-full bg-rose-400" style="width: ${fPct}%"></div>
          </div>
        </div>
      </div>

      <!-- Live Dynamic Calorie Energy Audit -->
      <div class="grid grid-cols-4 gap-1.5 text-center text-[9px] font-mono bg-slate-950/70 p-2 rounded-xl border border-slate-800/80">
        <div><span class="text-slate-500 block">BMR</span><span class="text-slate-200 font-bold">${dynCal.bmr}</span></div>
        <div><span class="text-slate-500 block">NEAT (20%)</span><span class="text-slate-200 font-bold">+${dynCal.neat}</span></div>
        <div><span class="text-slate-500 block">EXERCISE</span><span class="text-emerald-400 font-bold">+${dynCal.exercise}</span></div>
        <div><span class="text-slate-500 block">SURPLUS</span><span class="text-amber-400 font-bold">+${dynCal.surplus}</span></div>
      </div>
    </div>

    <!-- MEALS & UCSB DINING DECONSTRUCTION CONTAINER -->
    <div class="space-y-3" id="mealsContainer"></div>
  `;

  const isPrior = isDateBeforeStart(currentDate);
  const isFuture = isDateInFuture(currentDate);
  renderMealsList(rec, isPrior, isFuture);
  lucide.createIcons();
}

function renderMealsList(rec, isPrior, isFuture) {
  const mIC = document.getElementById('mealsContainer');
  if (!mIC) return;
  mIC.innerHTML = '';

  MEALS.forEach(m => {
    const mD = rec.meals[m.id] || { text: '', cal: 0, p: 0, c: 0, f: 0, diningHall: 'DLG', portion: '1.0', isUcsb: true, items: [] };
    const card = document.createElement('div');
    card.className = 'bg-slate-950/60 border border-slate-800 rounded-2xl p-4 space-y-3 shadow-lg';

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
        <input type="text" value="${mD.text || ''}" ${isPrior || isFuture ? 'disabled' : ''} placeholder="Describe foods (e.g. 2 scoops beef fajitas, rice, beans)..." onchange="updateMealField('${m.id}', 'text', this.value)" class="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 placeholder-slate-600 focus:border-amber-500/50" />
        <label class="p-2 bg-slate-900 rounded-lg text-slate-400 hover:text-white cursor-pointer transition flex items-center justify-center shrink-0 border border-slate-800">
          <i data-lucide="camera" class="w-4 h-4"></i>
          <input type="file" accept="image/*" multiple class="hidden" onchange="handleImageSelection(event, '${m.id}')" ${isPrior || isFuture ? 'disabled' : ''} />
        </label>
      </div>

      <div class="bg-slate-900/60 border border-slate-800/80 rounded-lg p-2.5 space-y-2">
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

      <div class="flex items-center gap-1.5 pt-0.5">
        <button type="button" ${isPrior || isFuture ? 'disabled' : ''} onclick="triggerLocalEst('${m.id}')" class="flex-1 py-1.5 bg-slate-900 hover:bg-slate-800 text-[10px] font-bold text-slate-300 rounded-lg border border-slate-800 transition">
          Quick Est
        </button>
        <button type="button" id="btnCloud_${m.id}" ${isPrior || isFuture ? 'disabled' : ''} onclick="triggerCloudAiEst('${m.id}')" class="flex-[1.6] py-1.5 bg-gradient-to-r from-amber-900/40 via-orange-900/40 to-slate-900 hover:from-amber-900/60 text-[10px] font-bold text-amber-300 rounded-lg border border-amber-500/40 transition flex items-center justify-center gap-1">
          <i data-lucide="sparkles" class="w-3 h-3 text-amber-400"></i>
          <span>Deconstruct & Audit</span>
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
    mIC.appendChild(card);
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
  files.forEach(file => {
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
` : ""}

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
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${encodeURIComponent(apiKey)}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contents: [{ parts: parts }] })
      });

      if (res.status === 429 || res.status === 403 || res.status === 400) {
        const errJson = await res.json().catch(() => ({}));
        console.warn(`Key #${keyIdx + 1} hit error:`, errJson.error?.message || res.status);
        lastError = new Error(errJson.error?.message || `HTTP ${res.status}`);
        continue;
      }

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!rawText) throw new Error("Empty response from Gemini.");

      const cleanJson = rawText.replace(/^```json|```/g, "").trim();
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
    btn.innerHTML = '<span class="animate-pulse">Auditing NetNutrition...</span>';
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
      }
      m.items = est.items || [];
      m.auditNote = est.audit_note || '';
      mealImages[mId] = [];
      syncAutomations(rec);
      persist();
    }
  } catch (err) {
    alert(`Deconstruction Error: ${err.message}`);
  } finally {
    if (btn) {
      btn.innerHTML = orig;
      btn.disabled = false;
    }
    lucide.createIcons();
  }
}

function parseLocalMacros(queryText) {
  const text = queryText.toLowerCase().trim();
  if (!text) return { cal: 0, p: 0, c: 0, f: 0 };
  let cal = 0, p = 0, c = 0, f = 0;

  const ozMatch = text.match(/(\d+(\.\d+)?)\s*oz\s*(chicken breast|steak|beef|salmon|turkey|tuna|fish)/);
  if (ozMatch) {
    const oz = parseFloat(ozMatch[1]);
    const isC = text.includes('chicken') || text.includes('turkey');
    p += Math.round(oz * 7.5);
    f += Math.round(oz * (isC ? 1.5 : 4));
    cal += Math.round(oz * (isC ? 45 : 65));
  }

  const eggMatch = text.match(/(\d+)\s*(whole\s*)?eggs?/);
  if (eggMatch) { 
    const ct = parseInt(eggMatch[1], 10); 
    cal += ct * 72; p += ct * 6; f += ct * 5; c += ct * 0.5; 
  }

  const scoopMatch = text.match(/(\d+)\s*scoops?/);
  if (scoopMatch) { 
    const ct = parseInt(scoopMatch[1], 10); 
    cal += ct * 125; p += ct * 25; c += ct * 3; f += ct * 1.5; 
  }

  const toastMatch = text.match(/(\d+)\s*slices?\s*(bread|toast|sourdough)?/);
  if (toastMatch) { 
    const ct = parseInt(toastMatch[1], 10); 
    cal += ct * 80; c += ct * 15; p += ct * 3; f += ct * 1; 
  }

  if (text.includes("greek yogurt")) { cal += 130; p += 18; c += 7; }
  if (text.includes("fairlife")) { cal += 150; p += 30; c += 6; f += 2.5; }
  if (text.includes("chipotle")) { 
    const d = text.includes("double"); 
    cal += d ? 950 : 750; p += d ? 55 : 38; c += 80; f += d ? 32 : 24; 
  }

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
