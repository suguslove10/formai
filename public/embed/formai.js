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
      background: linear-gradient(135deg, #4f46e5, #4338ca);
      color: white;
      border: none;
      box-shadow: 0 10px 25px -5px rgba(79, 70, 229, 0.4);
      cursor: pointer;
      z-index: 999999;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
    }
    .formai-widget-button:hover {
      transform: scale(1.08);
      box-shadow: 0 15px 30px -5px rgba(79, 70, 229, 0.5);
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
  `;
  document.head.appendChild(style);

  // Create Container & Iframe
  const container = document.createElement("div");
  container.className = "formai-widget-iframe-container";
  container.innerHTML = `<iframe class="formai-widget-iframe" src="${embedUrl}" title="FormAI Chatbot"></iframe>`;
  document.body.appendChild(container);

  // Create Floating Button
  const btn = document.createElement("button");
  btn.className = "formai-widget-button";
  btn.setAttribute("aria-label", "Open FormAI Chatbot");
  btn.innerHTML = `
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
    </svg>
  `;

  let isOpen = false;
  btn.onclick = function () {
    isOpen = !isOpen;
    if (isOpen) {
      container.classList.add("open");
      btn.innerHTML = `
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      `;
    } else {
      container.classList.remove("open");
      btn.innerHTML = `
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
        </svg>
      `;
    }
  };

  document.body.appendChild(btn);
})();
