const eventsPath = "../Data/events2026.json";

function qrUrl(event) {
  return `https://api.qrserver.com/v1/create-qr-code/?size=180x180&margin=1&data=${encodeURIComponent(event.formUrl)}`;
}

function createEventCard(event) {
  const card = document.createElement("article");
  card.className = "ignition-game";

  const title = document.createElement("h3");
  title.className = "game-head";
  title.textContent = event.name;

  const poster = document.createElement("div");
  poster.className = "game-poster";
  poster.innerHTML = `
    <div class="poster-topline">
      <span>SANGRAM</span>
      <span>2026</span>
    </div>
    <div class="poster-photo">
      <img class="sport-photo sport-mark" src="../Assets/sports/${event.imageKey}_logo.svg" alt="${event.name}">
    </div>
    <div class="poster-event">${event.name}</div>
    <div class="poster-date">1-4 October 2026</div>
    <div class="poster-footer">
      <div>
        <strong>Register Now</strong>
        <p>Scan QR to open this event form.</p>
      </div>
      <img class="poster-qr" src="${qrUrl(event)}" alt="${event.name} registration QR">
    </div>
  `;

  const actions = document.createElement("div");
  actions.className = "game-reg";

  const register = document.createElement("a");
  register.className = "game-reg-btn";
  register.href = event.formUrl;
  register.target = "_blank";
  register.rel = "noopener";
  register.textContent = "REGISTER";

  actions.appendChild(register);
  card.append(title, poster, actions);
  return card;
}

async function renderIgnitionEvents() {
  const root = document.querySelector(".ignition");
  if (!root) return;

  const response = await fetch(eventsPath);
  const events = await response.json();
  root.replaceChildren(...events.map(createEventCard));
}

renderIgnitionEvents();
