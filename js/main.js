/* Vivid Horizons Sri Lanka — small interactions, no dependencies.

   All scroll work happens in ONE requestAnimationFrame loop that only ever
   writes transforms and custom properties, so the browser can keep it on the
   compositor. If the visitor prefers reduced motion, the loop never starts. */
(function () {
  "use strict";

  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---- current year in the footer ---- */
  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  /* ---- mobile nav ---- */
  var header = document.getElementById("siteHeader");
  var toggle = document.getElementById("navToggle");
  var nav = document.getElementById("primaryNav");

  var closeNav = function () {
    nav.classList.remove("is-open");
    toggle.setAttribute("aria-expanded", "false");
    toggle.setAttribute("aria-label", "Open menu");
  };

  toggle.addEventListener("click", function () {
    var open = nav.classList.toggle("is-open");
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  });

  nav.addEventListener("click", function (e) {
    if (e.target.tagName === "A") closeNav();
  });

  window.addEventListener("resize", function () {
    if (window.innerWidth > 900) closeNav();
  });

  /* ==========================================================================
     Reveal on scroll — adds .is-in, plus a stagger delay for children of a
     [data-stagger] container so rows of cards arrive one after another.
     ========================================================================== */
  var items = document.querySelectorAll(".reveal, .mask");

  document.querySelectorAll("[data-stagger]").forEach(function (group) {
    Array.prototype.forEach.call(group.children, function (child, i) {
      child.style.setProperty("--d", (i % 6) * 85 + "ms");
    });
  });

  if (reduced || !("IntersectionObserver" in window)) {
    items.forEach(function (el) { el.classList.add("is-in"); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-in");
        io.unobserve(entry.target);
      });
    }, { rootMargin: "0px 0px -10% 0px", threshold: 0.12 });

    items.forEach(function (el) { io.observe(el); });
  }

  /* ==========================================================================
     The scroll loop: header state, progress rail, and parallax.

     Every [data-speed] element drifts against the scroll by its own factor.
     The offset is measured from the element's distance to the centre of the
     viewport, so a piece sits exactly where it was authored when it is
     centred, and drifts symmetrically either side of that.
     ========================================================================== */
  var bar = document.getElementById("progressBar");
  var parallax = [];
  var ticking = false;
  var visible = new WeakSet();

  if (!reduced) {
    document.querySelectorAll("[data-speed]").forEach(function (el) {
      parallax.push({ el: el, speed: parseFloat(el.dataset.speed) || 0 });
    });

    /* only move what is actually on screen */
    if ("IntersectionObserver" in window) {
      var vio = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) visible.add(entry.target);
          else visible.delete(entry.target);
        });
      }, { rootMargin: "20% 0px" });
      parallax.forEach(function (p) { vio.observe(p.el); });
    } else {
      parallax.forEach(function (p) { visible.add(p.el); });
    }
  }

  var update = function () {
    ticking = false;

    var y = window.scrollY || window.pageYOffset;
    var vh = window.innerHeight;

    header.classList.toggle("is-stuck", y > 8);

    if (bar) {
      var max = document.documentElement.scrollHeight - vh;
      bar.style.setProperty("--p", max > 0 ? Math.min(y / max, 1).toFixed(4) : 0);
    }

    for (var i = 0; i < parallax.length; i++) {
      var p = parallax[i];
      if (!visible.has(p.el)) continue;
      var rect = p.el.getBoundingClientRect();
      var fromCentre = rect.top + rect.height / 2 - vh / 2;
      p.el.style.setProperty("--py", (-fromCentre * p.speed).toFixed(2) + "px");
    }
  };

  var onScroll = function () {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(update);
  };

  update();
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll, { passive: true });

  /* ==========================================================================
     Gallery lightbox
     ========================================================================== */
  var lb = document.getElementById("lightbox");
  var lbImg = document.getElementById("lbImg");
  var lbCap = document.getElementById("lbCap");
  var lbClose = document.getElementById("lbClose");
  var lastFocused = null;
  var closeTimer = null;

  var openLightbox = function (btn) {
    var img = btn.querySelector("img");
    lastFocused = btn;
    window.clearTimeout(closeTimer);
    lbImg.src = btn.dataset.full;
    lbImg.alt = img ? img.alt : "";
    lbCap.textContent = btn.dataset.caption || "";
    lb.hidden = false;
    document.body.style.overflow = "hidden";
    /* next frame, so the opening transition has a starting state to animate from */
    window.requestAnimationFrame(function () { lb.classList.add("is-open"); });
    lbClose.focus();
  };

  var hideLightbox = function () {
    lb.classList.remove("is-open");
    document.body.style.overflow = "";
    if (lastFocused) lastFocused.focus();
    closeTimer = window.setTimeout(function () {
      lb.hidden = true;
      lbImg.src = "";
    }, reduced ? 0 : 340);
  };

  document.querySelectorAll(".shot").forEach(function (btn) {
    btn.addEventListener("click", function () { openLightbox(btn); });
  });

  lbClose.addEventListener("click", hideLightbox);
  lb.addEventListener("click", function (e) {
    if (e.target === lb || e.target.classList.contains("lb-figure")) hideLightbox();
  });
  document.addEventListener("keydown", function (e) {
    if (lb.hidden) return;
    if (e.key === "Escape") hideLightbox();
    /* keep focus inside the dialog while it is open */
    if (e.key === "Tab") {
      e.preventDefault();
      lbClose.focus();
    }
  });
})();
