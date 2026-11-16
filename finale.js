// ===== Birthday finale: gate + midnight trigger + sequence =====
// Needs script.js loaded first (START_DATE, getBreakdown).
(() => {
  "use strict";

  // ---- config ----
  const PASSWORD = "bear";
  const PLAY_FROM = new Date("2026-11-17T00:00:00"); // the sequence plays on this day only (device local time)
  const PLAY_TO = new Date("2026-11-18T00:00:00");
  const END = new Date("2026-08-17T16:13:00");       // where the counter rewinds to and stays stuck
  const UNLOCK_KEY = "bryna_unlocked";
  const Q = new URLSearchParams(location.search);
  const DEMO = Q.has("demo");   // ?demo  = play the sequence now (preview)
  const AFTER = Q.has("final"); // ?final = preview the site as it looks after the day

  const $ = (s, r = document) => r.querySelector(s);
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const raf = () => new Promise((r) => requestAnimationFrame(r));
  const safe = (store) => ({
    get: (k) => { try { return store.getItem(k); } catch (e) { return null; } },
    set: (k, v) => { try { store.setItem(k, v); } catch (e) {} },
  });
  const ls = safe(localStorage);
  const ss = safe(sessionStorage);

  const t = Date.now();
  const phase = DEMO ? "play" : AFTER ? "after" : t < PLAY_FROM ? "before" : t < PLAY_TO ? "play" : "after";
  const isDone = phase === "after";
  window.Finale = { mode: isDone ? "final" : "live", END };

  const html = document.documentElement;
  const dash = $("#dashboard");
  const eyebrow = $("#dash-eyebrow");
  const yEl = $("#stat-years"), mEl = $("#stat-months"), dEl = $("#stat-days");
  const liveEl = $("#stat-live"), tailEl = $("#stat-tail");
  const footerLine = $("#footer-line");
  const belt = $(".belt-section");
  const gate = $("#gate");

  // ---- build overlays ----
  const veil = document.createElement("div");
  veil.id = "fin-veil";
  document.body.appendChild(veil);

  const birthday = document.createElement("div");
  birthday.id = "birthday";
  birthday.className = "fin-layer";
  birthday.innerHTML = `
    <div class="bd-wrap">
      <p class="bd-happy">Happy</p>
      <p class="bd-num">20<sup>th</sup></p>
      <p class="bd-bday">Birthday, Bree</p>
    </div>`;
  document.body.appendChild(birthday);
  for (let i = 0; i < 26; i++) {
    const s = document.createElement("span");
    s.className = "bd-spark";
    s.textContent = i % 4 === 0 ? "♥" : "✦";
    s.style.left = Math.random() * 100 + "%";
    s.style.fontSize = 0.7 + Math.random() * 1.1 + "rem";
    s.style.animationDuration = 6 + Math.random() * 6 + "s";
    s.style.animationDelay = Math.random() * 6 + "s";
    if (i % 4 === 0) s.style.color = "var(--rose)";
    birthday.appendChild(s);
  }

  const lines = [
    "I'm sad it's over between us.",
    "I'll never forget you.",
    "My first love.<br>My first everything.",
    "I wish you all the best.",
    "And I love you.",
  ];
  const farewell = document.createElement("div");
  farewell.id = "farewell";
  farewell.className = "fin-layer";
  farewell.innerHTML = lines
    .map((t, i) => `<p class="fw-line${i === lines.length - 1 ? " fw-love" : ""}">${t}</p>`)
    .join("");
  document.body.appendChild(farewell);

  const rwTag = document.createElement("span");
  rwTag.className = "rw-tag";
  rwTag.textContent = "◀◀ REWIND";
  const rwBar = document.createElement("div");
  rwBar.className = "rw-bar";
  const rwDate = document.createElement("div");
  rwDate.className = "rw-date";
  dash.append(rwTag, rwBar, rwDate);

  // ---- helpers ----
  const MON = ["JAN","FEB","MAR","APR","MAY","JUN","JUL","AUG","SEP","OCT","NOV","DEC"];
  const p2 = (n) => String(n).padStart(2, "0");
  function fmt(d, withSec) {
    let h = d.getHours();
    const ap = h >= 12 ? "PM" : "AM";
    h = h % 12 || 12;
    return `${d.getDate()} ${MON[d.getMonth()]} ${d.getFullYear()} · ${h}:${p2(d.getMinutes())}${withSec ? ":" + p2(d.getSeconds()) : ""} ${ap}`;
  }
  function setNumbers(d) {
    const b = getBreakdown(d);
    yEl.textContent = b.years;
    mEl.textContent = b.months;
    dEl.textContent = b.days;
    liveEl.textContent = Math.max(0, Math.floor((d - START_DATE) / 1000)).toLocaleString();
  }
  const easeInOutQuart = (t) => (t < 0.5 ? 8 * t ** 4 : 1 - Math.pow(-2 * t + 2, 4) / 2);

  const LONG = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const endLabel = `Feb 25, 2023 → ${LONG[END.getMonth()]} ${END.getDate()}, ${END.getFullYear()}`;
  function applyFinalCopy() {
    eyebrow.textContent = endLabel;
    tailEl.textContent = " seconds. this is where it stopped.";
    rwDate.textContent = fmt(END, false);
  }
  function swapFooter() {
    footerLine.classList.add("swapping");
    setTimeout(() => {
      footerLine.textContent = "grateful for the last film, Bree.";
      footerLine.classList.remove("swapping");
    }, 800);
  }
  function centerOn(el) {
    const r = el.getBoundingClientRect();
    window.scrollTo({ top: window.scrollY + r.top - (innerHeight - r.height) / 2, left: 0, behavior: "instant" });
  }

  if (isDone) {
    applyFinalCopy();
    footerLine.textContent = "grateful for the last film, Bree.";
    dash.classList.add("final");
  }

  // ---- the sequence ----
  let started = false;
  async function runSequence() {
    if (started) return;
    started = true;
    window.Finale.mode = "sequence";
    clearInterval(window.liveTimer);
    document.body.classList.add("sequence");

    const from = DEMO ? new Date("2026-11-17T09:00:00") : new Date();
    setNumbers(from);
    rwDate.textContent = fmt(from, true);

    // 1. to black
    veil.style.opacity = 1;
    await sleep(1400);
    centerOn(dash);

    // 2. happy birthday
    birthday.classList.add("on");
    await sleep(600);
    $(".bd-wrap", birthday).classList.add("show");
    await sleep(7600);
    birthday.classList.remove("on");
    veil.style.opacity = 0.9;
    await sleep(2200);

    // 3. rewind the real counter
    dash.classList.add("rewinding");
    tailEl.textContent = " seconds, rewinding";
    await sleep(900);
    const DUR = 13000, span = from - END, t0 = performance.now();
    while (true) {
      const p = Math.min(1, (performance.now() - t0) / DUR);
      const e = easeInOutQuart(p);
      const d = new Date(from.getTime() - span * e);
      setNumbers(d);
      rwDate.textContent = fmt(d, true);
      const g = Math.sin(Math.PI * p);
      dash.style.setProperty("--glitch", g.toFixed(3));
      dash.style.setProperty("--drain", e.toFixed(3));
      dash.style.setProperty("--jx", ((Math.random() - 0.5) * 8 * g).toFixed(2));
      if (p >= 1) break;
      await raf();
    }

    // 4. it stops
    setNumbers(END);
    rwDate.textContent = fmt(END, false);
    eyebrow.textContent = endLabel;
    tailEl.textContent = " seconds. this is where it stopped.";
    rwTag.textContent = "■ STOP";
    dash.classList.remove("rewinding");
    dash.classList.add("frozen", "landed");
    await sleep(3000);

    // 5. the words
    dash.classList.add("dim");
    veil.style.opacity = 0.97;
    farewell.classList.add("on");
    swapFooter();
    const els = [...farewell.querySelectorAll(".fw-line")];
    const gaps = [1500, 3000, 3300, 3300, 3600];
    for (let i = 0; i < els.length; i++) {
      await sleep(gaps[i]);
      if (i > 0) els[i - 1].classList.add("past");
      els[i].classList.add("show");
    }
    await sleep(5500);

    // 6. play the reel
    farewell.classList.remove("on");
    await sleep(1700);
    dash.classList.remove("dim");
    veil.style.opacity = 0;
    await sleep(1800);
    document.body.classList.remove("sequence");
    dash.classList.remove("frozen", "landed");
    dash.classList.add("final");
    belt.scrollIntoView({ behavior: "smooth", block: "center" });
    await sleep(1400);
    belt.classList.add("playing");

    window.Finale.mode = "final";
  }

  // ---- gate + midnight watcher ----
  let unlocked = html.classList.contains("unlocked");

  function maybeStart() {
    if (started || !unlocked || phase !== "play") return;
    runSequence();
  }

  const form = $("#gate-form");
  if (form) {
    const input = $("#gate-input"), err = $("#gate-err");
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      if (input.value.trim().toLowerCase() === PASSWORD) {
        ss.set(UNLOCK_KEY, "1");
        gate.classList.add("open");
        unlocked = true;
        maybeStart();
        setTimeout(() => html.classList.add("unlocked"), 950);
      } else {
        err.classList.add("show");
        form.classList.remove("shake");
        void form.offsetWidth;
        form.classList.add("shake");
        input.select();
      }
    });
    input.addEventListener("input", () => $("#gate-err").classList.remove("show"));
  }

  maybeStart();
})();
