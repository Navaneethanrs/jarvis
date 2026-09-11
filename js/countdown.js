/* ============================================================
   JARVIS'26 — Countdown
   Change EVENT_DATE below if the exact start time changes.
   ============================================================ */

const EVENT_DATE = new Date("2026-09-21T09:00:00");

(() => {
  const els = {
    d: document.querySelector("[data-cd-days]"),
    h: document.querySelector("[data-cd-hours]"),
    m: document.querySelector("[data-cd-mins]"),
    s: document.querySelector("[data-cd-secs]"),
  };
  if (!els.d) return;

  const pad = (n) => String(Math.max(0, n)).padStart(2, "0");

  const tick = () => {
    const now = new Date();
    let diff = EVENT_DATE - now;

    if (diff <= 0) {
      els.d.textContent = "00";
      els.h.textContent = "00";
      els.m.textContent = "00";
      els.s.textContent = "00";
      const live = document.querySelector("[data-cd-live]");
      if (live) live.textContent = "JARVIS'26 is here";
      clearInterval(timer);
      return;
    }

    const day = Math.floor(diff / 86400000);
    diff -= day * 86400000;
    const hr = Math.floor(diff / 3600000);
    diff -= hr * 3600000;
    const min = Math.floor(diff / 60000);
    diff -= min * 60000;
    const sec = Math.floor(diff / 1000);

    els.d.textContent = pad(day);
    els.h.textContent = pad(hr);
    els.m.textContent = pad(min);
    els.s.textContent = pad(sec);
  };

  tick();
  const timer = setInterval(tick, 1000);
})();
