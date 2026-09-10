(() => {
  "use strict";

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* header scroll state */
  const header = document.querySelector(".site-header");
  const onScroll = () => header.classList.toggle("is-scrolled", window.scrollY > 12);
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  /* mobile nav */
  const toggle = document.getElementById("nav-toggle");
  const nav = document.getElementById("main-nav");
  toggle.addEventListener("click", () => {
    const open = nav.classList.toggle("is-open");
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Fechar menu" : "Abrir menu");
    document.body.style.overflow = open ? "hidden" : "";
  });
  nav.querySelectorAll("a").forEach(a => a.addEventListener("click", () => {
    nav.classList.remove("is-open");
    toggle.setAttribute("aria-expanded", "false");
    document.body.style.overflow = "";
  }));

  /* scroll reveal — content is visible by default (see CSS); only once we
     know we can observe + reveal it do we opt into the hidden->visible
     animation, so a JS failure never leaves content stuck invisible. */
  const revealEls = document.querySelectorAll("[data-reveal]");
  if (!reduceMotion && "IntersectionObserver" in window && revealEls.length) {
    document.documentElement.classList.add("reveal-ready");
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const el = entry.target;
          const group = el.parentElement;
          const siblings = group ? [...group.querySelectorAll("[data-reveal]")] : [el];
          const idx = siblings.indexOf(el);
          setTimeout(() => el.classList.add("is-visible"), Math.max(0, idx) * 80);
          io.unobserve(el);
        }
      });
    }, { threshold: 0.15, rootMargin: "0px 0px -8% 0px" });
    revealEls.forEach(el => io.observe(el));

    /* safety net: force-reveal anything the observer somehow missed */
    setTimeout(() => revealEls.forEach(el => el.classList.add("is-visible")), 3000);
  }

  /* animated counters (rating / review count) */
  const counters = document.querySelectorAll("[data-count]");
  const animateCount = (el) => {
    const target = parseFloat(el.dataset.count);
    const isDecimal = el.dataset.count.includes(".");
    const duration = 1200;
    const start = performance.now();
    const step = (now) => {
      const p = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      const val = target * eased;
      el.textContent = isDecimal ? val.toFixed(1) : Math.round(val).toString();
      if (p < 1) requestAnimationFrame(step);
      else el.textContent = isDecimal ? target.toFixed(1) : String(target);
    };
    requestAnimationFrame(step);
  };
  if (counters.length) {
    if (reduceMotion || !("IntersectionObserver" in window)) {
      counters.forEach(el => {
        const t = el.dataset.count;
        el.textContent = t.includes(".") ? parseFloat(t).toFixed(1) : t;
      });
    } else {
      const cio = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            animateCount(entry.target);
            cio.unobserve(entry.target);
          }
        });
      }, { threshold: 0.6 });
      counters.forEach(el => cio.observe(el));
    }
  }

  /* duplicate marquee content once for a seamless loop */
  const track = document.getElementById("marquee-track");
  if (track) {
    const clone = track.innerHTML;
    track.insertAdjacentHTML("beforeend", clone);
  }

  /* footer year */
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());
})();
