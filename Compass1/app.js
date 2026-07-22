/* ============================================================
   COMPASS — AI Life Coach PWA
   Single-file app logic. Vanilla JS, localStorage persistence.
   All "AI" responses below are rule-based simulations designed
   to demonstrate the product's UX — swap coachEngine.respond()
   for a real model call when ready.

   Theme: "Cotton Candy", decluttered pass — one consistent accent
   colour, Lucide icons throughout (no emoji in UI chrome), a
   dedicated Coach tab, and consolidated list-style cards.
   ============================================================ */

const STORAGE_KEY = "compassState_v1";
const LIFE_WHEEL_AREAS = ["Career","Relationships","Health","Money","Mindset","Purpose","Home","Fun","Spirituality","Learning","Environment","Adventure"];
const IDENTITY_LAYERS = ["Professional Self","Confident Self","Creative Self","Healthy Self","Partner Self","Leader Self","Adventurer","Home Curator"];
const PERSONALITIES = [
  {id:"calm", icon:"leaf", label:"Calm Therapist"},
  {id:"performance", icon:"zap", label:"Performance Coach"},
  {id:"executive", icon:"crown", label:"Executive Coach"},
  {id:"friend", icon:"heart", label:"Compassionate Friend"},
  {id:"adhd", icon:"brain", label:"ADHD Coach"},
  {id:"fitness", icon:"dumbbell", label:"Fitness Coach"},
  {id:"money", icon:"wallet", label:"Money Mentor"},
  {id:"mindset", icon:"lightbulb", label:"Mindset Coach"},
];
const MOODS = [
  {k:"great", icon:"smile", label:"Great"},
  {k:"calm", icon:"feather", label:"Calm"},
  {k:"tired", icon:"moon", label:"Tired"},
  {k:"stressed", icon:"zap", label:"Stressed"},
  {k:"overwhelmed", icon:"cloud-rain", label:"A lot"},
  {k:"numb", icon:"circle-dashed", label:"Numb"},
];
const AREA_TILES = [
  {v:"confidenceStudio", name:"Confidence Studio", icon:"trending-up"},
  {v:"wealth", name:"Wealth", icon:"wallet"},
  {v:"relationships", name:"Relationships", icon:"heart"},
  {v:"health", name:"Health", icon:"heart-pulse"},
  {v:"houseArea", name:"Home", icon:"home"},
  {v:"identity", name:"Identity", icon:"fingerprint"},
  {v:"timelineView", name:"Life Timeline", icon:"history"},
  {v:"weeklyReview", name:"Weekly Review", icon:"calendar-check"},
  {v:"lifeAudit", name:"Life Audit", icon:"search"},
  {v:"settings", name:"Coach & Settings", icon:"settings"},
];

/* ---------------- Self-contained icon set ----------------
   No external CDN dependency (was breaking offline / when the
   icon CDN was blocked, leaving blank nav icons and empty
   circular buttons). Every icon used in the app is inlined here
   as SVG path data in Lucide's line-icon style. ---------------- */
const ICONS = {
  home: '<path d="M3 10.5 12 3l9 7.5"/><path d="M5 9.5V20a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1V9.5"/>',
  "message-circle": '<path d="M12 21c-4.97 0-9-3.58-9-8s4.03-8 9-8 9 3.58 9 8c0 1.6-.53 3.09-1.44 4.35.14.9.5 2.02 1.44 3.15-1.3.1-2.7-.2-3.7-.7-1.5.75-3.4 1.2-5.3 1.2Z"/>',
  "clipboard-list": '<rect x="5" y="4" width="14" height="17" rx="2"/><path d="M9 3h6a1 1 0 0 1 1 1v1H8V4a1 1 0 0 1 1-1Z"/><path d="M8 11h8M8 15h8M8 19h5"/>',
  wheel: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="2.2"/><path d="M12 3v18M19.8 7.5 4.2 16.5M4.2 7.5 19.8 16.5"/>',
  "trending-up": '<path d="M3 17l6-6 4 4 8-8"/><path d="M15 7h6v6"/>',
  target: '<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="4.5"/><circle cx="12" cy="12" r="1"/>',
  briefcase: '<rect x="3" y="7" width="18" height="13" rx="2"/><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><path d="M3 12h18"/>',
  sparkles: '<path d="M11 3 12.3 8.7 18 10 12.3 11.3 11 17 9.7 11.3 4 10 9.7 8.7 11 3Z"/><path d="M18.5 15 19 17l2 .5-2 .5-.5 2-.5-2-2-.5 2-.5.5-2Z"/>',
  x: '<path d="M6 6 18 18M18 6 6 18"/>',
  "badge-check": '<circle cx="12" cy="12" r="9"/><path d="M8.5 12.5 11 15l4.5-6"/>',
  check: '<path d="M5 12.5 9.5 17 19 7"/>',
  "chevron-left": '<path d="M15 6 9 12l6 6"/>',
  "chevron-right": '<path d="M9 6l6 6-6 6"/>',
  "rotate-ccw": '<path d="M3 12a9 9 0 1 0 3-6.7"/><path d="M3 4v5h5"/>',
  mic: '<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0"/><path d="M12 18v3M9 21h6"/>',
  send: '<path d="M4 4 20 12 4 20l3-8-3-8Z"/>',
  "loader-2": '<path d="M12 3a9 9 0 1 1-6.36 2.64"/>',
  pencil: '<path d="M4 20h4L18.5 9.5a2.5 2.5 0 0 0-3.5-3.5L4.5 16.5 4 20Z"/><path d="M14 6.5 17.5 10"/>',
  "trash-2": '<path d="M4 7h16"/><path d="M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/><path d="M6 7l1 13a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1l1-13"/><path d="M10 11v6M14 11v6"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  "wand-2": '<path d="M6 18 17 7"/><path d="M15 3l.7 1.8L17.5 5.5 15.7 6.2 15 8l-.7-1.8L12.5 5.5l1.8-.7Z"/>',
  leaf: '<path d="M11 20A7 7 0 0 1 4 13c0-6 6-11 15-11 0 9-5 15-11 15Z"/><path d="M4 20 12 12"/>',
  zap: '<path d="M13 2 4 14h6l-1 8 9-12h-6l1-8Z"/>',
  crown: '<path d="M3 8l4 3 5-6 5 6 4-3-2 10H5L3 8Z"/><path d="M5 19h14"/>',
  heart: '<path d="M12 20s-7-4.35-9.5-8.5C.7 8 2 4.5 5.5 4.5 8 4.5 10 6 12 8c2-2 4-3.5 6.5-3.5C22 4.5 23.3 8 21.5 11.5 19 15.65 12 20 12 20Z"/>',
  brain: '<path d="M9 3a3 3 0 0 0-3 3 3 3 0 0 0-2 5 3 3 0 0 0 2 5h2V3Z"/><path d="M15 3a3 3 0 0 1 3 3 3 3 0 0 1 2 5 3 3 0 0 1-2 5h-2V3Z"/>',
  dumbbell: '<path d="M2 10v4M22 10v4"/><path d="M5 8v8M19 8v8"/><path d="M8 12h8"/>',
  wallet: '<rect x="3" y="6" width="18" height="13" rx="2"/><path d="M3 10h18"/><circle cx="16.5" cy="14" r="1.2"/>',
  lightbulb: '<path d="M9 18h6"/><path d="M10 21h4"/><path d="M12 3a6 6 0 0 0-3.5 10.9c.6.45 1 1.2 1 2.1h5c0-.9.4-1.65 1-2.1A6 6 0 0 0 12 3Z"/>',
  smile: '<circle cx="12" cy="12" r="9"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><path d="M9 9h.01M15 9h.01"/>',
  feather: '<path d="M20.24 3.76a6 6 0 0 0-8.49 0l-7.5 7.5a6 6 0 0 0 8.49 8.49l7.5-7.5a6 6 0 0 0 0-8.49Z"/><path d="M16 8 2 22M17.5 15H9"/>',
  moon: '<path d="M20 14.5A8.5 8.5 0 1 1 9.5 4a7 7 0 0 0 10.5 10.5Z"/>',
  "cloud-rain": '<path d="M6 15a4.5 4.5 0 0 1 .5-9 5.5 5.5 0 0 1 10.6 1.6A4 4 0 0 1 17 15H6Z"/><path d="M8 18l-1 3M12 18l-1 3M16 18l-1 3"/>',
  "circle-dashed": '<circle cx="12" cy="12" r="9" stroke-dasharray="3 3"/>',
  "heart-pulse": '<path d="M12 20s-7-4.35-9.5-8.5C.7 8 2 4.5 5.5 4.5 8 4.5 10 6 12 8c2-2 4-3.5 6.5-3.5C22 4.5 23.3 8 21.5 11.5 19 15.65 12 20 12 20Z"/><path d="M4 11h3l1.5-3 2 5 1.5-3h5.5"/>',
  fingerprint: '<path d="M12 3a7 7 0 0 0-7 7c0 3 1 5 1 7"/><path d="M12 3a7 7 0 0 1 7 7c0 1.5-.1 2.7-.4 3.8"/><path d="M8 10a4 4 0 0 1 8 0c0 4-2 6-2 9"/><path d="M12 10v3c0 3-1 5-2.5 7"/>',
  history: '<path d="M3 12a9 9 0 1 0 3-6.7"/><path d="M3 4v5h5"/><path d="M12 8v4l3 2"/>',
  "calendar-check": '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/><path d="M9 15l2 2 4-4"/>',
  search: '<circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/>',
  settings: '<circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M2 12h3M19 12h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1"/>',
  sun: '<circle cx="12" cy="12" r="4.5"/><path d="M12 2v3M12 19v3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M2 12h3M19 12h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1"/>',
  "cloud-sun": '<circle cx="7" cy="6" r="2.5"/><path d="M7 2v1M3 6h1M11 6h1M4.2 3.2l.7.7M9.1 3.2l-.7.7"/><path d="M9 17a4 4 0 0 1 .3-8 5 5 0 0 1 9.6 1.6A3.5 3.5 0 0 1 18 17H9Z"/>',
  sunset: '<path d="M17 18a5 5 0 0 0-10 0"/><path d="M12 12V6M4.9 9.9l1.4 1.4M19.1 9.9l-1.4 1.4M2 18h3M19 18h3M2 22h20"/>',
  quote: '<path d="M6 9c-1.5 0-2.5 1-2.5 2.5S4.5 14 6 14M6 9v5M14 9c-1.5 0-2.5 1-2.5 2.5S12.5 14 14 14M14 9v5"/>',
  repeat: '<path d="M4 7h13a3 3 0 0 1 3 3v2"/><path d="M15 4l4 3-4 3"/><path d="M20 17H7a3 3 0 0 1-3-3v-2"/><path d="M9 20l-4-3 4-3"/>',
  eye: '<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/>',
  "pencil-line": '<path d="M4 20h4L18.5 9.5a2.5 2.5 0 0 0-3.5-3.5L4.5 16.5 4 20Z"/><path d="M14 6.5 17.5 10"/><path d="M4 21h5"/>',
  flame: '<path d="M12 22a7 7 0 0 0 7-7c0-3-2-4.5-3-7 0 2-1.5 3-2.5 2 1-3-.5-5.5-2.5-7 .5 3-1 4.5-3 7-1.5 2-3 3.5-3 5a7 7 0 0 0 7 7Z"/>',
  "message-square": '<path d="M4 5h16v11H8l-4 4V5Z"/>',
  shield: '<path d="M12 3l7 3v6c0 5-3 7.5-7 9-4-1.5-7-4-7-9V6l7-3Z"/>',
  gift: '<rect x="3" y="9" width="18" height="12" rx="1"/><path d="M3 9V6a1 1 0 0 1 1-1h16a1 1 0 0 1 1 1v3"/><path d="M12 5v16"/><path d="M12 5C11 2 7 2 7 5c0 2 2 2 5 0Z"/><path d="M12 5c1-3 5-3 5 0 0 2-2 2-5 0Z"/>',
  octagon: '<path d="M8 3h8l5 5v8l-5 5H8l-5-5V8Z"/>',
  users: '<circle cx="9" cy="8" r="3.2"/><path d="M3.5 20a5.5 5.5 0 0 1 11 0"/><path d="M16 8.5a3 3 0 1 1 .5 6"/><path d="M15 14.2a5.4 5.4 0 0 1 5.5 5.8"/>',
  box: '<path d="M3 8l9-5 9 5-9 5-9-5Z"/><path d="M3 8v8l9 5 9-5V8"/><path d="M12 13v8"/>',
  sparkle: '<path d="M12 2 13.8 9.2 21 11 13.8 12.8 12 20 10.2 12.8 3 11 10.2 9.2 12 2Z"/>',
  "layout-grid": '<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>',
  calendar: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>',
  "book-open": '<path d="M12 6C10 4.5 6.5 4 3 4v14c3.5 0 7 .5 9 2 2-1.5 5.5-2 9-2V4c-3.5 0-7 .5-9 2Z"/><path d="M12 6v14"/>',
  compass: '<circle cx="12" cy="12" r="9"/><path d="M15 9l-2 6-6 2 2-6 6-2Z"/>',
  trophy: '<path d="M8 4h8v6a4 4 0 0 1-8 0V4Z"/><path d="M8 5H5a3 3 0 0 0 3 4M16 5h3a3 3 0 0 1-3 4"/><path d="M12 14v3M9 21h6M9 21c0-1.5.5-2.5 1.5-3h3c1 .5 1.5 1.5 1.5 3"/>',
  circle: '<circle cx="12" cy="12" r="9"/>',
};
function svgIcon(name, cls) {
  const inner = ICONS[name] || ICONS.circle;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"${cls ? ` class="${cls}"` : ""}>${inner}</svg>`;
}
function icons(root) {
  (root || document).querySelectorAll("[data-lucide]").forEach(el => {
    const name = el.getAttribute("data-lucide");
    const cls = el.getAttribute("class") || "";
    const span = document.createElement("span");
    span.innerHTML = svgIcon(name, cls);
    const svgEl = span.firstElementChild;
    if (svgEl) el.replaceWith(svgEl);
  });
}

function defaultState() {
  const now = new Date().toISOString();
  return {
    user: { name: "Harriet" },
    coachPersonality: "friend",
    mood: { today: null, history: [] },
    lifeWheel: Object.fromEntries(LIFE_WHEEL_AREAS.map(a => [a, { score: 6, history: [{ date: now, score: 6 }] }])),
    identity: Object.fromEntries(IDENTITY_LAYERS.map(l => [l, 55 + Math.round(Math.random()*20)])),
    confidence: { score: 62, history: [{ date: now, score: 62 }] },
    goals: [], // {id,title,vision,milestones:[{text,done}],dailyActions:[],confidenceExercises:[],reflectionPrompts:[],winRate}
    habits: [],
    journal: [], // {date, text}
    wealth: { savingsGoal: 10000, salaryGoal: 75000, netWorthNote: "Not yet tracked", beliefs: [], financialConfidence: 55 },
    weeklyReviews: [],
    timeline: [
      { id: uid(), date: "2026-01-08", title: "Started leadership journey" },
      { id: uid(), date: "2026-03-02", title: "Completed confidence programme" },
    ],
    conversations: [], // {date, messages:[{role,text}]}
    chatContext: { pending: null, turns: 0 },
    lastAudit: null,
    recoveryMode: false,
    todayChecks: { date: "", checks: [false,false,false] },
  };
}

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultState();
    const parsed = JSON.parse(raw);
    return Object.assign(defaultState(), parsed);
  } catch (e) {
    return defaultState();
  }
}

let S = load();
function save() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(S));
  queueServerSync();
}

/* ---------------- Neon Postgres sync (optional, non-blocking) ----------------
   localStorage is always the instant, offline-safe source of truth for the
   current tab. If /api/state exists (i.e. this is deployed on Vercel with
   DATABASE_URL configured), we also push changes there in the background
   and pull down the latest on load, so state carries across devices/browsers.
   If the API isn't there (plain static hosting, or DB not set up yet) every
   call below just fails silently and the app behaves exactly as before. ---- */
let syncTimer = null;
let serverSyncAvailable = true;
function queueServerSync() {
  if (!serverSyncAvailable) return;
  clearTimeout(syncTimer);
  syncTimer = setTimeout(pushToServer, 1200);
}
async function pushToServer() {
  try {
    const res = await fetch("/api/state", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(S),
    });
    if (res.status === 404) serverSyncAvailable = false; // no API route deployed
  } catch (e) {
    // offline or API not available — localStorage already has the data, ignore
  }
}
async function pullFromServer() {
  try {
    const res = await fetch("/api/state");
    if (res.status === 404) { serverSyncAvailable = false; return; }
    if (!res.ok) return;
    const { data } = await res.json();
    if (data && Object.keys(data).length) {
      S = Object.assign(defaultState(), data);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(S));
      render();
    } else {
      // DB has no saved state yet (first run) — push what we have locally
      pushToServer();
    }
  } catch (e) {
    // offline or API not available — keep using localStorage state
  }
}

/* ---------------- Cross-app data (read-only) ----------------
   Compass reads (never writes) a couple of other apps' own databases
   so their pages can show live numbers instead of "not connected"
   placeholders. Each is its own Neon project with its own env var on
   the server side — if a var isn't set yet, the API route 503s and we
   just keep showing the placeholder, same non-breaking pattern as the
   Compass sync above. --------------------------------------------- */
const externalData = { houseOfHarriet: null, bodyAtelier: null };

async function fetchHouseOfHarriet() {
  try {
    const res = await fetch("/api/house-of-harriet");
    if (!res.ok) return;
    const { data } = await res.json();
    if (data) {
      externalData.houseOfHarriet = data;
      if (currentView === "houseArea") render();
    }
  } catch (e) {
    // not configured / offline — leave as null, page shows "not connected"
  }
}

async function fetchBodyAtelier() {
  try {
    const res = await fetch("/api/body-atelier");
    if (!res.ok) return;
    const { data } = await res.json();
    if (data) {
      externalData.bodyAtelier = data;
      if (currentView === "health") render();
    }
  } catch (e) {
    // not configured / offline — leave as null, page shows "not connected"
  }
}

/* ---------------- Utility helpers ---------------- */
function fmtDate(d) { return new Date(d).toLocaleDateString(undefined, { weekday:"short", month:"short", day:"numeric" }); }
function clamp(n, lo, hi) { return Math.max(lo, Math.min(hi, n)); }
function pick(arr) { return arr[Math.floor(Math.random()*arr.length)]; }
function uid() { return Math.random().toString(36).slice(2, 9); }
function todayKey() { return new Date().toISOString().slice(0,10); }
function greetingInfo() {
  const h = new Date().getHours();
  if (h < 12) return { text: "Good morning", icon: "sun" };
  if (h < 18) return { text: "Good afternoon", icon: "cloud-sun" };
  return { text: "Good evening", icon: "sunset" };
}
function lowestArea() { return Object.entries(S.lifeWheel).sort((a,b)=>a[1].score-b[1].score)[0][0]; }
function highestArea() { return Object.entries(S.lifeWheel).sort((a,b)=>b[1].score-a[1].score)[0][0]; }
function bumpArea(area, delta) {
  const w = S.lifeWheel[area];
  w.score = clamp(Math.round((w.score + delta) * 10) / 10, 1, 10);
  w.history.push({ date: new Date().toISOString(), score: w.score });
}
function bumpConfidence(delta) {
  S.confidence.score = clamp(S.confidence.score + delta, 0, 100);
  S.confidence.history.push({ date: new Date().toISOString(), score: S.confidence.score });
}
function addJournal(text) { S.journal.unshift({ date: new Date().toISOString(), text }); }
function addTimeline(title) { S.timeline.push({ id: uid(), date: new Date().toISOString().slice(0,10), title }); }

/* ---------------- Shared UI components ---------------- */
function sealRow(text) {
  return `<div class="seal-row"><i data-lucide="badge-check"></i><span class="msg-txt">${text}</span></div>`;
}
function checkItem(extraAttr, checked, label) {
  return `<label class="hoh-check">
    <input type="checkbox" ${extraAttr} ${checked?"checked":""} />
    <span class="box"><i data-lucide="check"></i></span>
    <span class="txt">${label}</span>
  </label>`;
}
function listCard(items) {
  return `<div class="card">${items.map(it => `
    <div class="list-row">
      <span class="ic"><i data-lucide="${it.icon}"></i></span>
      <div class="body"><h3>${it.t}</h3><p>${it.d}</p></div>
    </div>`).join("")}</div>`;
}
function progressRing(percent, iconName, label, statusText) {
  const r = 70, c = 2 * Math.PI * r;
  const offset = c - (clamp(percent,0,100)/100) * c;
  return `
    <div class="ring-wrap">
      <svg width="176" height="176" viewBox="0 0 176 176">
        <circle cx="88" cy="88" r="${r}" fill="none" stroke="#FBE4EF" stroke-width="14" />
        <circle cx="88" cy="88" r="${r}" fill="none" stroke="#6BAA69" stroke-width="14" stroke-linecap="round"
          stroke-dasharray="${c}" stroke-dashoffset="${offset}" transform="rotate(-90 88 88)" />
        <text x="88" y="82" text-anchor="middle" font-family="Baloo 2" font-weight="700" font-size="34" fill="#2E2440">${Math.round(percent)}%</text>
        <text x="88" y="104" text-anchor="middle" font-family="Baloo 2" font-weight="700" font-size="10" letter-spacing="1.5" fill="#9891A3">${label.toUpperCase()}</text>
      </svg>
      <div class="ring-status">${statusText}</div>
    </div>`;
}
function starRow(count, color) {
  let s = `<div class="stars ${color}">`;
  for (let i=1;i<=5;i++) {
    s += `<svg viewBox="0 0 24 24" class="${i<=count?'filled':'empty'}" fill="currentColor" stroke="none"><polygon points="12,2 15,9 22,9.5 16.5,14 18.5,21 12,17 5.5,21 7.5,14 2,9.5 9,9"/></svg>`;
  }
  return s + `</div>`;
}
function statCard(icon, label, val) {
  return `<div class="stat-card"><span class="ic"><i data-lucide="${icon}"></i></span><div class="lbl">${label}</div><div class="val">${val}</div></div>`;
}
function actionCard(color, icon, label, onclick) {
  return `<div class="action-card ${color}" onclick="${onclick}"><span class="ic"><i data-lucide="${icon}"></i></span><span class="lbl">${label}</span></div>`;
}

/* ================= COACH ENGINE =================
   Rule-based keyword detection + canned coaching flows.
   Wrap tone by personality; simulate multi-turn "unpacking". */

const TONE = {
  calm:        { open:"Let's slow down and breathe through this together.", askMore:"Tell me a little more about that, in your own time." },
  performance: { open:"Good — let's turn this into momentum.", askMore:"What's the real blocker here? Be specific." },
  executive:   { open:"Understood. Let's think about this strategically.", askMore:"What outcome are you actually optimising for?" },
  friend:      { open:"Hey, I hear you. Let's unpack that.", askMore:"What's going on underneath that, do you think?" },
  adhd:        { open:"Okay, one thing at a time.", askMore:"Quick — what's the one detail that matters most right now?" },
  fitness:     { open:"Let's channel this into action.", askMore:"How's your body feeling in all this?" },
  money:       { open:"Let's look at this clearly, no judgement.", askMore:"What's the number or decision behind this feeling?" },
  mindset:     { open:"Interesting — let's reframe this.", askMore:"What story are you telling yourself about this?" },
};

const KEYWORDS = {
  overwhelm: ["overwhelm","stressed","stress","too much","burnt out","burned out","anxious","exhausted"],
  career:    ["promotion","career","raise","job","boss","work priorities","leadership","interview"],
  confidence:["confidence","apologi","not good enough","imposter","self-doubt","doubt myself","nervous"],
  relationship: ["relationship","partner","boyfriend","girlfriend","husband","wife","argument","conflict","dating"],
  health:    ["sleep","tired","gym","exercise","food","diet","energy","hormones","hydration"],
  home:      ["clutter","messy","house","home","cleaning","organise","organized","organised"],
  money:     ["money","savings","budget","salary","debt","spending","net worth"],
  win:       ["proud","excited","won","achieved","great news","nailed it","happy"],
};

function detectCategory(text) {
  const t = text.toLowerCase();
  for (const [cat, words] of Object.entries(KEYWORDS)) {
    if (words.some(w => t.includes(w))) return cat;
  }
  return null;
}

const FLOWS = {
  overwhelm: {
    followUp: "What's driving it most — the volume of work, unclear priorities, or something emotional underneath it?",
    build(state) {
      bumpConfidence(-3);
      bumpArea("Mindset", -0.5);
      bumpArea("Career", -0.3);
      addJournal("Feeling overwhelmed at work — coach flagged rising stress and unclear priorities.");
      return {
        narrative: "That makes sense. I've noted this as a stress spike with unclear work priorities.",
        updates: ["Confidence score", "Emotional wellbeing", "Work priorities", "Weekly Focus"],
      };
    }
  },
  career: {
    followUp: "What does the next step look like — is this about a specific promotion, or building toward something bigger?",
    build(state) {
      const g = {
        id: uid(),
        title: "Get the promotion",
        vision: "Become the obvious choice for the next level — visible impact, clear ownership, trusted voice in the room.",
        milestones: [
          { text: "Have the career conversation with your manager", done: false },
          { text: "Own one visible project end-to-end", done: false },
          { text: "Document 3 measurable wins", done: false },
          { text: "Get feedback from 2 senior colleagues", done: false },
        ],
        dailyActions: ["Spend 20 min on the visible project", "Note one win before bed"],
        confidenceExercises: ["Power posture before meetings", "Say one idea out loud in every meeting"],
        reflectionPrompts: ["Where did I lead today?", "What did I do that future-me would be proud of?"],
        winRate: 0,
        created: new Date().toISOString(),
      };
      state.goals.push(g);
      bumpArea("Career", 0.6);
      addTimeline("Started promotion goal: 12 Week Year");
      return {
        narrative: "I've built out a full 12 Week Year plan for this — Career Vision → 12 Week Goal → Weekly Milestones → Daily Actions → Confidence Exercises → Reflection Prompts. You'll find it under Goals.",
        updates: ["Career Vision", "12 Week Goal", "Weekly Milestones", "Life Wheel: Career"],
      };
    }
  },
  confidence: {
    followUp: "Do you notice this most at work, in relationships, or just generally when you speak up?",
    build(state) {
      bumpConfidence(-2);
      addJournal("Coach noticed a confidence pattern — likely over-apologising / self-doubt.");
      return {
        narrative: "I've picked up a pattern here. I've built a Confidence Studio exercise set for it — daily challenge, affirmation, reframe, visualisation, journal prompt and a mini exposure exercise.",
        updates: ["Confidence Studio exercises", "Confidence score", "Identity: Confident Self"],
      };
    }
  },
  relationship: {
    followUp: "Is this about communication, conflict, or more about connection and time together?",
    build(state) {
      bumpArea("Relationships", -0.4);
      addJournal("Relationship tension noted — coach suggested a communication check-in.");
      return {
        narrative: "Noted. I've added some relationship coaching prompts for you — a boundary check and a communication script you can use tonight.",
        updates: ["Life Wheel: Relationships", "Relationships toolkit"],
      };
    }
  },
  health: {
    followUp: "Is it sleep, movement, food, or general energy that feels off right now?",
    build(state) {
      bumpArea("Health", -0.3);
      addJournal("Energy/health dip noted by coach.");
      return {
        narrative: "Got it. I've logged this against your Health area and added a small recovery nudge for today.",
        updates: ["Life Wheel: Health", "Weekly Focus"],
      };
    }
  },
  home: {
    followUp: "Is it clutter building up, or more that the space just doesn't feel calm right now?",
    build(state) {
      bumpArea("Environment", -0.5);
      addTimeline("Environment dipped — declutter challenge suggested");
      return {
        narrative: "Your environment score has dropped. I've suggested a Declutter Challenge, a Cleaning Reset, and an Organisation Plan — all under Areas → Home.",
        updates: ["Life Wheel: Environment", "Home challenges"],
      };
    }
  },
  money: {
    followUp: "Is this about a specific number — savings, debt, a purchase — or how money makes you feel generally?",
    build(state) {
      bumpArea("Money", -0.2);
      state.wealth.beliefs.push(pick(["I have to work twice as hard for money", "Money is stressful to talk about", "I don't feel in control of my spending"]));
      return {
        narrative: "Thanks for being honest about that — money conversations are hard. I've logged a money belief to work through in Wealth.",
        updates: ["Wealth: money beliefs", "Financial confidence"],
      };
    }
  },
  win: {
    followUp: "Tell me more — what made this feel like a win?",
    build(state) {
      bumpConfidence(4);
      bumpArea("Mindset", 0.4);
      addJournal("Logged a win — confidence boosted.");
      return {
        narrative: "That's genuinely worth celebrating. I've logged it as a win and given your confidence score a boost.",
        updates: ["Confidence score", "Life Wheel: Mindset", "Journal"],
      };
    }
  },
};

const GENERIC_PROMPTS = [
  "Tell me what's on your mind — I'm listening.",
  "What's the one thing that would make today feel like a win?",
  "How's your energy, honestly, right now?",
  "What's something you're avoiding that you know you should deal with?",
];

const coachEngine = {
  respond(userText) {
    const tone = TONE[S.coachPersonality] || TONE.friend;
    const ctx = S.chatContext;
    const messages = [];

    if (ctx.pending) {
      const flow = FLOWS[ctx.pending];
      const result = flow.build(S);
      messages.push({ role: "coach", text: result.narrative });
      messages.push({ role: "system-update", text: "Updated: " + result.updates.join(" · ") });
      ctx.pending = null;
      ctx.turns = 0;
      save();
      return messages;
    }

    const cat = detectCategory(userText);
    if (cat && FLOWS[cat]) {
      messages.push({ role: "coach", text: tone.open });
      messages.push({ role: "coach", text: FLOWS[cat].followUp });
      ctx.pending = cat;
      ctx.turns = 1;
      save();
      return messages;
    }

    messages.push({ role: "coach", text: pick(GENERIC_PROMPTS) + " " + tone.askMore });
    save();
    return messages;
  }
};

/* ================= RENDERING ================= */
const viewEl = document.getElementById("view");
let currentView = "home";

function go(view) {
  currentView = view;
  document.querySelectorAll(".navbtn").forEach(b => b.classList.toggle("active", b.dataset.view === view));
  render();
  viewEl.scrollTop = 0;
}

function render() {
  const renderers = {
    home: renderHome,
    coach: renderCoach,
    wheel: renderWheel,
    goals: renderGoals,
    areas: renderAreasHub,
    insights: renderInsights,
    confidenceStudio: renderConfidenceStudio,
    wealth: renderWealth,
    relationships: renderRelationships,
    health: renderHealth,
    houseArea: renderHouseArea,
    identity: renderIdentity,
    timelineView: renderTimeline,
    weeklyReview: renderWeeklyReview,
    lifeAudit: renderLifeAudit,
    settings: renderSettings,
  };
  viewEl.innerHTML = (renderers[currentView] || renderHome)();
  bindView(currentView);
  icons();
}

function backButton(to) {
  return `<button class="back-link" onclick="go('${to}')"><i data-lucide="chevron-left"></i>Back</button>`;
}

/* ---------- HOME ---------- */
function computeTodayFocus() {
  const items = [];
  const activeGoal = S.goals[S.goals.length - 1];
  if (activeGoal) {
    const nextMilestone = activeGoal.milestones.find(m => !m.done);
    if (nextMilestone) items.push(`Move "${activeGoal.title}" forward: ${nextMilestone.text}`);
    if (activeGoal.dailyActions[0]) items.push(activeGoal.dailyActions[0]);
  }
  const low = lowestArea();
  items.push(`Give a little attention to ${low} — it's your lowest-scoring area right now`);
  while (items.length < 3) items.push(pick(["Take 10 minutes to journal", "Check in with your energy levels", "Do one small thing your future self will thank you for"]));
  return items.slice(0, 3);
}

function ensureTodayChecks(count) {
  if (S.todayChecks.date !== todayKey()) {
    S.todayChecks = { date: todayKey(), checks: new Array(count).fill(false) };
    save();
  }
  return S.todayChecks.checks;
}

const MOOD_LABELS = Object.fromEntries(MOODS.map(m => [m.k, m.label]));
const STRESS_BY_MOOD = { great:1, calm:1, tired:2, stressed:4, overwhelmed:5, numb:3 };
const ENERGY_BY_MOOD = { great:5, calm:4, tired:1, stressed:2, overwhelmed:1, numb:2 };

function renderHome() {
  const focus = computeTodayFocus();
  const checks = ensureTodayChecks(focus.length);
  const allDone = checks.every(Boolean) && checks.length > 0;
  const g = greetingInfo();
  const status = S.confidence.score >= 75 ? "Strong" : S.confidence.score >= 50 ? "Building" : "Steady";
  const wins = (S.goals.length ? S.goals[S.goals.length-1].milestones.filter(m=>m.done).length : 0) + checks.filter(Boolean).length;
  const stressStars = STRESS_BY_MOOD[S.mood.today] ?? 2;
  const energyStars = ENERGY_BY_MOOD[S.mood.today] ?? 3;

  return `
    <div class="eyebrow">${g.text}</div>
    <h1>Welcome back, <span class="hl">${S.user.name}</span></h1>

    ${progressRing(S.confidence.score, "target", "Confidence", status)}

    <div class="stat-row">
      ${statCard("smile", "Mood", S.mood.today ? MOOD_LABELS[S.mood.today] : "Not logged")}
      ${statCard("compass", "Focus area", lowestArea())}
      ${statCard("trophy", "Wins today", wins)}
    </div>

    <div class="rating-row">
      <div class="rating-card"><div class="lbl">Stress</div>${starRow(stressStars,"pink")}</div>
      <div class="rating-card"><div class="lbl">Energy</div>${starRow(energyStars,"green")}</div>
    </div>

    <div class="card border-green">
      <div class="section-title" style="margin-top:0">
        <h2 style="font-size:14.5px">Today's 3 moves</h2>
        <button class="edit-btn" id="resetFocusBtn" title="Reset checklist"><i data-lucide="rotate-ccw"></i></button>
      </div>
      ${focus.map((f,i) => checkItem(`data-focus-i="${i}"`, checks[i], f)).join("")}
      ${allDone ? sealRow("Day started strong.") : ""}
    </div>

    <div class="action-row">
      ${actionCard("pink", "flame", "I'm spiralling", "openEmergency()")}
      ${actionCard("green", "message-circle", "I'm stuck", "go('coach')")}
    </div>

    <div class="section-title"><h2>How are you feeling?</h2></div>
    <div class="mood-row">
      ${MOODS.map(m => `<button class="mood-btn ${S.mood.today===m.k?'selected':''}" data-mood="${m.k}"><i data-lucide="${m.icon}"></i>${m.label}</button>`).join("")}
    </div>
  `;
}

/* ---------- COACH (chat) ---------- */
function renderCoach() {
  return `
    <h1><i data-lucide="message-circle"></i> Your Coach</h1>
    <div class="pill-row" id="personalityRow">
      ${PERSONALITIES.map(p => `<span class="pill ${S.coachPersonality===p.id?'selected':''}" data-p="${p.id}"><i data-lucide="${p.icon}"></i>${p.label}</span>`).join("")}
    </div>
    <div class="chat-shell">
      <div class="chat-log" id="chatLog"></div>
      <div class="chat-input-row">
        <button class="mic-btn" id="micBtn" title="Voice (demo)"><i data-lucide="mic"></i></button>
        <input type="text" id="chatInput" placeholder="Type a message..." />
        <button class="send-btn" id="sendBtn"><i data-lucide="send"></i></button>
      </div>
    </div>
  `;
}

function renderChatLog() {
  const log = document.getElementById("chatLog");
  if (!log) return;
  const convo = getActiveConversation();
  log.innerHTML = convo.messages.map(m => `<div class="msg ${m.role}">${m.text}</div>`).join("");
  log.scrollTop = log.scrollHeight;
}

function getActiveConversation() {
  if (!S.conversations.length || isNewDay(S.conversations[S.conversations.length-1].date)) {
    S.conversations.push({ date: new Date().toISOString(), messages: [
      { role: "coach", text: `${greetingInfo().text} ${S.user.name}. Based on your goals, energy, calendar and recent conversations, here are three things that will move your life forward today.` }
    ]});
    save();
  }
  return S.conversations[S.conversations.length - 1];
}
function isNewDay(iso) {
  const d = new Date(iso), now = new Date();
  return d.toDateString() !== now.toDateString();
}

function bindCoachChat() {
  renderChatLog();
  const input = document.getElementById("chatInput");
  const send = document.getElementById("sendBtn");
  const mic = document.getElementById("micBtn");

  function sendMsg() {
    const text = input.value.trim();
    if (!text) return;
    const convo = getActiveConversation();
    convo.messages.push({ role: "user", text });
    save();
    renderChatLog();
    input.value = "";

    const log = document.getElementById("chatLog");
    const typingEl = document.createElement("div");
    typingEl.className = "msg typing";
    typingEl.innerHTML = '<i data-lucide="loader-2" class="spin"></i> thinking…';
    log.appendChild(typingEl);
    log.scrollTop = log.scrollHeight;
    icons();

    setTimeout(() => {
      const replies = coachEngine.respond(text);
      convo.messages.push(...replies);
      save();
      renderChatLog();
    }, 600);
  }
  send.onclick = sendMsg;
  input.onkeydown = (e) => { if (e.key === "Enter") sendMsg(); };
  mic.onclick = () => {
    input.placeholder = "Listening... (voice demo — type instead)";
    setTimeout(() => input.placeholder = "Type a message...", 1600);
  };
  document.querySelectorAll("#personalityRow .pill").forEach(p => {
    p.onclick = () => { S.coachPersonality = p.dataset.p; save(); render(); };
  });
}

function bindHomeExtras() {
  document.querySelectorAll("[data-focus-i]").forEach(cb => {
    cb.onchange = () => {
      const i = +cb.dataset.focusI;
      const checks = ensureTodayChecks(3);
      checks[i] = cb.checked;
      save();
      render();
    };
  });
  const resetBtn = document.getElementById("resetFocusBtn");
  if (resetBtn) resetBtn.onclick = () => {
    const checks = ensureTodayChecks(3);
    for (let i=0;i<checks.length;i++) checks[i] = false;
    save();
    render();
  };
  document.querySelectorAll(".mood-btn").forEach(btn => {
    btn.onclick = () => {
      const k = btn.dataset.mood;
      S.mood.today = k;
      S.mood.history.push({ date: new Date().toISOString(), mood: k });
      save();
      render();
    };
  });
}

/* ---------- LIFE WHEEL ---------- */
function renderWheel() {
  const rows = LIFE_WHEEL_AREAS.map(area => {
    const w = S.lifeWheel[area];
    const prev = w.history.length > 1 ? w.history[w.history.length-2].score : w.score;
    const trend = w.score > prev ? "▲" : w.score < prev ? "▼" : "•";
    return `
      <div class="wheel-item">
        <div class="label">${area}</div>
        <div class="bar-track"><div class="bar-fill" style="width:${w.score*10}%"></div></div>
        <div class="val">${w.score} ${trend}</div>
      </div>`;
  }).join("");
  return `
    <h1><i data-lucide="heart"></i> Life Wheel</h1>
    <p>Automatically updated from your conversations. Strongest: <b>${highestArea()}</b> · Focus area: <b>${lowestArea()}</b></p>
    <div class="card wheel-list">${rows}</div>
    <p class="subtle">Scores shift as you talk to your coach — no forms to fill in.</p>
  `;
}

/* ---------- GOALS / 12 WEEK YEAR ---------- */
function renderGoals() {
  if (!S.goals.length) {
    return `
      <h1><i data-lucide="target"></i> 12 Week Year</h1>
      <div class="card">
        <p>You don't have an active goal yet. Tell your coach something like <i>"I want a promotion"</i> and I'll build the full plan automatically — vision, 12 week goal, milestones, daily actions, confidence work and reflection prompts.</p>
        <button class="btn-primary" onclick="go('coach')"><i data-lucide="message-circle"></i> Talk to your Coach</button>
      </div>`;
  }
  const g = S.goals[S.goals.length - 1];
  const done = g.milestones.filter(m => m.done).length;
  g.winRate = Math.round((done / g.milestones.length) * 100);
  return `
    <h1><i data-lucide="target"></i> 12 Week Year</h1>
    <div class="card">
      <h3>Career Vision</h3>
      <p>${g.vision}</p>
      <div class="flow-connector"><div class="line"></div></div>
      <h3>12 Week Goal</h3>
      <p>${g.title}</p>
      <div class="flow-connector"><div class="line"></div></div>
      <h3>Weekly Milestones · Win rate ${g.winRate}%</h3>
      ${g.milestones.map((m,i) => checkItem(`data-i="${i}"`, m.done, m.text)).join("")}
      ${g.winRate === 100 ? sealRow("12 Week Goal complete.") : ""}
      <div class="flow-connector"><div class="line"></div></div>
      <h3>Daily Actions</h3>
      <div class="tag-row">${g.dailyActions.map(a=>`<span class="tag">${a}</span>`).join("")}</div>
      <h3>Confidence Exercises</h3>
      <div class="tag-row">${g.confidenceExercises.map(a=>`<span class="tag">${a}</span>`).join("")}</div>
      <h3>Reflection Prompts</h3>
      ${g.reflectionPrompts.map(r=>`<p>${r}</p>`).join("")}
    </div>
  `;
}

/* ---------- AREAS HUB ---------- */
function renderAreasHub() {
  return `
    <h1><i data-lucide="briefcase"></i> Areas</h1>
    <p>Everything the coach builds and maintains for you, in one place.</p>
    <div class="area-grid">
      ${AREA_TILES.map(t => `
        <div class="area-tile" onclick="go('${t.v}')">
          <span class="chevron"><i data-lucide="chevron-right"></i></span>
          <span class="ic"><i data-lucide="${t.icon}"></i></span>
          <div class="name">${t.name}</div>
        </div>`).join("")}
    </div>
  `;
}

/* ---------- CONFIDENCE STUDIO ---------- */
function renderConfidenceStudio() {
  const c = S.confidence;
  const exercises = [
    {icon:"target", t:"Daily challenge", d:"Speak first in one meeting or conversation today."},
    {icon:"quote", t:"Affirmation", d:"\"My voice is worth hearing, even before it feels comfortable.\""},
    {icon:"repeat", t:"Reframe", d:"\"I'm over-explaining\" → \"I'm being thorough — I can trust I've said enough.\""},
    {icon:"eye", t:"Visualisation", d:"Picture yourself saying no without an apology attached."},
    {icon:"pencil-line", t:"Journal prompt", d:"Where did I shrink myself today, and why?"},
    {icon:"flame", t:"Mini exposure exercise", d:"Send one message today without an 'I'm sorry but...' opener."},
  ];
  return `
    ${backButton('areas')}
    <h1>Confidence Studio</h1>
    <div class="card">
      <h3>Current confidence score</h3>
      <div class="bar-track" style="height:8px"><div class="bar-fill" style="width:${c.score}%"></div></div>
      <p class="subtle" style="margin-top:8px">${c.score}/100 · based on recent conversations</p>
    </div>
    <div class="card">
      <h3>Pattern noticed</h3>
      <p style="margin-bottom:0">You tend to soften your point with an apology before making it. This week's set is built to work on it.</p>
    </div>
    ${listCard(exercises)}
  `;
}

/* ---------- WEALTH ---------- */
function renderWealth() {
  const w = S.wealth;
  return `
    ${backButton('areas')}
    <h1>Wealth</h1>
    <div class="card">
      <div class="field-row"><h3 style="margin:0">Savings goal</h3><button class="edit-btn" data-edit="savingsGoal" title="Edit"><i data-lucide="pencil"></i></button></div>
      <p>£${w.savingsGoal.toLocaleString()}</p>
      <div class="field-row"><h3 style="margin:0">Salary goal</h3><button class="edit-btn" data-edit="salaryGoal" title="Edit"><i data-lucide="pencil"></i></button></div>
      <p>£${w.salaryGoal.toLocaleString()}</p>
      <h3>Net worth</h3>
      <p>${w.netWorthNote}</p>
      <h3>Financial confidence</h3>
      <div class="bar-track" style="height:8px"><div class="bar-fill" style="width:${w.financialConfidence}%"></div></div>
    </div>
    <div class="card">
      <h3>Money beliefs surfaced in conversation</h3>
      ${w.beliefs.length ? w.beliefs.map(b=>`<p>"${b}"</p>`).join("") : `<p class="subtle" style="margin-bottom:0">None yet — these appear as you talk to your coach about money.</p>`}
    </div>
  `;
}

/* ---------- RELATIONSHIPS ---------- */
function renderRelationships() {
  const items = [
    {icon:"message-square", t:"Communication", d:"Try naming the feeling before the fact: \"I felt dismissed when...\" rather than leading with the complaint."},
    {icon:"shield", t:"Conflict coaching", d:"Pause for 20 minutes before responding when you feel reactive — then return to the conversation."},
    {icon:"heart", t:"Date ideas", d:"Something novel beats something nice — try an activity neither of you has done before."},
    {icon:"gift", t:"Love language reminder", d:"Notice what makes you feel loved this week, and name it out loud once."},
    {icon:"octagon", t:"Boundaries", d:"One boundary to practise: saying \"let me check and get back to you\" instead of an instant yes."},
    {icon:"users", t:"Friendships", d:"Reach out to one friend you've been meaning to message."},
    {icon:"home", t:"Family", d:"Notice one recurring family dynamic you'd like to shift, gently."},
  ];
  return `
    ${backButton('areas')}
    <h1>Relationships</h1>
    ${listCard(items)}
  `;
}

/* ---------- HEALTH ---------- */
function renderHealth() {
  const home = externalData.bodyAtelier && externalData.bodyAtelier.home;

  const rows = [
    {k:"Sleep", v: home && home.sleepHours != null ? `${home.sleepHours}h · ${home.sleepQuality ?? "—"}` : "Not yet connected"},
    {k:"Movement", v:"Not yet connected"},
    {k:"Food", v:"Not yet connected"},
    {k:"Stress", v:S.confidence.score < 50 ? "Elevated" : "Moderate"},
    {k:"Recovery", v: home && home.recovery ? home.recovery : "Not yet connected"},
    {k:"Hormones", v: home && home.cycleDay != null ? `Cycle day ${home.cycleDay}` : "Not yet connected"},
    {k:"Hydration", v: home ? `${home.hydrationGlasses ?? 0}/${home.hydrationGoal ?? 8} glasses` : "Not yet connected"},
    {k:"Energy", v: home && home.energyLevel != null ? `${home.energyLevel}/10` : (S.mood.today || "Unknown")},
  ];

  let bodyAtelierBlock = "";
  if (home) {
    const recIconMap = { movement:"dumbbell", nutrition:"leaf", focus:"target", recovery:"heart-pulse" };
    const recs = (home.recommendations || []).map(r => ({ icon: recIconMap[r.icon] || "sparkle", t: r.text, d: "" }));

    bodyAtelierBlock = `
      <h3 style="margin-top:22px">From Body Atelier</h3>
      ${progressRing(home.bodyBattery ?? 0, "heart-pulse", "Body Battery", `Recovery: ${home.recovery ?? "—"}`)}
      <div class="stat-row">
        ${statCard("brain", "ADHD focus", home.adhdFocus ?? "—")}
        ${statCard("heart-pulse", "Fibro", home.fibroSymptoms ?? "—")}
        ${statCard("trending-up", "Energy", home.energyLevel != null ? `${home.energyLevel}/10` : "—")}
      </div>
      <div class="rating-row">
        <div class="rating-card"><div class="lbl">Pain</div>${starRow(home.pain ?? 0, "pink")}</div>
        <div class="rating-card"><div class="lbl">Mood</div>${starRow(home.mood ?? 0, "green")}</div>
      </div>
      ${home.todaysFocus ? `
      <div class="card">
        <div class="list-row">
          <span class="ic"><i data-lucide="target"></i></span>
          <div class="body"><h3>Today's focus</h3><p>${home.todaysFocus}</p></div>
        </div>
      </div>` : ""}
      ${recs.length ? listCard(recs) : ""}
    `;
  }

  return `
    ${backButton('areas')}
    <h1>Health</h1>
    ${home ? "" : `<p>Connect Apple Health &amp; Body Atelier to populate these automatically.</p>`}
    <div class="card wheel-list">
      ${rows.map(r => `<div class="wheel-item"><div class="label">${r.k}</div><div class="val" style="width:auto;text-align:left;color:var(--muted)">${r.v}</div></div>`).join("")}
    </div>
    ${bodyAtelierBlock}
  `;
}

/* ---------- HOME (HOUSE) AREA ---------- */
function renderHouseArea() {
  const env = S.lifeWheel.Environment.score;
  const items = [
    {icon:"box", t:"Declutter Challenge", d:"Clear one surface completely for 10 minutes today."},
    {icon:"sparkle", t:"Cleaning Reset", d:"Pick the one room that affects your mood most and reset it."},
    {icon:"layout-grid", t:"Organisation Plan", d:"Choose one drawer or cupboard to fully sort this week."},
  ];

  const hoh = externalData.houseOfHarriet;
  let houseCard;
  if (hoh) {
    const homeScore = hoh.lifeAreas && typeof hoh.lifeAreas.Home === "number" ? hoh.lifeAreas.Home : null;
    const pendingCount = (list) => Array.isArray(list) ? list.filter(i => !i.done).length : 0;
    const laundryPending = pendingCount(hoh.homeHQLists && hoh.homeHQLists.laundry);
    const shoppingPending = pendingCount(hoh.homeHQLists && hoh.homeHQLists["shopping-list"]);
    const lastReset = hoh.ritualsDone && hoh.ritualsDone["thirty-minute-reset"];
    const shutdown = hoh.shutdownChecklist || {};
    const shutdownDone = ["phoneAway","surfacesReset","tomorrowLaidOut"].filter(k => shutdown[k]).length;

    houseCard = `
      <div class="card">
        <h3>From House of Harriet</h3>
        ${homeScore !== null ? `
          <div class="bar-track" style="height:8px"><div class="bar-fill" style="width:${homeScore*10}%"></div></div>
          <p class="subtle" style="margin-top:8px;margin-bottom:14px">Home score: ${homeScore}/10</p>
        ` : ""}
        <div class="stat-row">
          <div class="stat-card"><span class="ic"><i data-lucide="clipboard-list"></i></span><div class="lbl">Laundry</div><div class="val">${laundryPending} left</div></div>
          <div class="stat-card"><span class="ic"><i data-lucide="clipboard-list"></i></span><div class="lbl">Shopping</div><div class="val">${shoppingPending} left</div></div>
          <div class="stat-card"><span class="ic"><i data-lucide="badge-check"></i></span><div class="lbl">Shutdown</div><div class="val">${shutdownDone}/3</div></div>
        </div>
        <div class="list-row">
          <span class="ic"><i data-lucide="calendar-check"></i></span>
          <div class="body"><h3>Last 30-minute reset</h3><p>${lastReset ? fmtDate(lastReset) : "Not done yet"}</p></div>
        </div>
      </div>
    `;
  } else {
    houseCard = `<p class="subtle">Links into House of Harriet once connected.</p>`;
  }

  return `
    ${backButton('areas')}
    <h1>Home</h1>
    <div class="card">
      <h3>Environment score</h3>
      <div class="bar-track" style="height:8px"><div class="bar-fill" style="width:${env*10}%"></div></div>
      <p class="subtle" style="margin-top:8px;margin-bottom:0">${env < 6 ? "Your environment score has dropped." : "Your space is in good shape."}</p>
    </div>
    ${listCard(items)}
    ${houseCard}
  `;
}

/* ---------- IDENTITY ---------- */
function renderIdentity() {
  const entries = Object.entries(S.identity).sort((a,b)=>a[1]-b[1]);
  const weakest = entries[0][0];
  return `
    ${backButton('areas')}
    <h1>Identity Layers</h1>
    <div class="card">
      <p style="margin-bottom:0">You seem most disconnected from your <b>${weakest}</b> right now. Consider one small action this week that reconnects you to it.</p>
    </div>
    <div class="card wheel-list">
      ${entries.map(([name,val]) => `
        <div class="wheel-item">
          <div class="label">${name}</div>
          <div class="bar-track"><div class="bar-fill" style="width:${val}%"></div></div>
          <div class="val">${val}</div>
        </div>`).join("")}
    </div>
  `;
}

/* ---------- TIMELINE ---------- */
function renderTimeline() {
  const items = [...S.timeline].sort((a,b)=> new Date(a.date) - new Date(b.date));
  return `
    ${backButton('areas')}
    <h1>Life Timeline</h1>
    <div class="timeline">
      ${items.map(i => `
        <div class="timeline-item">
          <div>
            <div class="date">${fmtDate(i.date)}</div>
            <div class="title">${i.title}</div>
          </div>
          <button class="del-btn" data-del="${i.id}" title="Delete"><i data-lucide="trash-2"></i></button>
        </div>`).join("")}
    </div>
    <button class="btn-secondary" id="addTimelineBtn"><i data-lucide="plus"></i> Add a milestone</button>
  `;
}

/* ---------- WEEKLY REVIEW ---------- */
const WEEKLY_QUESTIONS = [
  "How did this week feel, overall?",
  "What was your biggest win?",
  "What was your biggest challenge?",
  "Energy this week, out of 10?",
  "Confidence this week, out of 10?",
  "Is anything worrying you going into next week?",
];

function renderWeeklyReview() {
  return `
    ${backButton('areas')}
    <h1>Weekly Coaching Session</h1>
    <div class="card" id="weeklyCard">
      <p>Let's reflect on the week, one question at a time.</p>
      <div id="weeklyQuestion"></div>
      <textarea class="journal-input" id="weeklyAnswer" placeholder="Type your answer..."></textarea>
      <button class="btn-primary" id="weeklyNext">Next <i data-lucide="chevron-right"></i></button>
    </div>
    <div id="weeklyResult"></div>
    <div class="card">
      <h3>Past reviews</h3>
      ${S.weeklyReviews.length ? S.weeklyReviews.slice().reverse().map(r => `<p style="margin-bottom:4px">${fmtDate(r.date)} — energy ${r.energy}/10, confidence ${r.confidence}/10</p>`).join("") : `<p class="subtle" style="margin-bottom:0">No reviews yet.</p>`}
    </div>
  `;
}

/* ---------- LIFE AUDIT ---------- */
function renderLifeAudit() {
  return `
    ${backButton('areas')}
    <h1>Life Audit</h1>
    <div class="card">
      <p>Get a snapshot of where you stand right now — strongest area, biggest bottleneck, and the highest-impact moves for the next two weeks.</p>
      <button class="btn-primary" id="runAuditBtn"><i data-lucide="wand-2"></i> Audit my life</button>
    </div>
    <div id="auditResult">${S.lastAudit ? renderAuditReport(S.lastAudit) : ""}</div>
  `;
}

function renderAuditReport(a) {
  return `
    <div class="card">
      ${sealRow("Audit complete")}
      <h3>Strongest area</h3><p>${a.strongest}</p>
      <h3>Most limiting area</h3><p>${a.limiting}</p>
      <h3>Three high-impact actions (next 2 weeks)</h3>
      ${a.actions.map(x=>`<p>${x}</p>`).join("")}
      <h3>What's changed since last audit</h3><p>${a.changeNote}</p>
      <h3>Alignment check</h3><p>${a.alignment}</p>
      <p class="subtle" style="margin-bottom:0">Generated ${fmtDate(a.date)}</p>
    </div>
  `;
}

const AUDIT_ACTIONS = {
  Career: ["Have one visibility-building conversation with your manager", "Document a recent win in concrete terms", "Say yes to one stretch task"],
  Relationships: ["Schedule uninterrupted time with someone who matters", "Have the honest conversation you've been avoiding", "Say thank you specifically, not generically"],
  Health: ["Protect one earlier bedtime this week", "Add one short walk daily", "Reduce one stimulant/habit that spikes stress"],
  Money: ["Review your last month of spending honestly", "Set one automatic transfer toward savings", "Name one money belief out loud"],
  Mindset: ["Catch and reframe one negative thought pattern", "Write one page of unfiltered journaling", "Practise one boundary this week"],
  Purpose: ["Revisit why your current goal matters to you", "Block time for the work that actually matters", "Say no to one thing that doesn't align"],
  Home: ["Reset the one room that affects your mood most", "Clear a single recurring clutter zone", "Fix one small thing that's been bothering you"],
  Fun: ["Schedule one thing purely for enjoyment", "Say yes to a spontaneous plan", "Revisit a hobby you've dropped"],
  Spirituality: ["Take 10 minutes of quiet reflection", "Reconnect with a practice that grounds you", "Spend time in nature"],
  Learning: ["Start the course or book you've been meaning to", "Teach someone something you know", "Ask one curious question daily"],
  Environment: ["Declutter one surface fully", "Fix your lighting or workspace setup", "Do a 15-minute reset each evening"],
  Adventure: ["Plan one new experience this month", "Take a different route or try a new place", "Say yes to something slightly outside your comfort zone"],
};

function runLifeAudit() {
  const strongest = highestArea();
  const limiting = lowestArea();
  const prev = S.lastAudit;
  let changeNote = "This is your first audit — future ones will show what's shifted.";
  if (prev) {
    const deltas = LIFE_WHEEL_AREAS.map(a => ({ a, d: S.lifeWheel[a].score - (prev.snapshot[a] ?? S.lifeWheel[a].score) }))
      .filter(x => x.d !== 0).sort((x,y)=>Math.abs(y.d)-Math.abs(x.d));
    changeNote = deltas.length
      ? deltas.slice(0,2).map(x => `${x.a} ${x.d>0?'improved':'dropped'} (${x.d>0?'+':''}${x.d})`).join(", ")
      : "Fairly stable since your last audit.";
  }
  const audit = {
    date: new Date().toISOString(),
    strongest: `${strongest} (${S.lifeWheel[strongest].score}/10) — this is carrying real momentum right now.`,
    limiting: `${limiting} (${S.lifeWheel[limiting].score}/10) — this is the area quietly holding everything else back.`,
    actions: AUDIT_ACTIONS[limiting] || AUDIT_ACTIONS.Mindset,
    changeNote,
    alignment: S.goals.length ? `Your current actions are broadly aligned with "${S.goals[S.goals.length-1].title}" — keep the daily actions consistent.` : "You don't have an active 12 Week goal yet — consider setting one so daily effort compounds toward something specific.",
    snapshot: Object.fromEntries(LIFE_WHEEL_AREAS.map(a => [a, S.lifeWheel[a].score])),
  };
  S.lastAudit = audit;
  save();
  return audit;
}

/* ---------- SETTINGS ---------- */
function renderSettings() {
  const integrations = [
    {icon:"sparkles", t:"Body Atelier", d:"Not connected"},
    {icon:"home", t:"House of Harriet", d:"Not connected"},
    {icon:"calendar", t:"Calendar", d:"Not connected"},
    {icon:"heart-pulse", t:"Apple Health", d:"Not connected"},
    {icon:"book-open", t:"Journal", d:"Using in-app journal"},
  ];
  return `
    ${backButton('areas')}
    <h1>Coach &amp; Settings</h1>
    <div class="card">
      <h3>Coach personality</h3>
      <div class="pill-row">
        ${PERSONALITIES.map(p => `<span class="pill ${S.coachPersonality===p.id?'selected':''}" data-p="${p.id}"><i data-lucide="${p.icon}"></i>${p.label}</span>`).join("")}
      </div>
    </div>
    <div class="settings-list">${listCard(integrations)}</div>
    <div class="card">
      <h3>Reset app data</h3>
      <button class="btn-secondary btn-danger" id="resetBtn">Clear all Compass data</button>
    </div>
  `;
}

/* ---------- INSIGHTS ---------- */
const CANNED_INSIGHTS = [
  "You tend to lose motivation around Week 6 of every goal — plan a lighter week there on purpose.",
  "Your confidence tends to rise after you've moved your body.",
  "Stress shows up most after three consecutive meetings — try protecting a buffer.",
  "You sleep better after evening walks, based on your own notes.",
  "Your happiest stretches tend to include creative time — even a little.",
];
const LOW_ENERGY_MOODS = ["tired","stressed","overwhelmed","numb"];

function renderInsights() {
  const moodCounts = S.mood.history.reduce((acc,m)=>{acc[m.mood]=(acc[m.mood]||0)+1; return acc;}, {});
  const topMood = Object.entries(moodCounts).sort((a,b)=>b[1]-a[1])[0];
  const dynamic = topMood ? `Most of your check-ins recently have been "${topMood[0]}" — ${LOW_ENERGY_MOODS.includes(topMood[0]) ? "worth naming what's driving that." : "good signal to build on."}` : "Check in with your mood a few times and I'll start noticing patterns here.";
  const list = [dynamic, ...CANNED_INSIGHTS];
  return `
    <h1><i data-lucide="sparkles"></i> Insights</h1>
    <p>Stories, not charts — the patterns that actually change what you do.</p>
    ${list.map(i => `<div class="insight-card"><div class="quote">"${i}"</div></div>`).join("")}
  `;
}

/* ================= EVENT BINDING PER VIEW ================= */
function bindView(view) {
  if (view === "home") bindHomeExtras();
  if (view === "coach") bindCoachChat();

  if (view === "goals" && S.goals.length) {
    document.querySelectorAll('[data-i]').forEach(cb => {
      cb.onchange = () => {
        const g = S.goals[S.goals.length-1];
        g.milestones[+cb.dataset.i].done = cb.checked;
        save();
        render();
      };
    });
  }

  if (view === "wealth") {
    document.querySelectorAll("[data-edit]").forEach(btn => {
      btn.onclick = () => {
        const field = btn.dataset.edit;
        const current = S.wealth[field];
        const next = prompt("New value (£)", current);
        if (next !== null && !isNaN(parseFloat(next))) {
          S.wealth[field] = Math.round(parseFloat(next));
          save();
          render();
        }
      };
    });
  }

  if (view === "settings") {
    document.querySelectorAll(".pill").forEach(p => {
      p.onclick = () => { S.coachPersonality = p.dataset.p; save(); render(); };
    });
    const resetBtn = document.getElementById("resetBtn");
    if (resetBtn) resetBtn.onclick = () => {
      if (confirm("This clears all Compass data on this device. Continue?")) {
        localStorage.removeItem(STORAGE_KEY);
        S = defaultState();
        save();
        go("home");
      }
    };
  }

  if (view === "timelineView") {
    const btn = document.getElementById("addTimelineBtn");
    if (btn) btn.onclick = () => {
      const title = prompt("What milestone would you like to add?");
      if (title) { addTimeline(title); save(); render(); }
    };
    document.querySelectorAll("[data-del]").forEach(del => {
      del.onclick = () => {
        S.timeline = S.timeline.filter(t => t.id !== del.dataset.del);
        save();
        render();
      };
    });
  }

  if (view === "lifeAudit") {
    const btn = document.getElementById("runAuditBtn");
    if (btn) btn.onclick = () => {
      btn.innerHTML = '<i data-lucide="loader-2" class="spin"></i> Auditing...';
      icons();
      setTimeout(() => {
        const a = runLifeAudit();
        document.getElementById("auditResult").innerHTML = renderAuditReport(a);
        icons();
      }, 500);
    };
  }

  if (view === "weeklyReview") bindWeeklyReview();
}

function bindWeeklyReview() {
  let idx = 0;
  const answers = [];
  const qEl = document.getElementById("weeklyQuestion");
  const aEl = document.getElementById("weeklyAnswer");
  const nextBtn = document.getElementById("weeklyNext");
  function showQ() { qEl.innerHTML = `<h3>${WEEKLY_QUESTIONS[idx]}</h3>`; aEl.value = ""; aEl.focus(); }
  showQ();
  nextBtn.onclick = () => {
    answers.push(aEl.value.trim());
    idx++;
    if (idx < WEEKLY_QUESTIONS.length) {
      showQ();
    } else {
      const energy = clamp(parseInt(answers[3]) || 6, 0, 10);
      const confidence = clamp(parseInt(answers[4]) || 6, 0, 10);
      const review = {
        date: new Date().toISOString(),
        answers, energy, confidence,
        priorities: [`Continue momentum on: ${answers[1] || "your recent win"}`, `Address: ${answers[2] || "this week's biggest challenge"}`],
        habits: ["One earlier night this week", "One check-in with your coach mid-week"],
        journalPrompts: ["What would make next week 10% better than this one?"],
      };
      S.weeklyReviews.push(review);
      bumpConfidence(confidence - 6);
      addTimeline("Completed weekly coaching session");
      save();
      document.getElementById("weeklyCard").innerHTML = sealRow("Thank you — that's logged.");
      document.getElementById("weeklyResult").innerHTML = `
        <div class="card">
          <h3>Next week's priorities</h3>${review.priorities.map(p=>`<p>${p}</p>`).join("")}
          <h3>Habits</h3>${review.habits.map(p=>`<p>${p}</p>`).join("")}
          <h3>Journaling prompts</h3>${review.journalPrompts.map(p=>`<p style="margin-bottom:0">${p}</p>`).join("")}
        </div>`;
      icons();
    }
  };
}

/* ================= EMERGENCY MODE ================= */
function openEmergency() {
  document.getElementById("emergencyOverlay").classList.remove("hidden");
  document.getElementById("emergencyContent").innerHTML = `
    <div class="card tight"><h3>Breathe</h3><p style="margin-bottom:0">In for 4, hold for 7, out for 8. Repeat four times.</p></div>
    <div class="card tight"><h3>Ground</h3><p style="margin-bottom:0">Name 5 things you can see, 4 you can touch, 3 you can hear, 2 you can smell, 1 you can taste.</p></div>
    <div class="card tight"><h3>Reframe</h3><p style="margin-bottom:0">This feeling is information, not a verdict. It will move if you let it.</p></div>
    <div class="card tight"><h3>One next action</h3><p style="margin-bottom:0">Do the smallest possible next thing — drink water, sit down, message one person.</p></div>
    <button class="btn-secondary" id="recoveryModeBtn">${S.recoveryMode ? "Recovery mode is ON" : "Turn on Recovery Mode for today"}</button>
  `;
  document.getElementById("recoveryModeBtn").onclick = () => {
    S.recoveryMode = true;
    S.mood.today = "overwhelmed";
    S.mood.history.push({ date: new Date().toISOString(), mood: "overwhelmed" });
    save();
    document.getElementById("recoveryModeBtn").textContent = "Recovery mode is ON";
  };
}

/* ================= NAV + INIT ================= */
document.querySelectorAll(".navbtn").forEach(btn => {
  btn.addEventListener("click", () => go(btn.dataset.view));
});
document.querySelector(".coach-pill-btn").addEventListener("click", () => go("coach"));
document.getElementById("closeEmergency").addEventListener("click", () => {
  document.getElementById("emergencyOverlay").classList.add("hidden");
});

render();
icons();
pullFromServer();
fetchHouseOfHarriet();
fetchBodyAtelier();

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("sw.js").catch(() => {});
  });
}
