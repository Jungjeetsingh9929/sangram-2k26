let body = document.querySelector("body");
const entrySeenKey = "sangramEntrySeen";

function markSiteReady(loader) {
  if (loader) {
    loader.classList.add("loader-complete");
    loader.dataset.done = "true";
    loader.style.animation = "";
    loader.style.display = "none";
  }

  document.body.classList.add("sangram-entry-ready");
  body.style.overflowY = "scroll";
}

function setupEntryPage() {
  const loader = document.querySelector(".loader");
  const continueText = document.querySelector(".hide");

  if (window.sessionStorage.getItem(entrySeenKey) === "true") {
    markSiteReady(loader);
    return;
  }

  document.body.classList.remove("sangram-entry-ready");
  body.style.overflowY = "hidden";
  document.body.scrollTop = document.documentElement.scrollTop = 0;

  if (loader) {
    loader.classList.remove("loader-complete");
    loader.dataset.done = "false";
    loader.style.animation = "";
    loader.style.display = "flex";
  }

  const showContinue = () => {
    if (!continueText) return;
    continueText.style.animation = "appear 1.1s ease both";
    continueText.style.opacity = "1";
  };

  const enterSite = () => {
    if (!loader || loader.dataset.done === "true") return;
    loader.dataset.done = "true";
    window.sessionStorage.setItem(entrySeenKey, "true");
    loader.style.animation = "fade-out 0.9s ease-out both";
    body.style.overflowY = "scroll";
    document.body.scrollTop = document.documentElement.scrollTop = 0;

    window.setTimeout(() => {
      loader.classList.add("loader-complete");
      document.body.classList.add("sangram-entry-ready");
    }, 850);
  };

  window.setTimeout(showContinue, 450);

  if (loader) {
    loader.onclick = enterSite;
  }
}

window.addEventListener("load", setupEntryPage);
window.addEventListener("pageshow", setupEntryPage);
