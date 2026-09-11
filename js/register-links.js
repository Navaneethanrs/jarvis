/* ============================================================
   JARVIS'26 — Registration links
   ------------------------------------------------------------
   Paste each event's registration link between the quotes below.
   Leave as "#" until the link is ready — the button will show
   "Coming soon" automatically and won't navigate anywhere.
   The GENERAL key is used for the "Register Now" buttons in the
   nav bar and homepage hero (overall symposium registration).
   ============================================================ */

const REGISTER_LINKS = {
  GENERAL: "https://forms.gle/XhM5CRWhWAoThfi56",

  // Tech events — Slot 1
  STARTUP_PITCH: "https://forms.gle/XhM5CRWhWAoThfi56",
  DEBUG_THE_CODE: "https://forms.gle/FzgU5X2DsbWtSm2v6",

  // Tech events — Slot 2
  STACK_SWITCH: "https://forms.gle/U6Cui6qsEFwWyytH6",
  UIUX_DESIGN: "https://forms.gle/jULFtQ4mJDh8twr19",

  // Non-tech events
  FLIP_FLOP: "https://forms.gle/S6istBdJJywL5u2x8",
  ONTHESPOT_DEBATE: "https://forms.gle/S6istBdJJywL5u2x8",
  MINDPOWER_TEST: "https://forms.gle/S6istBdJJywL5u2x8",
};

document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll("[data-register]").forEach((el) => {
    const key = el.getAttribute("data-register");
    const link = REGISTER_LINKS[key];
    if (link && link !== "#") {
      el.setAttribute("href", link);
      el.setAttribute("target", "_blank");
      el.setAttribute("rel", "noopener");
    } else {
      el.setAttribute("href", "#");
      el.addEventListener("click", (e) => {
        e.preventDefault();
        el.dataset.originalText = el.dataset.originalText || el.textContent;
        el.textContent = "Link coming soon";
        setTimeout(() => { el.textContent = el.dataset.originalText; }, 1600);
      });
    }
  });
});
