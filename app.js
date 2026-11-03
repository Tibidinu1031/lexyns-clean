document.documentElement.classList.add("js");

const menuButton = document.querySelector(".menu-toggle");
const navigation = document.querySelector("#navigation");
const header = document.querySelector(".site-header");
const mobileCall = document.querySelector(".mobile-call");
const dialog = document.querySelector("#appointment-dialog");
const ambient = document.querySelector(".ambient");
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");

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
      mobileCall.classList.remove("visible");
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
  dialog.addEventListener("close", updateScroll);
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

const sectionLinks = [...navigation.querySelectorAll('a[href^="#"]')];
const sections = sectionLinks.map((link) =>
  document.querySelector(link.getAttribute("href")),
);
const contact = document.querySelector("#contact");
const steps = document.querySelector("#steps");
const stepItems = [...steps.querySelectorAll(".step")];
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
let scheduled = false;
function updateScroll() {
  header.classList.toggle("scrolled", scrollY > 50);
  const range = document.documentElement.scrollHeight - innerHeight;
  header.style.setProperty(
    "--reading-progress",
    range > 0 ? Math.min(1, scrollY / range) : 0,
  );
  ambient.style.setProperty("--shift", `${(-scrollY * 0.12).toFixed(1)}px`);
  const contactVisible =
    contact.getBoundingClientRect().top < innerHeight * 0.75;
  mobileCall.classList.toggle(
    "visible",
    scrollY > 580 && !contactVisible && !dialog.open,
  );
  let current = null;
  sections.forEach((section, index) => {
    if (section.getBoundingClientRect().top <= header.offsetHeight + 150)
      current = index;
  });
  sectionLinks.forEach((link, index) => {
    if (index === current) link.setAttribute("aria-current", "location");
    else link.removeAttribute("aria-current");
  });
  updateSteps();
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
    behavior: reducedMotion.matches ? "instant" : "smooth",
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

// Pointer effects: magnetic buttons, spotlights, tilting cards and hero parallax.
if (finePointer.matches && !reducedMotion.matches) {
  document.querySelectorAll("[data-magnetic]").forEach((element) => {
    element.addEventListener("pointermove", (event) => {
      const box = element.getBoundingClientRect();
      const x = event.clientX - box.left;
      const y = event.clientY - box.top;
      element.style.setProperty("--sx", `${x}px`);
      element.style.setProperty("--sy", `${y}px`);
      element.style.setProperty("--mx", `${(x / box.width - 0.5) * 12}px`);
      element.style.setProperty("--my", `${(y / box.height - 0.5) * 10}px`);
    });
    element.addEventListener("pointerleave", () => {
      element.style.setProperty("--mx", "0px");
      element.style.setProperty("--my", "0px");
    });
  });
  document.querySelectorAll("[data-spotlight]").forEach((element) => {
    element.addEventListener("pointermove", (event) => {
      const box = element.getBoundingClientRect();
      element.style.setProperty("--spot-x", `${event.clientX - box.left}px`);
      element.style.setProperty("--spot-y", `${event.clientY - box.top}px`);
    });
  });
  document.querySelectorAll("[data-tilt]").forEach((element) => {
    element.addEventListener("pointermove", (event) => {
      const box = element.getBoundingClientRect();
      const x = (event.clientX - box.left) / box.width - 0.5;
      const y = (event.clientY - box.top) / box.height - 0.5;
      element.style.setProperty("--rx", `${(-y * 8).toFixed(2)}deg`);
      element.style.setProperty("--ry", `${(x * 10).toFixed(2)}deg`);
    });
    element.addEventListener("pointerleave", () => {
      element.style.setProperty("--rx", "0deg");
      element.style.setProperty("--ry", "0deg");
    });
  });
  const visual = document.querySelector("[data-parallax]");
  visual.addEventListener("pointermove", (event) => {
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
    visual.style.setProperty("--px", 0);
    visual.style.setProperty("--py", 0);
  });
}

// Soap bubbles float up the hero; hovering or tapping one pops it.
const bubbleLayer = document.querySelector(".bubbles");
const bubbleHint = document.querySelector(".bubble-hint");
function spawnBubble(initial = false) {
  const bubble = document.createElement("span");
  const duration = 9 + Math.random() * 9;
  bubble.className = "bubble";
  bubble.style.setProperty("--s", `${16 + Math.random() * 46}px`);
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
if (!reducedMotion.matches) {
  const count = innerWidth < 640 ? 7 : 12;
  for (let index = 0; index < count; index++) spawnBubble(true);
  if ("IntersectionObserver" in window)
    new IntersectionObserver(([entry]) =>
      bubbleLayer.classList.toggle("paused", !entry.isIntersecting),
    ).observe(bubbleLayer);
} else bubbleHint.classList.add("hide");

const checklist = [...document.querySelectorAll(".checklist span")];
let checklistIndex = 0;
function tickChecklist() {
  if (checklistIndex < checklist.length) {
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
  wipeFrame = 0;
const brushRadius = () => Math.max(24, wipeWidth * 0.055);

function paintGrime() {
  cancelAnimationFrame(wipeFrame);
  const box = wipeStage.getBoundingClientRect();
  const ratio = Math.min(window.devicePixelRatio || 1, 2);
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
  for (let index = 0; index < 28; index++) {
    const x = Math.random() * wipeWidth;
    const y = Math.random() * wipeHeight;
    const radius = 30 + Math.random() * 120;
    const blotch = context.createRadialGradient(x, y, 0, x, y, radius);
    blotch.addColorStop(
      0,
      Math.random() > 0.4 ? "rgba(62, 50, 34, 0.35)" : "rgba(196, 182, 150, 0.3)",
    );
    blotch.addColorStop(1, "rgba(0, 0, 0, 0)");
    context.fillStyle = blotch;
    context.fillRect(x - radius, y - radius, radius * 2, radius * 2);
  }
  for (let index = 0; index < 1400; index++) {
    const size = Math.random() * 2.6;
    context.fillStyle =
      Math.random() > 0.5 ? "rgba(50, 40, 26, 0.4)" : "rgba(214, 200, 168, 0.3)";
    context.fillRect(Math.random() * wipeWidth, Math.random() * wipeHeight, size, size);
  }
  for (let index = 0; index < 18; index++) {
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
  context.globalCompositeOperation = "source-over";
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
  const brush = wipeContext.createRadialGradient(x, y, radius * 0.2, x, y, radius);
  brush.addColorStop(0, "rgba(0, 0, 0, 1)");
  brush.addColorStop(1, "rgba(0, 0, 0, 0)");
  wipeContext.globalCompositeOperation = "destination-out";
  wipeContext.fillStyle = brush;
  wipeContext.beginPath();
  wipeContext.arc(x, y, radius, 0, Math.PI * 2);
  wipeContext.fill();
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
  if (wipeDone) return;
  if (wipeLast) {
    const distance = Math.hypot(x - wipeLast.x, y - wipeLast.y);
    const count = Math.max(1, Math.ceil(distance / 6));
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
    if (wipeDone) wipeContext.clearRect(0, 0, wipeWidth, wipeHeight);
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
wipeCanvas.addEventListener("pointermove", (event) => {
  const [x, y] = wipePoint(event);
  wipeCursor.style.transform = `translate(${x}px, ${y}px)`;
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
if ("ResizeObserver" in window)
  new ResizeObserver(() => {
    if (Math.abs(wipeStage.clientWidth - wipeWidth) > 1) paintGrime();
  }).observe(wipeStage);
else paintGrime();
document.fonts.ready.then(() => {
  if (!wipeCleaned) paintGrime();
});

function countUp(element) {
  const target = Number(element.dataset.count);
  const decimals = Number(element.dataset.decimals || 0);
  const format = (value) => value.toFixed(decimals).replace(".", ",");
  const start = performance.now();
  const frame = (now) => {
    const progress = Math.min(1, (now - start) / 1400);
    element.textContent = format(target * (1 - Math.pow(1 - progress, 3)));
    if (progress < 1) requestAnimationFrame(frame);
  };
  element.textContent = format(0);
  requestAnimationFrame(frame);
}

if ("IntersectionObserver" in window && !reducedMotion.matches) {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          entry.target.querySelectorAll("[data-count]").forEach(countUp);
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.08 },
  );
  document
    .querySelectorAll(
      ".intro-grid, .stats, .section-heading, .service-list, .rooms-track, .wipe-copy, .wipe-stage, .step, .contact-grid, .footer-word",
    )
    .forEach((element) => {
      if (element.matches(".step"))
        element.style.setProperty("--delay", `${stepItems.indexOf(element) * 0.12}s`);
      element.classList.add("reveal");
      observer.observe(element);
    });
}
