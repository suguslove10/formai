(function () {
  const currentScript = document.currentScript;
  if (!currentScript) return;

  const formId = currentScript.getAttribute("data-form-id");
  if (!formId) {
    console.error("FormAI Embed: Missing data-form-id attribute on script tag.");
    return;
  }

  const scriptSrc = currentScript.src;
  const baseUrl = new URL(scriptSrc).origin;
  const embedUrl = `${baseUrl}/embed/${formId}`;
  const configUrl = `${baseUrl}/api/forms/${formId}/widget-config`;

  const DEFAULT_ACCENT = "#4f46e5";
  const TEASER_STORAGE_KEY = `formai_teaser_dismissed_${formId}`;

  // Create Styles
  const style = document.createElement("style");
  style.innerHTML = `
    .formai-widget-button {
      position: fixed;
      bottom: 24px;
      right: 24px;
      width: 60px;
      height: 60px;
      border-radius: 50%;
      background: linear-gradient(135deg, ${DEFAULT_ACCENT}, #4338ca);
      color: white;
      border: none;
      box-shadow: 0 10px 25px -5px rgba(79, 70, 229, 0.4);
      cursor: pointer;
      z-index: 999999;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
      padding: 0;
      overflow: hidden;
    }
    .formai-widget-button:hover {
      transform: scale(1.08);
      box-shadow: 0 15px 30px -5px rgba(79, 70, 229, 0.5);
    }
    .formai-widget-button.formai-has-avatar {
      background: #ffffff;
      padding: 3px;
      box-shadow: 0 10px 25px -5px rgba(15, 23, 42, 0.35), 0 0 0 2px rgba(255, 255, 255, 0.9);
    }
    .formai-widget-button.formai-has-avatar:hover {
      box-shadow: 0 15px 30px -5px rgba(15, 23, 42, 0.45), 0 0 0 2px rgba(255, 255, 255, 0.9);
    }
    .formai-widget-button img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      border-radius: 50%;
      display: block;
    }
    .formai-widget-iframe-container {
      position: fixed;
      bottom: 96px;
      right: 24px;
      width: 400px;
      max-width: calc(100vw - 32px);
      height: 620px;
      max-height: calc(100vh - 120px);
      border-radius: 24px;
      overflow: hidden;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
      border: 1px solid rgba(226, 232, 240, 0.9);
      background: white;
      z-index: 999998;
      display: none;
      transform-origin: bottom right;
      transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
    }
    .formai-widget-iframe-container.open {
      display: block;
      animation: formaiPopIn 0.25s ease-out forwards;
    }
    @keyframes formaiPopIn {
      from { opacity: 0; transform: scale(0.9) translateY(20px); }
      to { opacity: 1; transform: scale(1) translateY(0); }
    }
    .formai-widget-iframe {
      width: 100%;
      height: 100%;
      border: none;
    }
    .formai-teaser {
      position: fixed;
      bottom: 30px;
      right: 96px;
      max-width: 260px;
      background: white;
      color: #1e293b;
      padding: 12px 16px;
      border-radius: 16px;
      border-bottom-right-radius: 4px;
      box-shadow: 0 10px 30px -8px rgba(15, 23, 42, 0.25);
      font: 500 13.5px/1.4 -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      z-index: 999997;
      cursor: pointer;
      animation: formaiTeaserIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) 0.6s both;
    }
    .formai-teaser.hidden { display: none; }
    @keyframes formaiTeaserIn {
      from { opacity: 0; transform: translateX(12px) scale(0.95); }
      to { opacity: 1; transform: translateX(0) scale(1); }
    }
    .formai-teaser-close {
      position: absolute;
      top: -8px;
      right: -8px;
      width: 20px;
      height: 20px;
      border-radius: 50%;
      background: #1e293b;
      color: white;
      border: 2px solid white;
      font-size: 11px;
      line-height: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
    }
    @media (max-width: 480px) {
      .formai-teaser { display: none; }
    }
  `;
  document.head.appendChild(style);

  // Create Container & Iframe
  const container = document.createElement("div");
  container.className = "formai-widget-iframe-container";
  container.innerHTML = `<iframe class="formai-widget-iframe" src="${embedUrl}" title="FormAI Chatbot"></iframe>`;
  document.body.appendChild(container);

  const chatIconSvg = `
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
    </svg>`;
  const closeIconSvg = `
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <line x1="18" y1="6" x2="6" y2="18"></line>
      <line x1="6" y1="6" x2="18" y2="18"></line>
    </svg>`;

  // Create Floating Button (icon by default; swapped for a photo avatar once config loads)
  const btn = document.createElement("button");
  btn.className = "formai-widget-button";
  btn.setAttribute("aria-label", "Open FormAI Chatbot");
  btn.innerHTML = chatIconSvg;

  let isOpen = false;
  let hasAvatarPhoto = false;

  function hideTeaser() {
    const teaser = document.querySelector(".formai-teaser");
    if (teaser) teaser.classList.add("hidden");
    try {
      sessionStorage.setItem(TEASER_STORAGE_KEY, "1");
    } catch (e) {}
  }

  btn.onclick = function () {
    isOpen = !isOpen;
    hideTeaser();
    if (isOpen) {
      container.classList.add("open");
      btn.classList.remove("formai-has-avatar");
      btn.innerHTML = closeIconSvg;
    } else {
      container.classList.remove("open");
      if (hasAvatarPhoto) {
        btn.classList.add("formai-has-avatar");
        btn.innerHTML = btn.dataset.avatarHtml;
      } else {
        btn.innerHTML = chatIconSvg;
      }
    }
  };

  document.body.appendChild(btn);

  // Fetch display config: photo avatar, brand color, and greeting teaser
  fetch(configUrl)
    .then((res) => (res.ok ? res.json() : null))
    .then((config) => {
      if (!config) return;

      if (config.themeColor) {
        btn.style.background = `linear-gradient(135deg, ${config.themeColor}, ${config.themeColor})`;
        style.innerHTML = style.innerHTML.replace(
          new RegExp(DEFAULT_ACCENT, "g"),
          config.themeColor
        );
      }

      if (config.botAvatarUrl) {
        const avatarHtml = `<img src="${config.botAvatarUrl}" alt="${(config.botName || "Chat").replace(/"/g, "")}" referrerpolicy="no-referrer" />`;
        btn.dataset.avatarHtml = avatarHtml;
        hasAvatarPhoto = true;
        btn.classList.add("formai-has-avatar");
        if (!isOpen) btn.innerHTML = avatarHtml;
      }

      let teaserDismissed = false;
      try {
        teaserDismissed = sessionStorage.getItem(TEASER_STORAGE_KEY) === "1";
      } catch (e) {}

      if (config.greeting && !teaserDismissed && !isOpen) {
        const teaser = document.createElement("div");
        teaser.className = "formai-teaser";
        teaser.textContent = config.greeting;

        const closeBtn = document.createElement("span");
        closeBtn.className = "formai-teaser-close";
        closeBtn.setAttribute("aria-label", "Dismiss");
        closeBtn.textContent = "✕";
        closeBtn.onclick = function (e) {
          e.stopPropagation();
          hideTeaser();
        };
        teaser.appendChild(closeBtn);

        teaser.addEventListener("click", function () {
          if (!isOpen) btn.onclick();
        });

        document.body.appendChild(teaser);

        // Auto-dismiss after 12s so it doesn't linger indefinitely
        setTimeout(hideTeaser, 12000);
      }
    })
    .catch(function () {
      // Config is purely cosmetic — the chat still works via the iframe without it
    });
})();
