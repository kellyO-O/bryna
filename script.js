// ===== Time together dashboard =====
const START_DATE = new Date("2023-02-25T00:00:00");

function getBreakdown(now) {
  let years = now.getFullYear() - START_DATE.getFullYear();
  let months = now.getMonth() - START_DATE.getMonth();
  let days = now.getDate() - START_DATE.getDate();

  if (days < 0) {
    months -= 1;
    const prevMonth = new Date(now.getFullYear(), now.getMonth(), 0);
    days += prevMonth.getDate();
  }
  if (months < 0) {
    years -= 1;
    months += 12;
  }
  return { years, months, days };
}

function countUp(el, target, duration = 1100) {
  const start = performance.now();
  function tick(now) {
    const progress = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
    el.textContent = Math.round(eased * target);
    if (progress < 1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

function initDashboard() {
  const now = new Date();
  const { years, months, days } = getBreakdown(now);

  const yEl = document.getElementById("stat-years");
  const mEl = document.getElementById("stat-months");
  const dEl = document.getElementById("stat-days");

  countUp(yEl, years);
  countUp(mEl, months);
  countUp(dEl, days);

  // live seconds-together ticker
  const liveEl = document.getElementById("stat-live");
  function tickLive() {
    const diffSeconds = Math.floor((new Date() - START_DATE) / 1000);
    liveEl.textContent = diffSeconds.toLocaleString();
  }
  tickLive();
  setInterval(tickLive, 1000);
}

// Trigger the count-up once the dashboard scrolls into view
function observeDashboard() {
  const dash = document.getElementById("dashboard");
  if (!dash) return;
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          initDashboard();
          io.disconnect();
        }
      });
    },
    { threshold: 0.4 }
  );
  io.observe(dash);
}

document.addEventListener("DOMContentLoaded", observeDashboard);
