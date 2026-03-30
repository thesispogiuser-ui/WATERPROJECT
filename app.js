// ============================================================
// LOGIN
// ============================================================
let ADMIN_USER = localStorage.getItem("htrack_user") || "admin";
let ADMIN_PASS = localStorage.getItem("htrack_pass") || "admin123";

function attemptLogin() {
  const user = document.getElementById("usernameInput").value.trim();
  const pass = document.getElementById("passwordInput").value;
  const errEl = document.getElementById("loginError");
  if (user === ADMIN_USER && pass === ADMIN_PASS) {
    errEl.classList.remove("visible");
    const overlay = document.getElementById("loginOverlay");
    overlay.style.transition = "opacity 0.45s ease";
    overlay.style.opacity = "0";
    setTimeout(() => {
      overlay.style.display = "none";
      const app = document.getElementById("appShell");
      app.style.display = "flex";
      app.style.opacity = "0";
      app.style.transition = "opacity 0.35s ease";
      setTimeout(() => { app.style.opacity = "1"; }, 20);
      initCharts();
    }, 430);
  } else {
    errEl.classList.add("visible");
    const card = document.querySelector(".login-card");
    card.style.transition = "none";
    card.style.transform = "translateX(-8px)";
    setTimeout(() => {
      card.style.transition = "transform 0.35s cubic-bezier(0.36,0.07,0.19,0.97)";
      card.style.transform = "translateX(0)";
    }, 10);
    document.getElementById("passwordInput").value = "";
    document.getElementById("passwordInput").focus();
  }
}

function togglePassword() {
  const input = document.getElementById("passwordInput");
  input.type = input.type === "password" ? "text" : "password";
}

function logout() {
  document.getElementById("appShell").style.display = "none";
  const overlay = document.getElementById("loginOverlay");
  overlay.style.opacity = "0";
  overlay.style.display = "flex";
  setTimeout(() => {
    overlay.style.transition = "opacity 0.35s ease";
    overlay.style.opacity = "1";
  }, 10);
  document.getElementById("usernameInput").value = "";
  document.getElementById("passwordInput").value = "";
  document.getElementById("loginError").classList.remove("visible");
  chartsInitialized = false;
}

// ============================================================
// ANIMATED WATER BACKGROUND
// ============================================================
(function initWaterCanvas() {
  const canvas = document.getElementById("waterCanvas");
  const ctx = canvas.getContext("2d");
  let W, H, waves;

  function resize() { W = canvas.width = window.innerWidth; H = canvas.height = window.innerHeight; }

  function makeWaves() {
    waves = [
      { y:0.72, amp:28, freq:0.012, speed:0.018, color:"rgba(0,150,255,0.07)", phase:0 },
      { y:0.78, amp:22, freq:0.016, speed:0.024, color:"rgba(0,100,200,0.06)", phase:1.5 },
      { y:0.83, amp:18, freq:0.020, speed:0.030, color:"rgba(0,60,160,0.07)",  phase:3.0 },
      { y:0.88, amp:14, freq:0.026, speed:0.038, color:"rgba(0,195,255,0.04)", phase:4.5 },
    ];
  }

  const particles = Array.from({ length: 28 }, () => ({
    x: Math.random() * window.innerWidth,
    y: Math.random() * window.innerHeight,
    r: Math.random() * 2.5 + 0.8,
    vy: 0.3 + Math.random() * 0.5,
    alpha: Math.random() * 0.35 + 0.08
  }));

  function drawFrame() {
    ctx.clearRect(0, 0, W, H);
    const isDark = document.documentElement.getAttribute("data-theme") !== "light";
    waves.forEach(w => {
      w.phase += w.speed;
      const baseY = H * w.y;
      ctx.beginPath(); ctx.moveTo(0, H);
      for (let x = 0; x <= W; x += 3) {
        const y = baseY + Math.sin(x * w.freq + w.phase) * w.amp
                        + Math.sin(x * w.freq * 0.5 + w.phase * 0.7) * (w.amp * 0.4);
        ctx.lineTo(x, y);
      }
      ctx.lineTo(W, H); ctx.closePath();
      let c = w.color;
      if (!isDark) c = c.replace(/[\d.]+\)$/, "0.10)");
      ctx.fillStyle = c; ctx.fill();
    });
    particles.forEach(p => {
      p.y -= p.vy; p.x += Math.sin(p.y * 0.02) * 0.4; p.alpha -= 0.002;
      if (p.y < H * 0.1 || p.alpha <= 0) {
        p.y = H * (0.7 + Math.random() * 0.25);
        p.x = Math.random() * W;
        p.alpha = 0.25 + Math.random() * 0.28;
      }
      ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = isDark ? `rgba(0,195,255,${p.alpha})` : `rgba(0,90,200,${p.alpha * 0.45})`;
      ctx.fill();
    });
    requestAnimationFrame(drawFrame);
  }

  resize(); makeWaves();
  window.addEventListener("resize", () => { resize(); makeWaves(); });
  drawFrame();
})();

// ============================================================
// THEME
// ============================================================
let isDark = true;

function toggleTheme() {
  isDark = !isDark;
  document.documentElement.setAttribute("data-theme", isDark ? "dark" : "light");
  document.getElementById("iconMoon").style.display = isDark ? "block" : "none";
  document.getElementById("iconSun").style.display  = isDark ? "none"  : "block";
  document.getElementById("themeBtn").title = isDark ? "Switch to Light Mode" : "Switch to Dark Mode";
  if (chartsInitialized) updateGaugeDisplay(currentTDS, currentTurbidity);
}

// ============================================================
// SOUND
// ============================================================
let soundEnabled = true;
const alertAudio = new Audio("alert.mp3");
alertAudio.preload = "auto";

function playAlertSound(type) {
  if (!soundEnabled) return;
  try {
    alertAudio.pause();
    alertAudio.currentTime = 0;
    alertAudio.volume = type === "critical" ? 1.0 : 0.5;
    alertAudio.play().catch(() => {});
  } catch(e) {}
}

function toggleSound() {
  soundEnabled = !soundEnabled;
  document.getElementById("soundIconOn").style.display  = soundEnabled ? "block" : "none";
  document.getElementById("soundIconOff").style.display = soundEnabled ? "none"  : "block";
  const btn = document.getElementById("soundBtn");
  btn.classList.toggle("muted", !soundEnabled);
  btn.title = soundEnabled ? "Sound Alerts: ON" : "Sound Alerts: OFF";
}

// ============================================================
// ALERT NOTIF TOGGLE
// ============================================================
let alertNotifEnabled = true;

function toggleAlertNotif() {
  alertNotifEnabled = !alertNotifEnabled;
  const btn    = document.getElementById("alertNotifBtn");
  const iconOn = document.getElementById("alertNotifIconOn");
  const iconOff= document.getElementById("alertNotifIconOff");
  iconOn.style.display  = alertNotifEnabled ? "block" : "none";
  iconOff.style.display = alertNotifEnabled ? "none"  : "block";
  btn.classList.toggle("active",  alertNotifEnabled);
  btn.classList.toggle("muted",  !alertNotifEnabled);
  btn.title = alertNotifEnabled ? "Alert Notifications: ON" : "Alert Notifications: OFF";
  if (!alertNotifEnabled) {
    document.getElementById("alertBanner").style.display = "none";
    lastAlertType = null;
  }
}

// ============================================================
// ANALYSIS CARD TOGGLE
// ============================================================
let analysisExpanded = true;

function toggleAnalysis() {
  analysisExpanded = !analysisExpanded;
  const body  = document.getElementById("analysisBody");
  const btn   = document.getElementById("analysisExpandBtn");
  const label = document.getElementById("expandLabel");
  if (analysisExpanded) {
    body.classList.remove("collapsed");
    btn.classList.add("expanded");
    label.innerText = "Collapse";
  } else {
    body.classList.add("collapsed");
    btn.classList.remove("expanded");
    label.innerText = "Expand";
  }
}

// Set expanded by default on load
document.addEventListener("DOMContentLoaded", () => {
  const btn = document.getElementById("analysisExpandBtn");
  if (btn) { btn.classList.add("expanded"); }
  const label = document.getElementById("expandLabel");
  if (label) label.innerText = "Collapse";
});

function updateSnapshot(tds, turbidity) {
  const snapTDS    = document.getElementById("snapTDS");
  const snapTurb   = document.getElementById("snapTurb");
  const snapTDSSt  = document.getElementById("snapTDSStatus");
  const snapTurbSt = document.getElementById("snapTurbStatus");
  const snapOv     = document.getElementById("snapOverall");
  const snapOvSub  = document.getElementById("snapOverallSub");
  if (!snapTDS) return;

  snapTDS.innerText  = tds + " ppm";
  snapTurb.innerText = turbidity + " %";

  let tdsColor, tdsLabel;
  if      (tds >= 500) { tdsColor="#ff2222"; tdsLabel="Unsafe"; }
  else if (tds >= 400) { tdsColor="#ff6600"; tdsLabel="Very High"; }
  else if (tds >= 300) { tdsColor="#ffcc00"; tdsLabel="High"; }
  else if (tds >= 200) { tdsColor="#aa44cc"; tdsLabel="Marginal"; }
  else if (tds >= 100) { tdsColor="#3355cc"; tdsLabel="Hard Water"; }
  else if (tds >= 50)  { tdsColor="#0088cc"; tdsLabel="Good"; }
  else                 { tdsColor="#00ccee"; tdsLabel="Ideal"; }
  snapTDS.style.color   = tdsColor;
  snapTDSSt.innerText   = tdsLabel;
  snapTDSSt.style.color = tdsColor;

  let turbColor, turbLabel;
  if      (turbidity < 25) { turbColor="#ff4d4d"; turbLabel="Critical Low"; }
  else if (turbidity > 75) { turbColor="#ffaa00"; turbLabel="High"; }
  else                     { turbColor="#33cc99"; turbLabel="Normal"; }
  snapTurb.style.color   = turbColor;
  snapTurbSt.innerText   = turbLabel;
  snapTurbSt.style.color = turbColor;

  const isCritical = tds >= 400 || turbidity < 25;
  const isWarning  = tds >= 200 || turbidity > 75;
  if (isCritical) { snapOv.innerText="CRITICAL"; snapOv.style.color="#ff4444"; snapOvSub.innerText="Immediate action required"; }
  else if (isWarning) { snapOv.innerText="WARNING"; snapOv.style.color="#ffaa00"; snapOvSub.innerText="Monitor closely"; }
  else { snapOv.innerText="NORMAL"; snapOv.style.color="#33cc99"; snapOvSub.innerText="All parameters safe"; }
}

// ============================================================
// MOBILE SIDEBAR
// ============================================================
function toggleMobileSidebar() {
  const sidebar  = document.querySelector(".sidebar");
  const backdrop = document.getElementById("sidebarBackdrop");
  sidebar.classList.toggle("open");
  backdrop.classList.toggle("visible");
}

function closeMobileSidebar() {
  document.querySelector(".sidebar").classList.remove("open");
  document.getElementById("sidebarBackdrop").classList.remove("visible");
}

// ============================================================
// NAVIGATION + RIPPLE ANIMATION
// ============================================================
function showView(name) {
  const current = document.querySelector(".view.active");
  const next    = document.getElementById("view-" + name);
  if (current === next) return;

  if (current) {
    current.classList.add("view-exit");
    setTimeout(() => current.classList.remove("active", "view-exit"), 170);
  }

  setTimeout(() => {
    document.querySelectorAll(".nav-item").forEach(n => n.classList.remove("active"));
    next.classList.add("active", "view-enter");
    setTimeout(() => next.classList.remove("view-enter"), 240);
    const navEl = document.getElementById("nav-" + name);
    if (navEl) navEl.classList.add("active");
    const titles = { charts:"Graph", recommendations:"Recommendations", settings:"Settings" };
    document.getElementById("pageTitle").innerText = titles[name] || name;
    closeMobileSidebar();
    if (name === "settings") {
      document.getElementById("set-current-user").innerText = ADMIN_USER;
      ["set-new-username","set-new-password","set-confirm-password","set-current-password"]
        .forEach(id => document.getElementById(id).value = "");
      clearSettingsMessages();
    }
  }, current ? 150 : 0);
}

// Nav ripple
document.querySelectorAll(".nav-item").forEach(item => {
  item.addEventListener("click", function(e) {
    const r    = document.createElement("span");
    r.className = "nav-ripple";
    const rect = this.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    r.style.cssText = `width:${size}px;height:${size}px;left:${e.clientX-rect.left-size/2}px;top:${e.clientY-rect.top-size/2}px;`;
    this.appendChild(r);
    setTimeout(() => r.remove(), 450);
  });
});

// ============================================================
// CLOCK
// ============================================================
function updateClock() {
  const el = document.getElementById("time");
  if (el) el.innerText = new Date().toLocaleString();
}
updateClock();
setInterval(updateClock, 1000);

// ============================================================
// GAUGE DRAWING
// ============================================================
let currentTDS       = 0;
let currentTurbidity = 0;
let chartsInitialized = false;

const TDS_MAX       = 500;
const TURBIDITY_MAX = 100;

function drawGauge(canvasId, value, maxVal, color, trackColor) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;
  const wrap = canvas.parentElement;
  const W = wrap.clientWidth  || 300;
  const H = Math.min(wrap.clientHeight || 200, 260);
  canvas.width  = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, W, H);

  const cx = W / 2;
  const cy = H - 24;
  const r  = Math.min(W * 0.44, H * 0.85);
  const startAngle = Math.PI;
  const endAngle   = 0;
  const valueAngle = startAngle + (value / maxVal) * Math.PI;
  const lw = Math.max(10, r * 0.13);

  // Track
  ctx.beginPath();
  ctx.arc(cx, cy, r, startAngle, endAngle, false);
  ctx.strokeStyle = trackColor;
  ctx.lineWidth   = lw;
  ctx.lineCap     = "round";
  ctx.stroke();

  // Fill
  if (value > 0) {
    ctx.beginPath();
    ctx.arc(cx, cy, r, startAngle, valueAngle, false);
    ctx.strokeStyle = color;
    ctx.lineWidth   = lw;
    ctx.lineCap     = "round";
    ctx.stroke();
  }
}

function updateGaugeDisplay(tds, turbidity) {
  const dark     = document.documentElement.getAttribute("data-theme") !== "light";
  const trackClr = dark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.07)";

  let tdsClr;
  if      (tds >= 500) tdsClr = "#ff2222";
  else if (tds >= 400) tdsClr = "#ff6600";
  else if (tds >= 300) tdsClr = "#ffcc00";
  else if (tds >= 200) tdsClr = "#aa44cc";
  else if (tds >= 100) tdsClr = "#3355cc";
  else if (tds >= 50)  tdsClr = "#0088cc";
  else                 tdsClr = "#00ccee";

  const turbClr = "#009e8e";

  drawGauge("tdsGauge",       tds,       TDS_MAX,       tdsClr,  trackClr);
  drawGauge("turbidityGauge", turbidity, TURBIDITY_MAX, turbClr, trackClr);

  document.getElementById("tdsValue").innerText       = tds;
  document.getElementById("turbidityValue").innerText = turbidity;

  const tdsEl  = document.getElementById("tdsStatus");
  const turbEl = document.getElementById("turbidityStatus");
  const tdsDot  = document.getElementById("tdsDot");
  const turbDot = document.getElementById("turbDot");

  if      (tds >= 500) { tdsEl.innerText = "US EPA Max Contamination Level";   tdsEl.style.color = "#ff2222"; tdsDot.style.background = "#ff2222"; }
  else if (tds >= 400) { tdsEl.innerText = "High Contamination — Tap/Springs"; tdsEl.style.color = "#ff6600"; tdsDot.style.background = "#ff6600"; }
  else if (tds >= 300) { tdsEl.innerText = "High TDS — Tap or Mineral Springs"; tdsEl.style.color = "#ffcc00"; tdsDot.style.background = "#ffcc00"; }
  else if (tds >= 200) { tdsEl.innerText = "Marginally Acceptable";             tdsEl.style.color = "#aa44cc"; tdsDot.style.background = "#aa44cc"; }
  else if (tds >= 100) { tdsEl.innerText = "Hard Water";                        tdsEl.style.color = "#3355cc"; tdsDot.style.background = "#3355cc"; }
  else if (tds >= 50)  { tdsEl.innerText = "Carbon Filtration / Hard Water";    tdsEl.style.color = "#0088cc"; tdsDot.style.background = "#0088cc"; }
  else                 { tdsEl.innerText = "Ideal Drinking Water";               tdsEl.style.color = "#00ccee"; tdsDot.style.background = "#00ccee"; }

  if      (turbidity < 25) { turbEl.innerText = "Low Turbidity — Check Lines"; turbEl.style.color = "#ff4d4d"; turbDot.style.background = "#ff4d4d"; }
  else if (turbidity > 75) { turbEl.innerText = "High Turbidity";              turbEl.style.color = "#ffaa00"; turbDot.style.background = "#ffaa00"; }
  else                     { turbEl.innerText = "Normal";                       turbEl.style.color = "#33cc99"; turbDot.style.background = "#33cc99"; }

  updateSnapshot(tds, turbidity);
}

function initCharts() {
  if (chartsInitialized) return;
  chartsInitialized = true;
  currentTDS       = randomBetween(5, 100);
  currentTurbidity = randomBetween(25, 75);
  updateGaugeDisplay(currentTDS, currentTurbidity);
}

// ============================================================
// SIMULATION
// ============================================================
function randomBetween(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

let lastAlertType = null;

function updateSimulation() {
  if (!chartsInitialized) return;
  const newTDS       = randomBetween(0, 500);
  const newTurbidity = randomBetween(10, 95);
  const newTemp      = randomBetween(15, 35);
  currentTDS         = newTDS;
  currentTurbidity   = newTurbidity;
  updateGaugeDisplay(newTDS, newTurbidity);
  updateAIRecommendation(newTurbidity, newTDS, newTemp);
  checkAndAlert(newTurbidity, newTDS, newTemp);
  // Reset countdown
  countdownVal = 10;
}

setInterval(updateSimulation, 10000);

// ============================================================
// COUNTDOWN + PROGRESS BAR
// ============================================================
let countdownVal = 10;

function tickCountdown() {
  countdownVal--;
  if (countdownVal < 0) countdownVal = 0;
  const el = document.getElementById("updateCountdown");
  if (el) el.innerText = countdownVal + "s";
  const pct = ((10 - countdownVal) / 10) * 100;
  const p1 = document.getElementById("tdsProgress");
  const p2 = document.getElementById("turbProgress");
  if (p1) p1.style.width = (100 - pct) + "%";
  if (p2) p2.style.width = (100 - pct) + "%";
}
setInterval(tickCountdown, 1000);

// ============================================================
// ALERT BANNER
// ============================================================
function checkAndAlert(water, bacteria, temp) {
  if (!alertNotifEnabled) return;
  let alertType = null, bannerMsg = "";

  if      (bacteria >= 500) { alertType = "critical"; bannerMsg = `CRITICAL: TDS at ${bacteria} ppm — US EPA max contamination level!`; }
  else if (bacteria >= 400) { alertType = "critical"; bannerMsg = `DANGER: TDS at ${bacteria} ppm — High contamination from tap/mineral springs!`; }
  else if (bacteria >= 300) { alertType = "warning";  bannerMsg = `WARNING: TDS at ${bacteria} ppm — High TDS from tap or mineral springs.`; }
  else if (bacteria >= 200) { alertType = "warning";  bannerMsg = `NOTICE: TDS at ${bacteria} ppm — Marginally acceptable water quality.`; }
  else if (water < 25)      { alertType = "warning";  bannerMsg = `WARNING: Turbidity critically low at ${water}% — check supply lines.`; }
  else if (temp > 30)       { alertType = "warning";  bannerMsg = `NOTICE: Water temperature ${temp}C — elevated, monitor for algae.`; }

  const banner = document.getElementById("alertBanner");
  if (alertType) {
    if (alertType !== lastAlertType) playAlertSound(alertType);
    document.getElementById("alertBannerText").innerText = bannerMsg;
    banner.className = "alert-banner " + alertType;
    banner.style.display = "flex";
  } else {
    banner.style.display = "none";
  }
  lastAlertType = alertType;
}

// ============================================================
// AI RECOMMENDATION
// ============================================================
function updateAIRecommendation(water, bacteria, temp) {
  let msg = "";
  if      (bacteria >= 500) msg = "CRITICAL: TDS at US EPA max contamination level (500 ppm). Do not drink — immediate action required.";
  else if (bacteria >= 400) msg = "DANGER: High TDS detected (400-500 ppm). Water from tap or mineral springs — treatment needed.";
  else if (bacteria >= 300) msg = "WARNING: High TDS (300-400 ppm). Tap or mineral spring source — not ideal for drinking.";
  else if (bacteria >= 200) msg = "NOTICE: TDS marginally acceptable (200-300 ppm). Consider filtration.";
  else if (bacteria >= 100) msg = "INFO: Hard water detected (100-200 ppm). Safe but may affect taste and appliances.";
  else if (bacteria >= 50)  msg = "INFO: Carbon filtration or mountain spring water (50-100 ppm). Good quality.";
  else                      msg = "IDEAL: TDS below 50 ppm — ideal drinking water (reverse osmosis / microfiltration).";
  document.getElementById("aiMessage").innerText = msg;
}

// ============================================================
// MODAL
// ============================================================
document.querySelectorAll(".clickable-card").forEach(card => {
  card.addEventListener("click", () => {
    const msgs = {
      water:    "Turbidity measures water clarity. Values below 25% are critical and require immediate intervention.",
      bacteria: "TDS (Total Dissolved Solids) in ppm: 0-50 = Ideal, 50-100 = Carbon/Hard Water, 100-200 = Hard Water, 200-300 = Marginally Acceptable, 300-400 = High TDS, 400-500 = High Contamination, 500+ = US EPA Max Level."
    };
    document.getElementById("aiDetails").innerText = msgs[card.getAttribute("data-type")] || "Live monitoring active.";
    document.getElementById("aiModal").style.display = "flex";
  });
});

document.getElementById("recommendationBox").addEventListener("click", () => {
  document.getElementById("aiDetails").innerText = "The AI engine continuously analyzes real-time sensor data. Thresholds are evaluated every 10 seconds. Alerts fire when TDS exceeds 200 ppm or Turbidity drops below 25%.";
  document.getElementById("aiModal").style.display = "flex";
});

function closeModal() {
  document.getElementById("aiModal").style.display = "none";
}

// ============================================================
// SETTINGS
// ============================================================
function clearSettingsMessages() {
  document.getElementById("settings-success").style.display = "none";
  document.getElementById("settings-error").style.display   = "none";
}

function saveCredentials() {
  const currentPw   = document.getElementById("set-current-password").value;
  const newUsername = document.getElementById("set-new-username").value.trim();
  const newPw       = document.getElementById("set-new-password").value;
  const confirmPw   = document.getElementById("set-confirm-password").value;
  clearSettingsMessages();
  if (!currentPw)               { showSettingsError("Please enter your current password to confirm changes."); return; }
  if (currentPw !== ADMIN_PASS) { showSettingsError("Current password is incorrect."); return; }
  if (!newUsername && !newPw)   { showSettingsError("Please fill in at least one field to update."); return; }
  if (newPw && newPw !== confirmPw)   { showSettingsError("New passwords do not match."); return; }
  if (newPw && newPw.length < 6)     { showSettingsError("New password must be at least 6 characters."); return; }
  if (newUsername) {
    ADMIN_USER = newUsername;
    localStorage.setItem("htrack_user", ADMIN_USER);
    document.getElementById("user-name").innerText = ADMIN_USER;
    const av = document.getElementById("user-avatar");
    if (!av.querySelector("img")) av.innerText = ADMIN_USER.charAt(0).toUpperCase();
    document.getElementById("set-current-user").innerText = ADMIN_USER;
  }
  if (newPw) {
    ADMIN_PASS = newPw;
    localStorage.setItem("htrack_pass", ADMIN_PASS);
  }
  ["set-new-username","set-new-password","set-confirm-password","set-current-password"]
    .forEach(id => document.getElementById(id).value = "");
  showSettingsSuccess("Credentials updated successfully.");
}

function showSettingsError(msg) {
  const el = document.getElementById("settings-error");
  el.innerText = msg; el.style.display = "block";
}
function showSettingsSuccess(msg) {
  const el = document.getElementById("settings-success");
  el.innerText = msg; el.style.display = "block";
}