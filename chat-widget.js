/*!
 * chat-widget.js — Abrarr Tallks AI Assistant
 * Floating chat button (positioned above WhatsApp) that talks to a
 * backend proxy (Cloudflare Worker) which securely calls the Groq API.
 *
 * IMPORTANT: This file does NOT contain any API key. The key lives only
 * in the Cloudflare Worker (see worker-proxy.js), set as a secret
 * environment variable. Never paste GROQ_API_KEY into this file.
 *
 * Setup:
 *   1. Deploy worker-proxy.js to Cloudflare Workers (free tier).
 *   2. Set CHAT_ENDPOINT below to your deployed Worker URL.
 *   3. Add <script src="chat-widget.js" defer></script> before </body>
 *      on every page (index.html, blog posts, etc.)
 */
(function () {
  "use strict";

  // ==== CONFIG — update this after deploying your Google Apps Script Web App ====
  // Paste the full "…/exec" URL you get after deploying (see apps-script-backend.gs)
  var CHAT_ENDPOINT = "https://script.google.com/macros/s/AKfycbwBMOD23EeTJDgWOyfW8x0-qgtZ-T1leWz-udb8V-MvBzvBLWYNBhMXKzNeF-5t9cFJlg/exec";
  var WHATSAPP_URL = "https://api.whatsapp.com/send/?phone=917051078832&text&type=phone_number&app_absent=0";
  // =======================================================================

  var STORAGE_KEY = "abrarrChatHistory";
  var history = [];
  try {
    history = JSON.parse(sessionStorage.getItem(STORAGE_KEY) || "[]");
  } catch (e) { history = []; }

  function saveHistory() {
    try { sessionStorage.setItem(STORAGE_KEY, JSON.stringify(history.slice(-12))); } catch (e) {}
  }

  var css = "" +
    "#atc-launcher{position:fixed;right:22px;bottom:90px;width:56px;height:56px;border-radius:50%;" +
    "background:#0ea5e9;box-shadow:0 10px 30px -8px rgba(14,165,233,.6);display:flex;align-items:center;" +
    "justify-content:center;cursor:pointer;z-index:9998;border:none;transition:transform .15s;}" +
    "#atc-launcher:hover{transform:scale(1.06);}" +
    "#atc-launcher svg{width:26px;height:26px;fill:#fff;}" +
    "#atc-launcher .atc-dot{position:absolute;top:2px;right:2px;width:12px;height:12px;background:#22c55e;" +
    "border:2px solid #fff;border-radius:50%;}" +
    "#atc-panel{position:fixed;right:22px;bottom:156px;width:340px;max-width:calc(100vw - 32px);height:460px;" +
    "max-height:calc(100vh - 200px);background:#fff;border-radius:18px;box-shadow:0 20px 60px -16px rgba(15,23,42,.35);" +
    "display:flex;flex-direction:column;overflow:hidden;z-index:9999;font-family:'Inter',system-ui,sans-serif;" +
    "opacity:0;transform:translateY(12px) scale(.98);pointer-events:none;transition:opacity .18s,transform .18s;}" +
    "#atc-panel.open{opacity:1;transform:translateY(0) scale(1);pointer-events:auto;}" +
    "#atc-head{background:linear-gradient(135deg,#0ea5e9,#0369a1);padding:16px 18px;color:#fff;display:flex;" +
    "align-items:center;gap:10px;flex-shrink:0;}" +
    "#atc-head .atc-avatar{width:34px;height:34px;border-radius:50%;background:rgba(255,255,255,.2);" +
    "display:flex;align-items:center;justify-content:center;font-weight:700;font-size:14px;}" +
    "#atc-head .atc-title{font-weight:700;font-size:14.5px;line-height:1.2;}" +
    "#atc-head .atc-sub{font-size:11.5px;opacity:.85;}" +
    "#atc-close{margin-left:auto;background:none;border:none;color:#fff;font-size:20px;cursor:pointer;" +
    "line-height:1;padding:4px;opacity:.85;}" +
    "#atc-close:hover{opacity:1;}" +
    "#atc-body{flex:1;overflow-y:auto;padding:16px;background:#f8fafc;display:flex;flex-direction:column;gap:10px;}" +
    ".atc-msg{max-width:82%;padding:9px 13px;border-radius:14px;font-size:13.5px;line-height:1.55;word-wrap:break-word;}" +
    ".atc-msg.bot{background:#fff;border:1px solid #e2e8f0;color:#334155;align-self:flex-start;border-bottom-left-radius:4px;}" +
    ".atc-msg.user{background:#0ea5e9;color:#fff;align-self:flex-end;border-bottom-right-radius:4px;}" +
    ".atc-msg.typing{display:flex;gap:4px;align-items:center;padding:12px 14px;}" +
    ".atc-msg.typing span{width:6px;height:6px;background:#94a3b8;border-radius:50%;animation:atcBlink 1.2s infinite ease-in-out;}" +
    ".atc-msg.typing span:nth-child(2){animation-delay:.2s;}" +
    ".atc-msg.typing span:nth-child(3){animation-delay:.4s;}" +
    "@keyframes atcBlink{0%,80%,100%{opacity:.3;}40%{opacity:1;}}" +
    "#atc-quick{display:flex;gap:6px;flex-wrap:wrap;padding:0 16px 12px;background:#f8fafc;flex-shrink:0;}" +
    ".atc-chip{font-size:12px;font-weight:600;color:#0369a1;background:#e0f2fe;border:1px solid #bae6fd;" +
    "padding:5px 11px;border-radius:100px;cursor:pointer;white-space:nowrap;}" +
    ".atc-chip:hover{background:#bae6fd;}" +
    "#atc-input-row{display:flex;gap:8px;padding:12px;border-top:1px solid #e2e8f0;background:#fff;flex-shrink:0;}" +
    "#atc-input{flex:1;border:1px solid #e2e8f0;border-radius:100px;padding:10px 15px;font-size:13.5px;" +
    "font-family:inherit;outline:none;}" +
    "#atc-input:focus{border-color:#0ea5e9;}" +
    "#atc-send{width:38px;height:38px;border-radius:50%;background:#0ea5e9;border:none;color:#fff;cursor:pointer;" +
    "display:flex;align-items:center;justify-content:center;flex-shrink:0;}" +
    "#atc-send:disabled{opacity:.5;cursor:not-allowed;}" +
    "#atc-send svg{width:16px;height:16px;fill:#fff;}" +
    "@media(max-width:420px){#atc-panel{right:12px;bottom:150px;} #atc-launcher{right:12px;}}";

  var style = document.createElement("style");
  style.textContent = css;
  document.head.appendChild(style);

  var launcher = document.createElement("button");
  launcher.id = "atc-launcher";
  launcher.setAttribute("aria-label", "Chat with AI Assistant");
  launcher.innerHTML =
    '<svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.02 2 11c0 2.61 1.24 4.95 3.24 6.6-.1.98-.5 2.5-1.24 3.9 1.6-.2 3.24-.86 4.4-1.6 1.1.3 2.3.1 3.6.1 5.52 0 10-4.02 10-9s-4.48-9-10-9z"/></svg>' +
    '<span class="atc-dot"></span>';
  document.body.appendChild(launcher);

  var panel = document.createElement("div");
  panel.id = "atc-panel";
  panel.innerHTML =
    '<div id="atc-head">' +
      '<div class="atc-avatar">AT</div>' +
      '<div><div class="atc-title">Abrarr Tallks Assistant</div><div class="atc-sub">Usually replies in minutes</div></div>' +
      '<button id="atc-close" aria-label="Close chat">✕</button>' +
    '</div>' +
    '<div id="atc-body"></div>' +
    '<div id="atc-quick">' +
      '<span class="atc-chip" data-q="What services do you offer?">Services</span>' +
      '<span class="atc-chip" data-q="How much does a website cost?">Pricing</span>' +
      '<span class="atc-chip" data-q="Do you work with clients outside India?">International?</span>' +
    '</div>' +
    '<div id="atc-input-row">' +
      '<input id="atc-input" type="text" placeholder="Ask about services, pricing..." maxlength="400" autocomplete="off">' +
      '<button id="atc-send" aria-label="Send message"><svg viewBox="0 0 24 24"><path d="M2 21l21-9L2 3v7l15 2-15 2z"/></svg></button>' +
    '</div>';
  document.body.appendChild(panel);

  var body = panel.querySelector("#atc-body");
  var input = panel.querySelector("#atc-input");
  var sendBtn = panel.querySelector("#atc-send");
  var isOpen = false;
  var isSending = false;

  function addMessage(role, text) {
    var el = document.createElement("div");
    el.className = "atc-msg " + (role === "user" ? "user" : "bot");
    el.textContent = text;
    body.appendChild(el);
    body.scrollTop = body.scrollHeight;
    return el;
  }

  function showTyping() {
    var el = document.createElement("div");
    el.className = "atc-msg bot typing";
    el.id = "atc-typing";
    el.innerHTML = "<span></span><span></span><span></span>";
    body.appendChild(el);
    body.scrollTop = body.scrollHeight;
  }

  function hideTyping() {
    var t = document.getElementById("atc-typing");
    if (t) t.remove();
  }

  function renderHistory() {
    body.innerHTML = "";
    if (history.length === 0) {
      addMessage("bot", "Hi! I'm the AI assistant for Abrarr Tallks. Ask me about web design, SEO, pricing, or areas served — or tap a quick question below.");
      return;
    }
    history.forEach(function (m) { addMessage(m.role, m.content); });
  }

  function openPanel() {
    isOpen = true;
    panel.classList.add("open");
    renderHistory();
    setTimeout(function () { input.focus(); }, 150);
  }

  function closePanel() {
    isOpen = false;
    panel.classList.remove("open");
  }

  launcher.addEventListener("click", function () {
    isOpen ? closePanel() : openPanel();
  });
  panel.querySelector("#atc-close").addEventListener("click", closePanel);

  panel.querySelectorAll(".atc-chip").forEach(function (chip) {
    chip.addEventListener("click", function () {
      sendMessage(chip.getAttribute("data-q"));
    });
  });

  function sendMessage(text) {
    text = (text || input.value).trim();
    if (!text || isSending) return;

    input.value = "";
    addMessage("user", text);
    history.push({ role: "user", content: text });
    saveHistory();

    isSending = true;
    sendBtn.disabled = true;
    showTyping();

    fetch(CHAT_ENDPOINT, {
      method: "POST",
      // NOTE: Google Apps Script web apps can't handle CORS preflight (OPTIONS)
      // requests. Using text/plain keeps this a "simple request" so the browser
      // skips preflight. The Apps Script side still parses the body as JSON.
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify({ message: text, history: history.slice(-8) })
    })
      .then(function (res) {
        if (!res.ok) throw new Error("Request failed: " + res.status);
        return res.json();
      })
      .then(function (data) {
        hideTyping();
        var reply = (data && data.reply) ? data.reply : "Sorry, I couldn't get a response. Please try WhatsApp instead.";
        addMessage("bot", reply);
        history.push({ role: "assistant", content: reply });
        saveHistory();
        if (typeof gtag === "function") {
          gtag("event", "chat_widget_message", { event_category: "engagement" });
        }
      })
      .catch(function () {
        hideTyping();
        addMessage("bot", "Something went wrong connecting to the assistant. You can reach Abrar directly on WhatsApp instead.");
      })
      .finally(function () {
        isSending = false;
        sendBtn.disabled = false;
      });
  }

  sendBtn.addEventListener("click", function () { sendMessage(); });
  input.addEventListener("keydown", function (e) {
    if (e.key === "Enter") sendMessage();
  });

  document.addEventListener("click", function (e) {
    if (isOpen && !panel.contains(e.target) && !launcher.contains(e.target)) {
      // keep panel open on outside click — chat widgets shouldn't
      // vanish accidentally; user closes via ✕ button.
    }
  });
})();
