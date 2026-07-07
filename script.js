// ===============================
// Navbar Scroll Effect
// ===============================

function initNavbarScroll() {
  const navbar = document.getElementById("navbar");
  if (!navbar) return;

  const SCROLL_THRESHOLD = 40;

  function onScroll() {
    if (window.scrollY > SCROLL_THRESHOLD) {
      navbar.classList.add("scrolled");
    } else {
      navbar.classList.remove("scrolled");
    }
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
}

// ===============================
// Mobile Menu
// ===============================

function initMobileMenu() {
  const toggle = document.getElementById("mobileToggle");
  const menu = document.getElementById("mobileMenu");

  if (!toggle || !menu) return;

  function setOpen(isOpen) {
    toggle.setAttribute("aria-expanded", isOpen);
    toggle.setAttribute("aria-label", isOpen ? "Close menu" : "Open menu");

    menu.classList.toggle("open", isOpen);
    menu.setAttribute("aria-hidden", !isOpen);
  }

  toggle.addEventListener("click", () => {
    const isOpen = toggle.getAttribute("aria-expanded") === "true";
    setOpen(!isOpen);
  });

  // Close when clicking a link or action button — but not the theme
  // toggle, which the user may want to press without losing the menu
  menu.querySelectorAll("a, button:not(.theme-toggle)").forEach((item) => {
    item.addEventListener("click", () => setOpen(false));
  });

  // Close when clicking outside
  document.addEventListener("click", (e) => {
    const isOpen = toggle.getAttribute("aria-expanded") === "true";

    if (isOpen && !menu.contains(e.target) && !toggle.contains(e.target)) {
      setOpen(false);
    }
  });

  // Escape key

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      setOpen(false);
    }
  });
}

// ===============================
// Testimonials Slider
// ===============================

function initTestimonials() {
  const track = document.getElementById("testimonialsTrack");
  const prevBtn = document.getElementById("tPrev");
  const nextBtn = document.getElementById("tNext");
  const progressBar = document.getElementById("tProgressBar");

  if (!track || !prevBtn || !nextBtn || !progressBar) return;

  const AUTO_INTERVAL = 4000;

  let autoTimer;
  let isDown = false;
  let startX = 0;
  let scrollStart = 0;
  let dragged = false;

  function cardStep() {
    const card = track.querySelector(".t-card");

    if (!card) return 0;

    const style = getComputedStyle(track);

    const gap = parseFloat(style.gap || style.columnGap || "0");

    return card.getBoundingClientRect().width + gap;
  }

  function maxScroll() {
    return track.scrollWidth - track.clientWidth;
  }

  function scrollCards(direction) {
    track.scrollBy({
      left: direction * cardStep(),
      behavior: "smooth",
    });
  }

  function updateProgress() {
    const max = maxScroll();

    const percent = max > 0 ? Math.min(100, (track.scrollLeft / max) * 100) : 0;

    progressBar.style.width = percent + "%";
  }

  function autoSlide() {
    const max = maxScroll();

    if (track.scrollLeft >= max - 2) {
      track.scrollTo({
        left: 0,
        behavior: "smooth",
      });
    } else {
      scrollCards(1);
    }
  }

  function startAuto() {
    stopAuto();
    autoTimer = setInterval(autoSlide, AUTO_INTERVAL);
  }

  function stopAuto() {
    clearInterval(autoTimer);
  }

  prevBtn.addEventListener("click", () => {
    scrollCards(-1);
    startAuto();
  });

  nextBtn.addEventListener("click", () => {
    scrollCards(1);
    startAuto();
  });

  track.addEventListener("scroll", updateProgress);

  track.addEventListener("mouseenter", stopAuto);
  track.addEventListener("mouseleave", startAuto);

  // Drag Support

  track.addEventListener("pointerdown", (e) => {
    isDown = true;
    dragged = false;

    startX = e.clientX;
    scrollStart = track.scrollLeft;

    track.classList.add("dragging");

    stopAuto();
  });

  window.addEventListener("pointermove", (e) => {
    if (!isDown) return;

    const dx = e.clientX - startX;

    if (Math.abs(dx) > 5) dragged = true;

    track.scrollLeft = scrollStart - dx;
  });

  window.addEventListener("pointerup", () => {
    if (!isDown) return;

    isDown = false;

    track.classList.remove("dragging");

    startAuto();
  });

  track.addEventListener(
    "click",
    (e) => {
      if (dragged) {
        e.preventDefault();
        e.stopPropagation();
      }
    },
    true,
  );

  updateProgress();
  startAuto();
}

// ===============================
// Active Navbar Link (NEW)
// ===============================

function initActiveNav() {
  const sections = document.querySelectorAll("section[id]");
  const navLinks = document.querySelectorAll(".nav-item");

  function updateActive() {
    let current = "";

    sections.forEach((section) => {
      const sectionTop = section.offsetTop - 120;

      if (window.scrollY >= sectionTop) {
        current = section.getAttribute("id");
      }
    });

    navLinks.forEach((link) => {
      link.classList.remove("active");

      if (link.getAttribute("href") === "#" + current) {
        link.classList.add("active");
      }
    });
  }

  window.addEventListener("scroll", updateActive, { passive: true });
  updateActive();
}

// ===============================
// Dark / Light Mode Toggle
// ===============================

function initThemeToggle() {
  const root = document.documentElement;
  const toggles = [
    document.getElementById("themeToggle"),
    document.getElementById("themeToggleMobile"),
  ].filter(Boolean);

  if (toggles.length === 0) return;

  function currentTheme() {
    return root.getAttribute("data-theme") === "dark" ? "dark" : "light";
  }

  function applyTheme(theme) {
    root.setAttribute("data-theme", theme);

    try {
      localStorage.setItem("theme", theme);
    } catch (e) {
      // localStorage unavailable (private browsing, etc.) — theme still
      // applies for this session, it just won't persist across reloads.
    }

    const label = theme === "dark" ? "Switch to light mode" : "Switch to dark mode";
    toggles.forEach((btn) => btn.setAttribute("aria-label", label));
  }

  // Sync the initial aria-label with whatever the inline <head> script
  // already applied before first paint.
  applyTheme(currentTheme());

  toggles.forEach((btn) => {
    btn.addEventListener("click", () => {
      applyTheme(currentTheme() === "dark" ? "light" : "dark");
    });
  });

  // Follow the OS theme live if the user hasn't made an explicit choice
  if (window.matchMedia) {
    window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", (e) => {
      let hasManualChoice = true;
      try {
        hasManualChoice = !!localStorage.getItem("theme");
      } catch (err) {
        hasManualChoice = false;
      }
      if (!hasManualChoice) {
        applyTheme(e.matches ? "dark" : "light");
      }
    });
  }
}

// ===============================
// Loading Screen (skeleton preview)
// ===============================

function initLoadingScreen() {
  const screen = document.getElementById("loadingScreen");
  if (!screen) return;

  const MIN_VISIBLE_MS = 600; // avoid a jarring flash on fast connections
  const shownAt = Date.now();

  function hide() {
    const elapsed = Date.now() - shownAt;
    const wait = Math.max(0, MIN_VISIBLE_MS - elapsed);

    setTimeout(() => {
      screen.classList.add("loaded");
      // Remove from the DOM once the fade-out finishes so it can't
      // intercept clicks or stay around as dead weight.
      screen.addEventListener(
        "transitionend",
        () => screen.remove(),
        { once: true },
      );
    }, wait);
  }

  if (document.readyState === "complete") {
    hide();
  } else {
    window.addEventListener("load", hide);
  }
}

// ===============================
// Film Trail / Cursor Trail
// ===============================

function initFilmTrail() {
  const canvas = document.getElementById("filmTrail");
  if (!canvas) return;

  // Respect reduced-motion preference and skip on touch-only devices
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const isCoarsePointer = window.matchMedia("(pointer: coarse)").matches;
  if (reduceMotion || isCoarsePointer) return;

  const ctx = canvas.getContext("2d");
  let width, height;
  let particles = [];
  let lastX = null;
  let lastY = null;

  function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  }

  window.addEventListener("resize", resize);
  resize();

  function addParticle(x, y) {
    particles.push({
      x,
      y,
      radius: 6 + Math.random() * 8,
      life: 1,
      decay: 0.02 + Math.random() * 0.015,
      hue: 30 + Math.random() * 20, // warm film-leak tones
    });

    if (particles.length > 60) particles.shift();
  }

  window.addEventListener(
    "pointermove",
    (e) => {
      const x = e.clientX;
      const y = e.clientY;

      // Space out particles along the path so fast movement still
      // reads as a continuous trail rather than isolated dots.
      if (lastX === null) {
        addParticle(x, y);
      } else {
        const dist = Math.hypot(x - lastX, y - lastY);
        const steps = Math.min(6, Math.max(1, Math.floor(dist / 12)));

        for (let i = 1; i <= steps; i++) {
          const t = i / steps;
          addParticle(lastX + (x - lastX) * t, lastY + (y - lastY) * t);
        }
      }

      lastX = x;
      lastY = y;
    },
    { passive: true },
  );

  function draw() {
    ctx.clearRect(0, 0, width, height);

    particles.forEach((p) => {
      const alpha = Math.max(0, p.life) * 0.35;

      ctx.beginPath();
      ctx.fillStyle = `hsla(${p.hue}, 90%, 60%, ${alpha})`;
      ctx.arc(p.x, p.y, p.radius * p.life, 0, Math.PI * 2);
      ctx.fill();

      p.life -= p.decay;
    });

    particles = particles.filter((p) => p.life > 0);

    requestAnimationFrame(draw);
  }

  requestAnimationFrame(draw);
}

// ===============================
// Parallax Effect
// ===============================

function initParallax() {
  const layers = document.querySelectorAll("[data-parallax]");
  if (layers.length === 0) return;

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduceMotion) return;

  let ticking = false;

  function update() {
    const scrollY = window.scrollY;

    layers.forEach((el) => {
      const speed = parseFloat(el.getAttribute("data-parallax")) || 0.2;
      const offset = scrollY * speed;
      el.style.transform = el.classList.contains("hero-video")
        ? `translate(-50%, calc(-50% + ${offset}px))`
        : `translateY(${offset}px)`;
    });

    ticking = false;
  }

  function onScroll() {
    if (!ticking) {
      requestAnimationFrame(update);
      ticking = true;
    }
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  update();
}

// ===============================
// Current Year (Footer)
// ===============================

const year = document.getElementById("year");

if (year) {
  year.textContent = new Date().getFullYear();
}

// ===============================
// Initialize Everything
// ===============================

document.addEventListener("DOMContentLoaded", () => {
  initNavbarScroll();
  initMobileMenu();
  initTestimonials();
  initActiveNav();
  initThemeToggle();
  initLoadingScreen();
  initFilmTrail();
  initParallax();
});