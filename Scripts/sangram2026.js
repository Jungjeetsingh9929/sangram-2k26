const configPath = "Data/site-config.json";

const fallbackConfig = {
  eventDate: "2026-10-01T00:00:00+05:30",
  registrationUrl: "links.html",
  whatsappUrl: "https://chat.whatsapp.com/ED9qVYV13tIEj7Zua2uixJ",
  contacts: []
};

function cleanPhone(phone) {
  return phone.replace(/[^\d+]/g, "");
}

function setConfigLinks(config) {
  document.querySelectorAll('[data-config-link="registration"]').forEach((link) => {
    link.href = config.registrationUrl || fallbackConfig.registrationUrl;
  });

  document.querySelectorAll('[data-config-link="whatsapp"]').forEach((link) => {
    link.href = config.whatsappUrl || fallbackConfig.whatsappUrl;
  });
}

function showCopyToast(label) {
  const toast = document.getElementById("copyToast");
  if (!toast) return;
  toast.textContent = `${label} copied`;
  toast.classList.add("is-visible");
  window.clearTimeout(showCopyToast.timer);
  showCopyToast.timer = window.setTimeout(() => {
    toast.classList.remove("is-visible");
  }, 1300);
}

async function copyValue(value, label) {
  try {
    await navigator.clipboard.writeText(value);
    showCopyToast(label);
  } catch {
    showCopyToast("Text");
  }
}

function addContactRow(parent, href, label, value, copyLabel) {
  const row = document.createElement("div");
  row.className = "contactRow";

  const link = document.createElement("a");
  link.className = label === "Phone" ? "number" : "mail";
  link.href = href;
  link.textContent = value;

  const button = document.createElement("button");
  button.className = "copyContact";
  button.type = "button";
  button.textContent = "Copy";
  button.addEventListener("click", () => copyValue(value, copyLabel));

  row.append(link, button);
  parent.appendChild(row);
}

function renderContacts(config) {
  const container = document.getElementById("editableContacts");
  if (!container) return;

  const contacts = config.contacts && config.contacts.length
    ? config.contacts
    : fallbackConfig.contacts;

  container.replaceChildren();

  contacts.forEach((contact) => {
    const card = document.createElement("article");
    card.className = "contDiv";

    const name = document.createElement("h2");
    name.className = "name";
    name.textContent = contact.name;

    const role = document.createElement("p");
    role.className = "dept";
    role.textContent = contact.role;

    const details = document.createElement("div");
    details.className = "contact-details";

    if (contact.phone) {
      addContactRow(details, `tel:${cleanPhone(contact.phone)}`, "Phone", contact.phone, "Phone");
    }

    if (contact.email) {
      addContactRow(details, `mailto:${contact.email}`, "Email", contact.email, "Email");
    }

    card.append(name, role, details);
    container.appendChild(card);
  });
}

function updateCountdown(eventDate) {
  const target = new Date(eventDate || fallbackConfig.eventDate).getTime();
  const dayNode = document.getElementById("days");
  const hourNode = document.getElementById("hours");
  const minNode = document.getElementById("min");
  if (!dayNode || !hourNode || !minNode || Number.isNaN(target)) return;

  const render = () => {
    const diff = Math.max(0, target - Date.now());
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((diff / (1000 * 60)) % 60);
    dayNode.textContent = String(days).padStart(2, "0");
    hourNode.textContent = String(hours).padStart(2, "0");
    minNode.textContent = String(minutes).padStart(2, "0");
  };

  render();
  window.setInterval(render, 1000);
}

async function initSangram2026() {
  let config = fallbackConfig;

  try {
    const response = await fetch(configPath);
    config = { ...fallbackConfig, ...(await response.json()) };
  } catch {
    config = fallbackConfig;
  }

  setConfigLinks(config);
  renderContacts(config);
  updateCountdown(config.eventDate);
}

initSangram2026();

function initPlayerAdjustMode() {
  const params = new URLSearchParams(window.location.search);
  if (params.get("adjust") !== "players") return;

  const pictures = document.querySelector(".pictures");
  if (!pictures) return;

  document.body.classList.add("player-adjust-mode");
  if (params.get("view") === "mobile") {
    document.body.classList.add("player-adjust-mobile");
  }

  const main = document.querySelector("main");
  const homePage = document.querySelector(".home-page");
  const nav = document.querySelector(".nav");
  const textBlock = document.querySelector(".text");
  const heroActions = document.querySelector(".hero-actions");
  const footer = document.querySelector("footer");
  const body = document.body;
  if (heroActions && textBlock) {
    heroActions.style.inset = "0";
    heroActions.style.height = "100%";
    heroActions.style.margin = "0";
    heroActions.style.position = "absolute";
    heroActions.style.transform = "none";
    heroActions.style.width = "100%";
  }
  const targets = [
    { label: "extra red", selector: ".extra-player-red", parent: pictures },
    { label: "extra blue", selector: ".extra-player-blue", parent: pictures },
    { label: "extra yellow", selector: ".extra-player-yellow", parent: pictures },
    { label: "extra green", selector: ".extra-player-green", parent: pictures },
    { label: "red main", selector: ".leftImg", parent: pictures },
    { label: "goalkeeper", selector: ".centerImg", parent: pictures },
    { label: "yellow main", selector: ".rightImg", parent: pictures },
    { label: "logo", selector: ".left", parent: nav || homePage },
    { label: "side bar", selector: ".scrollNav", parent: body || homePage },
    { label: "hero text", selector: ".text", parent: main },
    { label: "small title", selector: ".hero-kicker", parent: textBlock },
    { label: "sangram title", selector: "#bosm", parent: textBlock },
    { label: "tagline", selector: ".hero-tagline", parent: textBlock },
    { label: "register button", selector: ".hero-button-primary", parent: heroActions },
    { label: "events button", selector: ".hero-button-secondary", parent: heroActions },
    { label: "countdown", selector: ".time", parent: footer || homePage },
    { label: "social icons", selector: ".socials", parent: footer || homePage }
  ].map((item) => ({ ...item, node: document.querySelector(item.selector) })).filter((item) => {
    if (!item.node || !item.parent) return false;
    const rect = item.node.getBoundingClientRect();
    return rect.width > 0 && rect.height > 0;
  });

  let selectedTarget = null;

  function getRotation(node) {
    return Number(node.dataset.adjustRotate || "0");
  }

  function applyRotation(node) {
    node.style.transform = `rotate(${getRotation(node)}deg)`;
  }

  function getUsableParent(item) {
    const rect = item.parent.getBoundingClientRect();
    if (rect.width > 0 && rect.height > 0) return item.parent;
    return homePage || main || pictures;
  }

  targets.forEach((item) => {
    const { node } = item;
    const parent = getUsableParent(item);
    const rect = node.getBoundingClientRect();
    const parentRect = parent.getBoundingClientRect();
    node.style.left = `${rect.left - parentRect.left}px`;
    node.style.top = `${rect.top - parentRect.top}px`;
    node.style.right = "auto";
    node.style.bottom = "auto";
    node.style.margin = "0";
    node.style.position = "absolute";
    if (item.selector === ".scrollNav") {
      node.dataset.adjustRotate = "-90";
    }
    applyRotation(node);

    if (item.selector === ".hero-button-primary") {
      node.style.left = "0px";
      node.style.top = `${parentRect.height * 0.74}px`;
      node.style.width = `${parentRect.width * 0.46}px`;
    }

    if (item.selector === ".hero-button-secondary") {
      node.style.left = `${parentRect.width * 0.54}px`;
      node.style.top = `${parentRect.height * 0.74}px`;
      node.style.width = `${parentRect.width * 0.46}px`;
    }
  });

  const panel = document.createElement("div");
  panel.className = "player-adjust-panel";

  const actions = document.createElement("div");
  actions.className = "player-adjust-actions";

  const hint = document.createElement("span");
  hint.textContent = "Select item, use arrows to move, Bigger/Smaller for size. Drag also works where accessible.";

  const itemSelect = document.createElement("select");
  itemSelect.className = "player-adjust-select";
  itemSelect.setAttribute("aria-label", "Select item to adjust");
  targets.forEach((item, index) => {
    const option = document.createElement("option");
    option.value = String(index);
    option.textContent = item.label;
    itemSelect.appendChild(option);
  });

  const nudgeControls = document.createElement("div");
  nudgeControls.className = "player-adjust-nudge";

  const upButton = document.createElement("button");
  upButton.type = "button";
  upButton.textContent = "Up";

  const downButton = document.createElement("button");
  downButton.type = "button";
  downButton.textContent = "Down";

  const leftButton = document.createElement("button");
  leftButton.type = "button";
  leftButton.textContent = "Left";

  const rightButton = document.createElement("button");
  rightButton.type = "button";
  rightButton.textContent = "Right";

  nudgeControls.append(upButton, downButton, leftButton, rightButton);

  const rotateControls = document.createElement("div");
  rotateControls.className = "player-adjust-rotate";

  const rotateLeftButton = document.createElement("button");
  rotateLeftButton.type = "button";
  rotateLeftButton.textContent = "Rotate Left";

  const rotateRightButton = document.createElement("button");
  rotateRightButton.type = "button";
  rotateRightButton.textContent = "Rotate Right";

  rotateControls.append(rotateLeftButton, rotateRightButton);

  const copyButton = document.createElement("button");
  copyButton.type = "button";
  copyButton.textContent = "Copy values";

  const smallerButton = document.createElement("button");
  smallerButton.type = "button";
  smallerButton.textContent = "Smaller";

  const biggerButton = document.createElement("button");
  biggerButton.type = "button";
  biggerButton.textContent = "Bigger";

  const resetButton = document.createElement("button");
  resetButton.type = "button";
  resetButton.textContent = "Reset";

  const output = document.createElement("textarea");
  output.readOnly = true;

  actions.append(hint, itemSelect, nudgeControls, rotateControls, smallerButton, biggerButton, copyButton, resetButton);
  panel.append(actions, output);
  document.body.appendChild(panel);

  function renderValues() {
    output.value = targets.map((item) => {
      const { label, selector, node } = item;
      const parent = getUsableParent(item);
      const parentRect = parent.getBoundingClientRect();
      const rect = node.getBoundingClientRect();
      const x = ((rect.left - parentRect.left) / parentRect.width * 100).toFixed(2);
      const y = ((rect.top - parentRect.top) / parentRect.height * 100).toFixed(2);
      const w = (rect.width / parentRect.width * 100).toFixed(2);
      return `${label} | ${selector} | left:${x}%; top:${y}%; width:${w}%; rotate:${getRotation(node)}deg;`;
    }).join("\n");
  }

  function startDrag(event, item) {
    const nestedTarget = targets.find(({ node }) => node !== item.node && node.contains(event.target));
    if (nestedTarget && item.node.contains(nestedTarget.node)) return;
    event.preventDefault();
    event.stopPropagation();
    const node = item.node;
    selectTarget(item);
    const startX = event.clientX;
    const startY = event.clientY;
    const startLeft = parseFloat(node.style.left || "0");
    const startTop = parseFloat(node.style.top || "0");
    node.classList.add("player-adjust-dragging");
    node.setPointerCapture?.(event.pointerId);

    const move = (moveEvent) => {
      node.style.left = `${startLeft + moveEvent.clientX - startX}px`;
      node.style.top = `${startTop + moveEvent.clientY - startY}px`;
      renderValues();
    };

    const end = () => {
      node.classList.remove("player-adjust-dragging");
      node.removeEventListener("pointermove", move);
      node.removeEventListener("pointerup", end);
      node.removeEventListener("pointercancel", end);
      renderValues();
    };

    node.addEventListener("pointermove", move);
    node.addEventListener("pointerup", end);
    node.addEventListener("pointercancel", end);
  }

  targets.forEach((item) => {
    item.node.addEventListener("pointerdown", (event) => startDrag(event, item));
  });

  function selectTarget(item) {
    selectedTarget?.node.classList.remove("player-adjust-selected");
    selectedTarget = item;
    itemSelect.value = String(targets.indexOf(item));
    item.node.classList.add("player-adjust-selected");
  }

  function moveSelected(deltaX, deltaY) {
    if (!selectedTarget) return;
    const node = selectedTarget.node;
    const currentLeft = parseFloat(node.style.left || "0");
    const currentTop = parseFloat(node.style.top || "0");
    node.style.left = `${currentLeft + deltaX}px`;
    node.style.top = `${currentTop + deltaY}px`;
    renderValues();
  }

  function resizeSelected(multiplier) {
    if (!selectedTarget) return;
    const node = selectedTarget.node;
    const currentWidth = node.getBoundingClientRect().width;
    node.style.width = `${Math.max(28, currentWidth * multiplier)}px`;
    renderValues();
  }

  function rotateSelected(delta) {
    if (!selectedTarget) return;
    const node = selectedTarget.node;
    node.dataset.adjustRotate = String(getRotation(node) + delta);
    applyRotation(node);
    renderValues();
  }

  copyButton.addEventListener("click", () => copyValue(output.value, "Player values"));
  itemSelect.addEventListener("change", () => selectTarget(targets[Number(itemSelect.value)]));
  upButton.addEventListener("click", () => moveSelected(0, -6));
  downButton.addEventListener("click", () => moveSelected(0, 6));
  leftButton.addEventListener("click", () => moveSelected(-6, 0));
  rightButton.addEventListener("click", () => moveSelected(6, 0));
  rotateLeftButton.addEventListener("click", () => rotateSelected(-5));
  rotateRightButton.addEventListener("click", () => rotateSelected(5));
  smallerButton.addEventListener("click", () => resizeSelected(0.94));
  biggerButton.addEventListener("click", () => resizeSelected(1.06));
  resetButton.addEventListener("click", () => window.location.reload());
  selectTarget(targets[0]);
  renderValues();
}

initPlayerAdjustMode();
