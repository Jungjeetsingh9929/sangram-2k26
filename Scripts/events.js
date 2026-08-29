const eventsPath = "Data/events2026.json";
let events = [];

const evtSec = document.querySelector(".events");
const evtsCont = document.getElementById("events-cont");
const evtsDotsCont = document.getElementById("event-dots-cont");
const evtArrLeft = document.getElementById("evt-arrow-left");
const evtArrRight = document.getElementById("evt-arrow-right");
const touchThreshold = 70;
const carouselCycles = 2;

let amountDisplay = parseInt(
  getComputedStyle(evtSec).getPropertyValue("--numDisplay")
);
let lengths = amountDisplay === 0 ? 4 : amountDisplay;

let evtActive = 0,
  evtElems = [],
  evtDots = [],
  touchstartX = 0,
  touchendX = 0,
  i = 0;

const initEvtElems = () => {
  evtElems = [];
  evtDots = [];
  evtActive = 0;
  i = 0;
  for (let num = 0; num < carouselCycles; num++) {
    for (let event of events) {
      let evtElem = document.createElement("div");
      evtElem.classList.add("evt");
      evtElem.id = i.toString();
      evtElem.style.backgroundImage = `url("Assets/sports/${event.imageKey}_logo.svg"), linear-gradient(135deg, rgba(255, 245, 214, 0.96), rgba(255, 255, 255, 0.88) 45%, rgba(236, 49, 47, 0.24))`;
      i++;
      let evtImg = document.createElement("img");
      evtImg.classList.add("evt-logo");
      evtImg.src = `Assets/sports/${event.imageKey}_logo.svg`;
      evtImg.alt = `${event.name} event`;
      let evtLabel = document.createElement("div");
      evtLabel.classList.add("evt-label");
      evtLabel.textContent = event.name;
      let evtTitle = document.createElement("div");
      evtTitle.classList.add("evt-label-cont");
      evtTitle.appendChild(evtImg);
      evtTitle.appendChild(evtLabel);
      evtElem.appendChild(evtTitle);
      evtElems.push(evtElem);
    }
  }

  let dotsCount = Math.ceil(events.length / lengths);

  for (let i = 0; i < dotsCount; i++) {
    let dot = document.createElement("div");
    dot.classList.add("event-dot");
    evtDots.push(dot);
    dot.addEventListener("click", (evt) => {
      let lastDot = evtDots.indexOf(
        evtDots.find((dot) => dot.classList.contains("evt-dot-active"))
      );
      let idx = evtDots.indexOf(evt.target);
      evtActive += (idx - lastDot) * lengths;
      setActive();
      clearInterval(eventInterval);
      eventInterval = setInterval(appendActive, 3000);
    });
  }
  evtsCont.replaceChildren(...evtElems);
  evtsDotsCont.replaceChildren(...evtDots);
  setActive();
};

const setActive = () => {
  if (evtDots.length === 0) return;
  normalizeActive();

  evtElems.forEach((elem, idx) => {
    let dot = evtDots[Math.floor(idx / lengths) % evtDots.length];
    let id = parseInt(elem.id);
    if (elem.classList.contains("evt-active")) {
      elem.classList.remove("evt-active");
    }
    if (elem.classList.contains("evt-inactive")) {
      elem.classList.remove("evt-inactive");
    }
    if (dot && dot.classList.contains("evt-dot-active")) {
      dot.classList.remove("evt-dot-active");
    }
    if (id >= evtActive && id <= evtActive + lengths - 1) {
      elem.classList.add("evt-active");
    } else {
      elem.classList.add("evt-inactive");
    }
    if (amountDisplay !== 0) {
      elem.style.transform = `translateX(calc(-${evtActive} * (var(--evtLogoSize) + 3 * var(--evtPadding) + 2 * var(--evtMargin))))`;
    } else {
      elem.style.transform = `translateX(calc(-${
        evtActive / 4
      } * (2 * var(--evtSize) + 4 * var(--evtMargin))))`;
    }
  });
  if (evtDots.length > 0) {
    evtDots[Math.floor(evtActive / lengths) % evtDots.length].classList.add(
      "evt-dot-active"
    );
  }
};

let appendActive = () => {
  evtActive += lengths;
  normalizeActive();
  setActive();
};

const normalizeActive = () => {
  if (evtElems.length === 0) return;
  const maxStart = Math.max(0, (Math.ceil(events.length / lengths) - 1) * lengths);
  if (evtActive > maxStart) {
    evtActive = 0;
  } else if (evtActive < 0) {
    evtActive = maxStart;
  }
};

window.addEventListener("resize", () => {
  let newAmountDisplay = parseInt(
    getComputedStyle(evtSec).getPropertyValue("--numDisplay")
  );
  if (amountDisplay !== newAmountDisplay) {
    amountDisplay = newAmountDisplay;
    lengths = amountDisplay === 0 ? 4 : amountDisplay;
    initEvtElems();
  }
});

evtArrLeft.addEventListener("click", () => {
  evtActive -= lengths;
  normalizeActive();
  setActive();
  clearInterval(eventInterval);
  eventInterval = setInterval(appendActive, 3000);
});

evtArrRight.addEventListener("click", () => {
  evtActive += lengths;
  normalizeActive();
  setActive();
  clearInterval(eventInterval);
  eventInterval = setInterval(appendActive, 3000);
});

function checkDirection() {
  if (touchstartX - touchendX > touchThreshold) {
    evtActive += lengths;
    normalizeActive();
    setActive();
  }
  if (touchendX - touchstartX > touchThreshold) {
    evtActive -= lengths;
    normalizeActive();
    setActive();
    clearInterval(eventInterval);
    eventInterval = setInterval(appendActive, 3000);
  }
}

evtsCont.addEventListener("touchstart", (e) => {
  touchstartX = e.changedTouches[0].screenX;
  clearInterval(eventInterval);
});

evtsCont.addEventListener("touchend", (e) => {
  touchendX = e.changedTouches[0].screenX;
  checkDirection();
  eventInterval = setInterval(appendActive, 3000);
});

let eventInterval;

async function loadEvents() {
  try {
    const response = await fetch(`${eventsPath}?v=game-icons`, { cache: "no-store" });
    if (!response.ok) throw new Error("Event data unavailable");
    events = await response.json();
    initEvtElems();
    eventInterval = setInterval(appendActive, 3000);
  } catch (error) {
    console.error(error);
    evtsCont.textContent = "Events are loading. Please refresh the page.";
  }
}

loadEvents();
