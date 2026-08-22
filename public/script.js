const header = document.querySelector("[data-header]");
const menuToggle = document.querySelector("[data-menu-toggle]");
const navDialog = document.querySelector("[data-nav-dialog]");
const navClose = document.querySelector("[data-nav-close]");
const year = document.querySelector("[data-year]");
const filterButtons = document.querySelectorAll("[data-filter]");
const menuCards = document.querySelectorAll("[data-category]");
const lightbox = document.querySelector("[data-lightbox-dialog]");
const lightboxImage = document.querySelector("[data-lightbox-image]");
const lightboxClose = document.querySelector("[data-lightbox-close]");
const cheeseSection = document.querySelector("[data-cheese-section]");
const menuHeatSurfaces = document.querySelectorAll(".menu-panel");

if (year) year.textContent = new Date().getFullYear();

const reduceMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
const HEADER_HIDE_AT = 112;
const HEADER_SHOW_AT = 56;
let headerCompact = false;
let headerFrame = 0;

const setHeaderCompact = (compact) => {
  if (headerCompact === compact) return;
  headerCompact = compact;

  const focusWasInHeader = compact && Boolean(header?.contains(document.activeElement));
  const shouldMoveFocusToHeader =
    !compact && window.innerWidth > 980 && document.activeElement === menuToggle;

  header?.classList.toggle("is-hidden", compact);
  document.body.classList.toggle("header-compact", compact);

  if (!header) return;

  header.inert = compact;
  if (compact) {
    header.setAttribute("aria-hidden", "true");
    if (focusWasInHeader) {
      menuToggle?.focus({ preventScroll: true });
    }
  } else {
    header.removeAttribute("aria-hidden");
    if (shouldMoveFocusToHeader) {
      header.querySelector(".brand")?.focus({ preventScroll: true });
    }
  }
};

const syncHeader = () => {
  headerFrame = 0;
  const threshold = headerCompact ? HEADER_SHOW_AT : HEADER_HIDE_AT;
  setHeaderCompact(window.scrollY > threshold);
};

const requestHeaderUpdate = () => {
  if (headerFrame) return;
  headerFrame = window.requestAnimationFrame(syncHeader);
};

syncHeader();
window.addEventListener("scroll", requestHeaderUpdate, { passive: true });
window.addEventListener("resize", requestHeaderUpdate);
window.addEventListener("pageshow", requestHeaderUpdate);

let navigationCloseTimer = 0;
let restoreMenuFocus = false;

const setMenuButtonState = (open) => {
  if (!menuToggle) return;
  menuToggle.setAttribute("aria-expanded", String(open));
  menuToggle.setAttribute("aria-label", open ? "Cerrar menú" : "Abrir menú");
};

const resetNavigationState = () => {
  window.clearTimeout(navigationCloseTimer);
  navigationCloseTimer = 0;
  navDialog?.classList.remove("is-active", "is-closing");
  setMenuButtonState(false);
  document.body.classList.remove("nav-open");
  document.body.style.removeProperty("--nav-scrollbar-width");

  if (restoreMenuFocus && menuToggle) {
    menuToggle.focus({ preventScroll: true });
  }
  restoreMenuFocus = false;
};

const closeNavigation = ({ restoreFocus = true, immediate = false } = {}) => {
  if (!navDialog?.open) {
    resetNavigationState();
    return;
  }

  restoreMenuFocus = restoreFocus;
  navDialog.classList.remove("is-active");
  navDialog.classList.add("is-closing");

  const finish = () => {
    navigationCloseTimer = 0;
    if (navDialog.open) navDialog.close();
  };

  if (immediate || reduceMotionQuery.matches) {
    finish();
  } else {
    navigationCloseTimer = window.setTimeout(finish, 480);
  }
};

const openNavigation = () => {
  if (!navDialog || navDialog.open) return;

  window.clearTimeout(navigationCloseTimer);
  navigationCloseTimer = 0;
  restoreMenuFocus = false;
  navDialog.classList.remove("is-closing");
  navDialog.showModal();
  setMenuButtonState(true);
  const scrollbarWidth = Math.max(0, window.innerWidth - document.documentElement.clientWidth);
  document.body.style.setProperty("--nav-scrollbar-width", `${scrollbarWidth}px`);
  document.body.classList.add("nav-open");
  navDialog.getBoundingClientRect();

  window.requestAnimationFrame(() => {
    navDialog.classList.add("is-active");
    navClose?.focus({ preventScroll: true });
  });
};

menuToggle?.addEventListener("click", () => {
  if (navDialog?.open) {
    closeNavigation();
  } else {
    openNavigation();
  }
});

navClose?.addEventListener("click", () => closeNavigation());

navDialog?.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => closeNavigation({ restoreFocus: false, immediate: true }));
});

navDialog?.addEventListener("cancel", (event) => {
  event.preventDefault();
  closeNavigation();
});

navDialog?.addEventListener("keydown", (event) => {
  if (event.key !== "Tab" || !navDialog.open) return;

  const focusable = [...navDialog.querySelectorAll("a[href], button:not([disabled]), [tabindex]:not([tabindex='-1'])")]
    .filter((element) => element.getClientRects().length > 0);

  if (!focusable.length) return;

  const first = focusable[0];
  const last = focusable[focusable.length - 1];
  const focusIsOutside = !navDialog.contains(document.activeElement);

  if (event.shiftKey && (document.activeElement === first || focusIsOutside)) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && (document.activeElement === last || focusIsOutside)) {
    event.preventDefault();
    first.focus();
  }
});

navDialog?.addEventListener("close", resetNavigationState);

navDialog?.addEventListener("click", (event) => {
  if (event.target !== navDialog) return;

  const bounds = navDialog.getBoundingClientRect();
  const clickedOutside =
    event.clientX < bounds.left ||
    event.clientX > bounds.right ||
    event.clientY < bounds.top ||
    event.clientY > bounds.bottom;

  if (clickedOutside) closeNavigation();
});

let cheeseFrame = 0;

const updateCheesePull = () => {
  cheeseFrame = 0;
  if (!cheeseSection) return;

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const bounds = cheeseSection.getBoundingClientRect();
  const travel = Math.max(bounds.height - window.innerHeight, 1);
  const progress = reduceMotion
    ? 1
    : Math.min(1, Math.max(0, -bounds.top / travel));
  const compact = window.innerWidth <= 760;
  const startLift = compact ? 45 : 80;
  const endLift = compact ? -80 : -145;
  const lift = startLift + (endLift - startLift) * progress;
  const stretch = 0.88 + progress * (compact ? 0.14 : 0.19);

  cheeseSection.style.setProperty("--cheese-lift", `${lift.toFixed(1)}px`);
  cheeseSection.style.setProperty("--cheese-stretch", stretch.toFixed(3));
  cheeseSection.style.setProperty("--cheese-progress", `${(progress * 100).toFixed(1)}%`);
};

const requestCheeseUpdate = () => {
  if (cheeseFrame) return;
  cheeseFrame = window.requestAnimationFrame(updateCheesePull);
};

updateCheesePull();
window.addEventListener("scroll", requestCheeseUpdate, { passive: true });
window.addEventListener("resize", requestCheeseUpdate);

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const selected = button.dataset.filter;

    filterButtons.forEach((candidate) => {
      const active = candidate === button;
      candidate.classList.toggle("is-active", active);
      candidate.setAttribute("aria-pressed", String(active));
    });

    menuCards.forEach((card) => {
      const visible = selected === "all" || card.dataset.category === selected;
      card.classList.toggle("is-hidden", !visible);
    });
  });
});

const finePointerQuery = window.matchMedia("(hover: hover) and (pointer: fine)");

menuHeatSurfaces.forEach((surface) => {
  let heatFrame = 0;
  let heatX = -500;
  let heatY = -500;

  const renderHeat = () => {
    heatFrame = 0;
    surface.style.setProperty("--heat-x", `${heatX.toFixed(1)}px`);
    surface.style.setProperty("--heat-y", `${heatY.toFixed(1)}px`);
  };

  surface.addEventListener("pointerenter", () => {
    if (!finePointerQuery.matches || reduceMotionQuery.matches) return;
    surface.style.setProperty("--heat-opacity", "1");
  });

  surface.addEventListener("pointermove", (event) => {
    if (!finePointerQuery.matches || reduceMotionQuery.matches) return;
    const bounds = surface.getBoundingClientRect();
    heatX = event.clientX - bounds.left;
    heatY = event.clientY - bounds.top;
    if (!heatFrame) heatFrame = window.requestAnimationFrame(renderHeat);
  });

  surface.addEventListener("pointerleave", () => {
    if (heatFrame) window.cancelAnimationFrame(heatFrame);
    heatFrame = 0;
    surface.style.setProperty("--heat-opacity", "0");
  });
});

let lightboxTrigger = null;

document.querySelectorAll("[data-lightbox]").forEach((button) => {
  button.addEventListener("click", () => {
    if (!lightbox || !lightboxImage) return;
    lightboxTrigger = button;
    lightboxImage.src = button.dataset.lightbox;
    lightboxImage.alt = button.querySelector("img")?.alt || "Foto del menú de Amadeli";
    lightbox.showModal();
  });
});

const closeLightbox = () => {
  if (!lightbox) return;
  lightbox.close();
  lightboxImage?.removeAttribute("src");
  lightboxTrigger?.focus();
};

lightboxClose?.addEventListener("click", closeLightbox);

lightbox?.addEventListener("click", (event) => {
  const bounds = lightbox.getBoundingClientRect();
  const clickedOutside =
    event.clientX < bounds.left ||
    event.clientX > bounds.right ||
    event.clientY < bounds.top ||
    event.clientY > bounds.bottom;

  if (clickedOutside) closeLightbox();
});

const revealItems = document.querySelectorAll(".reveal");

if ("IntersectionObserver" in window) {
  const revealObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -30px" }
  );

  revealItems.forEach((item) => revealObserver.observe(item));
} else {
  revealItems.forEach((item) => item.classList.add("is-visible"));
}
