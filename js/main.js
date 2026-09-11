/* ============================================================
   JARVIS'26 — shared UI behaviour (nav, reveal-on-scroll)
   ============================================================ */

(() => {
  const nav = document.querySelector(".nav");
  const toggle = document.querySelector(".nav-toggle");
  const panel = document.querySelector(".mobile-panel");
  const scrim = document.querySelector(".scrim");

  const onScroll = () => {
    if (!nav) return;
    nav.classList.toggle("scrolled", window.scrollY > 12);
  };
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  const closeMenu = () => {
    toggle?.classList.remove("open");
    panel?.classList.remove("open");
    scrim?.classList.remove("open");
    document.body.style.overflow = "";
  };
  const openMenu = () => {
    toggle?.classList.add("open");
    panel?.classList.add("open");
    scrim?.classList.add("open");
    document.body.style.overflow = "hidden";
  };

  toggle?.addEventListener("click", () => {
    toggle.classList.contains("open") ? closeMenu() : openMenu();
  });
  scrim?.addEventListener("click", closeMenu);
  panel?.querySelectorAll("a").forEach((a) => a.addEventListener("click", closeMenu));

  // reveal-on-scroll
  const revealEls = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && revealEls.length) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("in");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    revealEls.forEach((el) => io.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add("in"));
  }
})();
