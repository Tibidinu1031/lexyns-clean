const root = document.documentElement;
root.classList.add("js");

const menuButton = document.querySelector(".menu-toggle");
const navigation = document.querySelector("#navigation");
const header = document.querySelector(".site-header");
const progressBar = header.querySelector(".reading-progress");
const mobileCall = document.querySelector(".mobile-call");
const dialog = document.querySelector("#appointment-dialog");
const hero = document.querySelector(".hero");
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");
const isLite = () => root.classList.contains("lite");

// Coalesce pointer moves into one update per frame so fast mice don't flood style recalcs.
function onPointerFrame(element, handler) {
  let frame = 0,
    latest = null;
  element.addEventListener(
    "pointermove",
    (event) => {
      latest = event;
      if (!frame)
        frame = requestAnimationFrame(() => {
          frame = 0;
          handler(latest);
        });
    },
    { passive: true },
  );
  return () => {
    cancelAnimationFrame(frame);
    frame = 0;
  };
}

// Loading screen: shows the logo on the first page of a visit, then lifts away.
const loader = document.querySelector("#loader");
function runLoader() {
  if (root.classList.contains("no-loader")) {
    loader.remove();
    return;
  }
  const logo = loader.querySelector(".loader-logo");
  const bar = loader.querySelector(".loader-progress");
  const started = performance.now();
  const calm = reducedMotion.matches || isLite();
  const minimum = calm ? 400 : 1000;
  const scrollKeys = [" ", "ArrowDown", "ArrowUp", "PageDown", "PageUp", "Home", "End"];
  let loaded = 0,
    finished = false;
  const setLoad = (value) => {
    loaded = Math.max(loaded, value);
    bar.style.setProperty("--load", loaded.toFixed(3));
  };
  const creep = setInterval(() => setLoad(Math.min(0.9, loaded + 0.08)), 120);
  function blockScroll(event) {
    if (event.type === "keydown" && !scrollKeys.includes(event.key)) return;
    event.preventDefault();
    leave();
  }
  function leave() {
    if (finished) return;
    finished = true;
    clearInterval(creep);
    setLoad(1);
    window.removeEventListener("wheel", blockScroll);
    window.removeEventListener("touchmove", blockScroll);
    window.removeEventListener("keydown", blockScroll);
    loader.classList.add("leave");
    root.classList.add("intro-done");
    try {
      sessionStorage.setItem("lexyns-seen", "1");
    } catch {}
    setTimeout(() => loader.remove(), 800);
  }
  setLoad(0.2);
  document.fonts.ready.then(() => setLoad(0.6));
  const whenLoaded = () =>
    setTimeout(leave, Math.max(150, minimum - (performance.now() - started)));
  if (document.readyState === "complete") whenLoaded();
  else window.addEventListener("load", whenLoaded, { once: true });
  window.addEventListener("wheel", blockScroll, { passive: false });
  window.addEventListener("touchmove", blockScroll, { passive: false });
  window.addEventListener("keydown", blockScroll);
  loader.addEventListener("click", leave);
  if (calm) return;

  let lastSpark = 0;
  function spark(x, y, size = 10 + Math.random() * 14) {
    const element = document.createElement("span");
    element.className = "loader-spark";
    element.innerHTML = '<svg><use href="#i-spark" /></svg>';
    element.style.setProperty("--s", `${size}px`);
    element.style.setProperty("--x", `${x}px`);
    element.style.setProperty("--y", `${y}px`);
    element.style.setProperty("--dx", `${(Math.random() - 0.5) * 70}px`);
    element.style.setProperty("--dy", `${-20 - Math.random() * 60}px`);
    element.addEventListener("animationend", () => element.remove());
    loader.append(element);
  }
  onPointerFrame(loader, (event) => {
    const box = logo.getBoundingClientRect();
    const x = (event.clientX - (box.left + box.width / 2)) / innerWidth;
    const y = (event.clientY - (box.top + box.height / 2)) / innerHeight;
    logo.style.setProperty("--rx", `${(-y * 16).toFixed(2)}deg`);
    logo.style.setProperty("--ry", `${(x * 20).toFixed(2)}deg`);
    if (event.timeStamp - lastSpark > 70) {
      lastSpark = event.timeStamp;
      spark(event.clientX, event.clientY);
    }
  });
  loader.addEventListener("pointerdown", (event) => {
    for (let index = 0; index < 6; index++)
      spark(event.clientX, event.clientY, 12 + Math.random() * 18);
  });
}
if (loader) runLoader();

function closeMenu() {
  menuButton.setAttribute("aria-expanded", "false");
  menuButton.setAttribute("aria-label", "Deschide meniul");
  navigation.classList.remove("open");
}

menuButton.addEventListener("click", () => {
  const open = menuButton.getAttribute("aria-expanded") !== "true";
  menuButton.setAttribute("aria-expanded", String(open));
  menuButton.setAttribute(
    "aria-label",
    open ? "Închide meniul" : "Deschide meniul",
  );
  navigation.classList.toggle("open", open);
});

navigation
  .querySelectorAll("a")
  .forEach((link) => link.addEventListener("click", closeMenu));
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && navigation.classList.contains("open")) {
    closeMenu();
    menuButton.focus();
  }
});
document.addEventListener("click", (event) => {
  if (!event.target.closest(".site-header")) closeMenu();
});
header.addEventListener("focusout", (event) => {
  if (event.relatedTarget && !header.contains(event.relatedTarget)) closeMenu();
});

// Quote builder: composes an SMS so visitors can ask for an offer without a backend.
const quoteForm = dialog.querySelector(".quote");
const quoteArea = quoteForm.elements.area;
const quoteAreaValue = dialog.querySelector("#quote-area-value");
const quoteMessage = dialog.querySelector("#quote-message");
const quoteSms = dialog.querySelector("#quote-sms");
function updateQuote() {
  const service = quoteForm.elements.service.value;
  const frequency = quoteForm.elements.frequency.value;
  const fill = (quoteArea.value - quoteArea.min) / (quoteArea.max - quoteArea.min);
  quoteAreaValue.textContent = `${quoteArea.value} m²`;
  quoteArea.style.setProperty("--fill", `${fill * 100}%`);
  const message = `Bună ziua! Aș dori o ofertă pentru ${service.toLowerCase()}, aproximativ ${quoteArea.value} m², ${frequency}. Mulțumesc!`;
  quoteMessage.textContent = message;
  quoteSms.href = `sms:+40754679238?&body=${encodeURIComponent(message)}`;
}
quoteForm.addEventListener("input", updateQuote);
quoteForm.addEventListener("submit", (event) => event.preventDefault());
updateQuote();

// Phone bar: only between the hero and the contact section, and never over the dialog.
let heroInView = true,
  contactNear = false;
function updateMobileCall() {
  mobileCall.classList.toggle(
    "visible",
    !heroInView && !contactNear && !dialog.open,
  );
}

// Keep telephone links functional when JavaScript or native dialogs are unavailable.
if (typeof dialog.showModal === "function") {
  document.querySelectorAll("[data-appointment]").forEach((link) => {
    link.addEventListener("click", (event) => {
      if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey)
        return;
      event.preventDefault();
      const service = [...quoteForm.elements.service].find(
        (radio) => radio.value === link.dataset.service,
      );
      if (service) {
        service.checked = true;
        updateQuote();
      }
      closeMenu();
      dialog.showModal();
      root.classList.add("dialog-open");
      updateMobileCall();
    });
  });
  dialog
    .querySelector(".dialog-close")
    .addEventListener("click", () => dialog.close());
  dialog.addEventListener("click", (event) => {
    const box = dialog.getBoundingClientRect();
    if (
      event.target === dialog &&
      (event.clientX < box.left ||
        event.clientX > box.right ||
        event.clientY < box.top ||
        event.clientY > box.bottom)
    )
      dialog.close();
  });
  dialog.addEventListener("keydown", (event) => {
    if (event.key !== "Tab") return;
    const controls = [
      ...dialog.querySelectorAll(
        "a[href], button:not([disabled]), input:not([type='radio']), input[type='radio']:checked",
      ),
    ];
    const first = controls[0],
      last = controls.at(-1);
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  });
  dialog.addEventListener("close", () => {
    root.classList.remove("dialog-open");
    updateMobileCall();
  });
}

document.querySelectorAll(".copy-button").forEach((button) => {
  const label = button.querySelector("span");
  const original = label.textContent;
  let timer;
  button.addEventListener("click", async () => {
    const text =
      button.dataset.copy ??
      document.querySelector(button.dataset.copyTarget).textContent;
    try {
      await navigator.clipboard.writeText(text);
      label.textContent = "Copiat!";
      button.classList.add("copied");
    } catch {
      label.textContent = "Copiază manual";
    }
    clearTimeout(timer);
    timer = setTimeout(() => {
      label.textContent = original;
      button.classList.remove("copied");
    }, 2000);
  });
});

// Observers replace per-frame layout reads: the scroll handler below only moves the progress bar.
const sectionLinks = [...navigation.querySelectorAll('a[href^="#"]')];
const sections = sectionLinks.map((link) =>
  document.querySelector(link.getAttribute("href")),
);
const sectionsInBand = new Set();
const sectionObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) =>
      entry.isIntersecting
        ? sectionsInBand.add(entry.target)
        : sectionsInBand.delete(entry.target),
    );
    sectionLinks.forEach((link, index) => {
      if (sectionsInBand.has(sections[index]))
        link.setAttribute("aria-current", "location");
      else link.removeAttribute("aria-current");
    });
  },
  { rootMargin: "-30% 0px -69% 0px" },
);
sections.forEach((section) => sectionObserver.observe(section));

new IntersectionObserver(([entry]) => {
  heroInView = entry.isIntersecting;
  hero.classList.toggle("paused", !heroInView);
  updateMobileCall();
}).observe(hero);
new IntersectionObserver(
  ([entry]) => {
    contactNear = entry.isIntersecting || entry.boundingClientRect.top < 0;
    updateMobileCall();
  },
  { rootMargin: "0px 0px -25% 0px" },
).observe(document.querySelector("#contact"));
const marquee = document.querySelector(".marquee");
new IntersectionObserver(([entry]) =>
  marquee.classList.toggle("paused", !entry.isIntersecting),
).observe(marquee);

const steps = document.querySelector("#steps");
const stepItems = [...steps.querySelectorAll(".step")];
let stepsNear = false;
function updateSteps() {
  const box = steps.getBoundingClientRect();
  const progress = Math.min(
    1,
    Math.max(0, (innerHeight * 0.8 - box.top) / (innerHeight * 0.2 + box.height)),
  );
  steps.style.setProperty("--progress", progress.toFixed(3));
  stepItems.forEach((step, index) =>
    step.classList.toggle(
      "active",
      progress > 0.02 && progress >= (index / (stepItems.length - 1)) * 0.96,
    ),
  );
}
new IntersectionObserver(
  ([entry]) => {
    stepsNear = entry.isIntersecting;
    updateSteps();
  },
  { rootMargin: "120px 0px" },
).observe(document.querySelector("#cum-lucram"));

let scheduled = false,
  scrolled = false;
function updateScroll() {
  const y = scrollY;
  const range = root.scrollHeight - innerHeight;
  if (stepsNear) updateSteps();
  if (y > 50 !== scrolled) {
    scrolled = y > 50;
    header.classList.toggle("scrolled", scrolled);
  }
  progressBar.style.transform = `scaleX(${range > 0 ? Math.min(1, y / range).toFixed(4) : 0})`;
  scheduled = false;
}
window.addEventListener(
  "scroll",
  () => {
    if (!scheduled) {
      scheduled = true;
      requestAnimationFrame(updateScroll);
    }
  },
  { passive: true },
);
updateScroll();

const track = document.querySelector("#rooms-track");
const previous = document.querySelector("#rooms-prev");
const next = document.querySelector("#rooms-next");
const position = document.querySelector("#rooms-position");
const rooms = [...track.querySelectorAll(".room")];
function moveRooms(direction) {
  const step =
    rooms[0].getBoundingClientRect().width +
    parseFloat(getComputedStyle(track).gap);
  track.scrollBy({
    left: direction * step,
    behavior: reducedMotion.matches || isLite() ? "instant" : "smooth",
  });
}
function updateRooms() {
  previous.disabled = track.scrollLeft < 5;
  next.disabled = track.scrollLeft + track.clientWidth >= track.scrollWidth - 5;
  const viewport = track.getBoundingClientRect();
  const visible = rooms
    .map((room, index) => ({ index, box: room.getBoundingClientRect() }))
    .filter(
      ({ box }) =>
        Math.min(box.right, viewport.right) -
          Math.max(box.left, viewport.left) >
        box.width * 0.6,
    );
  if (visible.length) {
    const pad = (number) => String(number).padStart(2, "0");
    const first = visible[0].index + 1;
    const last = visible.at(-1).index + 1;
    const label = `${pad(first)}${first === last ? "" : " — " + pad(last)} / ${pad(rooms.length)}`;
    if (position.textContent !== label) position.textContent = label;
  }
}
previous.addEventListener("click", () => moveRooms(-1));
next.addEventListener("click", () => moveRooms(1));
track.addEventListener("scroll", updateRooms, { passive: true });
track.addEventListener("keydown", (event) => {
  if (
    event.target === track &&
    (event.key === "ArrowRight" || event.key === "ArrowLeft")
  ) {
    event.preventDefault();
    moveRooms(event.key === "ArrowRight" ? 1 : -1);
  }
});
window.addEventListener("resize", () => {
  updateRooms();
  updateScroll();
  if (innerWidth > 1024) closeMenu();
});
updateRooms();
document.fonts.ready.then(updateRooms);
document.querySelector("#year").textContent = new Date().getFullYear();

// Pointer effects: magnetic buttons, tilting cards and hero parallax. Transforms only, never repaints.
if (finePointer.matches && !reducedMotion.matches) {
  document.querySelectorAll("[data-magnetic]").forEach((element) => {
    const cancel = onPointerFrame(element, (event) => {
      if (isLite()) return;
      const box = element.getBoundingClientRect();
      const x = (event.clientX - box.left) / box.width - 0.5;
      const y = (event.clientY - box.top) / box.height - 0.5;
      element.style.setProperty("--mx", `${(x * 12).toFixed(2)}px`);
      element.style.setProperty("--my", `${(y * 10).toFixed(2)}px`);
    });
    element.addEventListener("pointerleave", () => {
      cancel();
      element.style.setProperty("--mx", "0px");
      element.style.setProperty("--my", "0px");
    });
  });
  document.querySelectorAll("[data-tilt]").forEach((element) => {
    const cancel = onPointerFrame(element, (event) => {
      if (isLite()) return;
      const box = element.getBoundingClientRect();
      const x = (event.clientX - box.left) / box.width - 0.5;
      const y = (event.clientY - box.top) / box.height - 0.5;
      element.style.setProperty("--rx", `${(-y * 8).toFixed(2)}deg`);
      element.style.setProperty("--ry", `${(x * 10).toFixed(2)}deg`);
    });
    element.addEventListener("pointerleave", () => {
      cancel();
      element.style.setProperty("--rx", "0deg");
      element.style.setProperty("--ry", "0deg");
    });
  });
  const visual = document.querySelector("[data-parallax]");
  const cancelParallax = onPointerFrame(visual, (event) => {
    if (isLite()) return;
    const box = visual.getBoundingClientRect();
    visual.style.setProperty(
      "--px",
      (((event.clientX - box.left) / box.width - 0.5) * 2).toFixed(3),
    );
    visual.style.setProperty(
      "--py",
      (((event.clientY - box.top) / box.height - 0.5) * 2).toFixed(3),
    );
  });
  visual.addEventListener("pointerleave", () => {
    cancelParallax();
    visual.style.setProperty("--px", 0);
    visual.style.setProperty("--py", 0);
  });
}

// Soap bubbles float up the hero; hovering or tapping one pops it.
const bubbleLayer = document.querySelector(".bubbles");
const bubbleHint = document.querySelector(".bubble-hint");
function spawnBubble(initial = false) {
  if (isLite()) return;
  const bubble = document.createElement("span");
  const duration = 11 + Math.random() * 9;
  bubble.className = "bubble";
  bubble.style.setProperty("--s", `${18 + Math.random() * 40}px`);
  bubble.style.setProperty("--x", `${4 + Math.random() * 88}%`);
  bubble.style.setProperty("--t", `${duration}s`);
  bubble.style.setProperty("--sway", `${(Math.random() - 0.5) * 80}px`);
  bubble.style.setProperty("--rise", `${-(bubbleLayer.clientHeight + 160)}px`);
  if (initial) bubble.style.animationDelay = `${-Math.random() * duration}s`;
  bubble.addEventListener("animationend", (event) => {
    if (event.animationName !== "rise") return;
    bubble.remove();
    spawnBubble();
  });
  bubble.addEventListener("pointerenter", () => popBubble(bubble));
  bubble.addEventListener("pointerdown", () => popBubble(bubble));
  bubbleLayer.append(bubble);
}
function popBubble(bubble) {
  if (bubble.classList.contains("pop")) return;
  bubble.style.transform = getComputedStyle(bubble).transform;
  bubble.style.animationDelay = "0s";
  bubble.classList.add("pop");
  bubbleHint.classList.add("hide");
  setTimeout(() => {
    bubble.remove();
    spawnBubble();
  }, 1400);
}
if (!reducedMotion.matches && innerWidth > 640)
  for (let index = 0; index < 4; index++) spawnBubble(true);
else bubbleHint.classList.add("hide");

const checklist = [...document.querySelectorAll(".checklist span")];
let checklistIndex = 0;
function tickChecklist() {
  if (hero.classList.contains("paused")) {
    setTimeout(tickChecklist, 1000);
  } else if (checklistIndex < checklist.length) {
    checklist[checklistIndex++].classList.add("done");
    setTimeout(tickChecklist, 850);
  } else {
    setTimeout(() => {
      checklist.forEach((item) => item.classList.remove("done"));
      checklistIndex = 0;
      setTimeout(tickChecklist, 700);
    }, 2600);
  }
}
if (reducedMotion.matches)
  checklist.forEach((item) => item.classList.add("done"));
else setTimeout(tickChecklist, 1200);

// Before & after: rub the grime off a canvas laid over the clean window.
const wipeSection = document.querySelector("#inainte-dupa");
const wipeStage = document.querySelector("#wipe-stage");
const wipeCanvas = wipeStage.querySelector("canvas");
const wipeContext = wipeCanvas.getContext("2d");
const wipePercent = document.querySelector("#wipe-percent");
const wipeStatus = document.querySelector("#wipe-status");
const wipeAuto = document.querySelector("#wipe-auto");
const wipeReset = document.querySelector("#wipe-reset");
const wipeCells = { columns: 32, rows: 24 };
let wipeGrid = new Uint8Array(wipeCells.columns * wipeCells.rows);
let wipeCleaned = 0,
  wipeWidth = 0,
  wipeHeight = 0,
  wipeLast = null,
  wipeDone = false,
  wipeFrame = 0,
  wipeBrush = null;
const brushRadius = () => Math.max(24, wipeWidth * 0.055);

function paintGrime() {
  cancelAnimationFrame(wipeFrame);
  const box = wipeStage.getBoundingClientRect();
  const ratio = Math.min(window.devicePixelRatio || 1, 1.25);
  const context = wipeContext;
  wipeWidth = box.width;
  wipeHeight = box.height;
  wipeCanvas.width = Math.round(wipeWidth * ratio);
  wipeCanvas.height = Math.round(wipeHeight * ratio);
  context.setTransform(ratio, 0, 0, ratio, 0, 0);
  context.globalCompositeOperation = "source-over";
  const film = context.createLinearGradient(0, 0, wipeWidth, wipeHeight);
  film.addColorStop(0, "rgba(112, 96, 70, 0.92)");
  film.addColorStop(0.55, "rgba(140, 124, 94, 0.88)");
  film.addColorStop(1, "rgba(98, 84, 62, 0.94)");
  context.fillStyle = film;
  context.fillRect(0, 0, wipeWidth, wipeHeight);
  for (let index = 0; index < 14; index++) {
    const x = Math.random() * wipeWidth;
    const y = Math.random() * wipeHeight;
    const radius = 40 + Math.random() * 110;
    const blotch = context.createRadialGradient(x, y, 0, x, y, radius);
    blotch.addColorStop(
      0,
      Math.random() > 0.4 ? "rgba(62, 50, 34, 0.35)" : "rgba(196, 182, 150, 0.3)",
    );
    blotch.addColorStop(1, "rgba(0, 0, 0, 0)");
    context.fillStyle = blotch;
    context.fillRect(x - radius, y - radius, radius * 2, radius * 2);
  }
  for (let index = 0; index < 500; index++) {
    const size = Math.random() * 2.6;
    context.fillStyle =
      Math.random() > 0.5 ? "rgba(50, 40, 26, 0.4)" : "rgba(214, 200, 168, 0.3)";
    context.fillRect(Math.random() * wipeWidth, Math.random() * wipeHeight, size, size);
  }
  for (let index = 0; index < 10; index++) {
    const x = Math.random() * wipeWidth;
    const y = Math.random() * wipeHeight * 0.6;
    const length = 40 + Math.random() * 140;
    const drip = context.createLinearGradient(0, y, 0, y + length);
    drip.addColorStop(0, "rgba(214, 200, 168, 0)");
    drip.addColorStop(1, "rgba(214, 200, 168, 0.38)");
    context.fillStyle = drip;
    context.fillRect(x, y, 1.5 + Math.random() * 2.5, length);
  }
  context.globalCompositeOperation = "destination-out";
  context.font = `800 ${Math.round(Math.max(26, wipeWidth * 0.08))}px Manrope, sans-serif`;
  context.textAlign = "center";
  context.textBaseline = "middle";
  context.fillStyle = "rgba(0, 0, 0, 0.5)";
  context.fillText("ȘTERGE-MĂ ✦", wipeWidth / 2, wipeHeight * 0.46);
  // One pre-rendered soft brush is much cheaper than a new gradient for every stamp.
  const brushSize = Math.ceil(brushRadius() * 2 * ratio);
  wipeBrush = document.createElement("canvas");
  wipeBrush.width = wipeBrush.height = brushSize;
  const brushContext = wipeBrush.getContext("2d");
  const soft = brushContext.createRadialGradient(
    brushSize / 2,
    brushSize / 2,
    brushSize * 0.1,
    brushSize / 2,
    brushSize / 2,
    brushSize / 2,
  );
  soft.addColorStop(0, "rgba(0, 0, 0, 1)");
  soft.addColorStop(1, "rgba(0, 0, 0, 0)");
  brushContext.fillStyle = soft;
  brushContext.fillRect(0, 0, brushSize, brushSize);
  wipeGrid = new Uint8Array(wipeCells.columns * wipeCells.rows);
  wipeCleaned = 0;
  wipeDone = false;
  wipeLast = null;
  wipeStage.classList.remove("clean");
  wipeAuto.disabled = false;
  wipeStatus.textContent = "";
  updateWipeMeter();
}
function wipeAt(x, y) {
  const radius = brushRadius();
  wipeContext.drawImage(wipeBrush, x - radius, y - radius, radius * 2, radius * 2);
  const cellWidth = wipeWidth / wipeCells.columns;
  const cellHeight = wipeHeight / wipeCells.rows;
  const reach = radius * 0.75;
  const firstColumn = Math.max(0, Math.floor((x - reach) / cellWidth));
  const lastColumn = Math.min(wipeCells.columns - 1, Math.floor((x + reach) / cellWidth));
  const firstRow = Math.max(0, Math.floor((y - reach) / cellHeight));
  const lastRow = Math.min(wipeCells.rows - 1, Math.floor((y + reach) / cellHeight));
  for (let row = firstRow; row <= lastRow; row++) {
    for (let column = firstColumn; column <= lastColumn; column++) {
      const index = row * wipeCells.columns + column;
      if (wipeGrid[index]) continue;
      const centerX = (column + 0.5) * cellWidth;
      const centerY = (row + 0.5) * cellHeight;
      if (Math.hypot(centerX - x, centerY - y) <= reach) {
        wipeGrid[index] = 1;
        wipeCleaned++;
      }
    }
  }
}
function wipeTo(x, y) {
  if (wipeDone || !wipeBrush) return;
  wipeContext.globalCompositeOperation = "destination-out";
  if (wipeLast) {
    const distance = Math.hypot(x - wipeLast.x, y - wipeLast.y);
    const count = Math.max(1, Math.ceil(distance / (brushRadius() * 0.3)));
    for (let index = 1; index <= count; index++)
      wipeAt(
        wipeLast.x + ((x - wipeLast.x) * index) / count,
        wipeLast.y + ((y - wipeLast.y) * index) / count,
      );
  } else wipeAt(x, y);
  wipeLast = { x, y };
  wipeStage.classList.add("touched");
  updateWipeMeter();
}
function updateWipeMeter() {
  const cleaned = wipeCleaned / wipeGrid.length;
  const shown = wipeDone ? 100 : Math.min(99, Math.round((cleaned / 0.8) * 100));
  wipePercent.textContent = `${shown}%`;
  wipeSection.style.setProperty("--clean", shown);
  if (!wipeDone && cleaned >= 0.8) finishWipe();
}
function finishWipe() {
  wipeDone = true;
  cancelAnimationFrame(wipeFrame);
  wipeStage.classList.add("clean", "touched");
  wipeAuto.disabled = true;
  wipePercent.textContent = "100%";
  wipeSection.style.setProperty("--clean", 100);
  wipeStatus.textContent = "Geamul este curat.";
  setTimeout(() => {
    if (!wipeDone) return;
    wipeContext.globalCompositeOperation = "source-over";
    wipeContext.clearRect(0, 0, wipeWidth, wipeHeight);
  }, 900);
}
function wipePoint(event) {
  const box = wipeCanvas.getBoundingClientRect();
  return [event.clientX - box.left, event.clientY - box.top];
}
const wipeCursor = document.createElement("span");
wipeCursor.className = "wipe-cursor";
wipeCursor.setAttribute("aria-hidden", "true");
wipeStage.append(wipeCursor);
if (finePointer.matches) wipeStage.classList.add("has-cursor");
onPointerFrame(wipeCanvas, (event) => {
  const [x, y] = wipePoint(event);
  wipeCursor.style.transform = `translate3d(${x}px, ${y}px, 0)`;
  if (event.pointerType === "mouse" || event.buttons) wipeTo(x, y);
});
wipeCanvas.addEventListener("pointerdown", (event) => {
  wipeLast = null;
  wipeTo(...wipePoint(event));
});
["pointerleave", "pointerup", "pointercancel"].forEach((type) =>
  wipeCanvas.addEventListener(type, () => (wipeLast = null)),
);
wipeAuto.addEventListener("click", () => {
  if (wipeDone) return;
  if (reducedMotion.matches) {
    finishWipe();
    return;
  }
  wipeAuto.disabled = true;
  const radius = brushRadius();
  const speed = Math.max(16, wipeWidth / 18);
  let x = -radius,
    y = radius * 0.6,
    direction = 1;
  wipeLast = null;
  const sweep = () => {
    x += speed * direction;
    if (x > wipeWidth + radius || x < -radius) {
      direction *= -1;
      y += radius * 1.1;
    }
    if (y > wipeHeight + radius) {
      finishWipe();
      return;
    }
    wipeTo(x, y);
    if (!wipeDone) wipeFrame = requestAnimationFrame(sweep);
  };
  wipeFrame = requestAnimationFrame(sweep);
});
wipeReset.addEventListener("click", paintGrime);
// The grime is only painted when the window is about to scroll into view.
new IntersectionObserver(
  ([entry], observer) => {
    if (!entry.isIntersecting) return;
    observer.disconnect();
    document.fonts.ready.then(() => {
      paintGrime();
      new ResizeObserver(() => {
        if (Math.abs(wipeStage.clientWidth - wipeWidth) > 1) paintGrime();
      }).observe(wipeStage);
    });
  },
  { rootMargin: "600px 0px" },
).observe(wipeStage);

function countUp(element) {
  const target = Number(element.dataset.count);
  const decimals = Number(element.dataset.decimals || 0);
  const format = (value) => value.toFixed(decimals).replace(".", ",");
  const start = performance.now();
  const frame = (now) => {
    const progress = Math.min(1, (now - start) / 900);
    element.textContent = format(target * (1 - Math.pow(1 - progress, 3)));
    if (progress < 1) requestAnimationFrame(frame);
  };
  element.textContent = format(0);
  requestAnimationFrame(frame);
}

if (!reducedMotion.matches && !isLite()) {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          if (!isLite()) entry.target.querySelectorAll("[data-count]").forEach(countUp);
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.08 },
  );
  document
    .querySelectorAll(".intro-grid, .section-heading, .wipe-copy, .step")
    .forEach((element) => {
      if (element.matches(".step"))
        element.style.setProperty("--delay", `${stepItems.indexOf(element) * 0.1}s`);
      element.classList.add("reveal");
      observer.observe(element);
    });
  observer.observe(document.querySelector(".stats"));
}

// Light mode: devices drawing everything on the CPU, or stuck at a low frame rate, drop background motion.
// Add ?full to the address to see every effect anyway.
function goLite() {
  root.classList.add("lite");
  bubbleLayer.replaceChildren();
  try {
    localStorage.setItem("lexyns-lite", "1");
  } catch {}
}
function softwareRendering() {
  const gl = document.createElement("canvas").getContext("webgl");
  if (!gl) return true;
  const info = gl.getExtension("WEBGL_debug_renderer_info");
  const name = info ? gl.getParameter(info.UNMASKED_RENDERER_WEBGL) : "";
  gl.getExtension("WEBGL_lose_context")?.loseContext();
  return /basic render|swiftshader|llvmpipe|software/i.test(name);
}
function probeFrameRate() {
  let frames = 0,
    slow = 0,
    last = performance.now();
  const frame = (now) => {
    const delta = now - last;
    last = now;
    if (document.visibilityState === "visible" && delta < 500) {
      frames++;
      if (delta > 40) slow++;
    }
    if (frames < 90) requestAnimationFrame(frame);
    else if (slow / frames > 0.3) goLite();
  };
  requestAnimationFrame(frame);
}
if (!isLite() && !reducedMotion.matches && !location.search.includes("full"))
  window.addEventListener(
    "load",
    () =>
      setTimeout(() => {
        if (softwareRendering()) goLite();
        else probeFrameRate();
      }, 1800),
    { once: true },
  );
