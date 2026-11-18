(function () {
  "use strict";

  const EMAIL = "info.novaforge.2026@gmail.com";

  /* ── Terminal AI Easter Egg Configuration ──────────────────────────────
     Paste your API key below to power live AI answers inside the Mac terminal.
     Supported providers: "openai" | "openrouter" | "anthropic" | "gemini"
     Leave apiKey blank ("") to use the built-in NovaForge assistant, or type
     `setkey <your-api-key>` directly inside the terminal to test a key live. */
  const TERMINAL_AI = {
    provider: "openai",
    model: "gpt-4o-mini",
    apiKey: "", // <-- PASTE YOUR API KEY HERE
  };

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const $ = (id) => document.getElementById(id);
  const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  /* ── Header: compact on scroll, auto-hide on scroll down, manual collapse ── */
  const header = $("siteHeader");
  const progressBar = $("scrollProgress");
  const backToTop = $("backToTop");
  const collapseBtn = $("collapseBar");
  const barHandle = $("barHandle");
  const menuToggle = $("menuToggle");
  const mobileNav = $("mobileNav");

  let lastY = window.scrollY;
  let ticking = false;
  let manuallyCollapsed = false;

  function menuOpen() {
    return mobileNav && !mobileNav.hidden;
  }

  function setCollapsed(collapsed) {
    if (!header) return;
    header.classList.toggle("collapsed", collapsed);
    // The "Menu" tab is only needed when the user closed the bar on purpose;
    // an auto-hidden bar comes back on its own when scrolling up.
    const showHandle = collapsed && manuallyCollapsed;
    if (barHandle) {
      barHandle.classList.toggle("show", showHandle);
      barHandle.tabIndex = showHandle ? 0 : -1;
    }
  }

  function onScroll() {
    const y = window.scrollY;
    const doc = document.documentElement;
    const max = doc.scrollHeight - doc.clientHeight;

    if (progressBar) {
      progressBar.style.width = (max > 0 ? Math.min(100, (y / max) * 100) : 0) + "%";
    }
    if (header) {
      header.classList.toggle("scrolled", y > 12);
      header.classList.toggle("compact", y > 80);
    }
    if (backToTop) {
      backToTop.hidden = y < 500;
    }

    // Auto-hide only when the user has not pinned it closed and the menu is shut.
    if (!manuallyCollapsed && !menuOpen()) {
      const delta = y - lastY;
      if (y < 120) {
        setCollapsed(false);
      } else if (delta > 6) {
        setCollapsed(true);
      } else if (delta < -6) {
        setCollapsed(false);
      }
    }
    lastY = y;
    ticking = false;
  }

  window.addEventListener("scroll", () => {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(onScroll);
    }
  }, { passive: true });
  onScroll();

  if (collapseBtn) {
    collapseBtn.addEventListener("click", () => {
      closeMenu();
      manuallyCollapsed = true;
      setCollapsed(true);
    });
  }

  if (barHandle) {
    barHandle.addEventListener("click", () => {
      manuallyCollapsed = false;
      setCollapsed(false);
    });
  }

  if (backToTop) {
    backToTop.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
    });
  }

  /* ── Mobile menu ─────────────────────────────────────────────────────── */
  function closeMenu() {
    if (!mobileNav || !menuToggle) return;
    mobileNav.hidden = true;
    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.setAttribute("aria-label", "Open menu");
  }

  if (menuToggle && mobileNav) {
    menuToggle.addEventListener("click", () => {
      const willOpen = mobileNav.hidden;
      mobileNav.hidden = !willOpen;
      menuToggle.setAttribute("aria-expanded", String(willOpen));
      menuToggle.setAttribute("aria-label", willOpen ? "Close menu" : "Open menu");
      if (willOpen) setCollapsed(false);
    });
    mobileNav.querySelectorAll("a").forEach((link) => link.addEventListener("click", closeMenu));
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") closeMenu();
    });
    window.matchMedia("(min-width: 921px)").addEventListener("change", (e) => {
      if (e.matches) closeMenu();
    });
  }

  /* ── SVG line drawing: measure each path so every shape draws fully ──── */
  document.querySelectorAll(".draw-path").forEach((path) => {
    try {
      const len = Math.ceil(path.getTotalLength()) + 2;
      path.style.setProperty("--len", String(len));
    } catch {
      path.style.setProperty("--len", "400");
    }
  });

  /* ── Scroll reveal ───────────────────────────────────────────────────── */
  const reveals = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && !reduceMotion) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
    reveals.forEach((el) => io.observe(el));
  } else {
    reveals.forEach((el) => el.classList.add("visible"));
  }

  /* ── Card light that follows the pointer ─────────────────────────────── */
  if (window.matchMedia("(hover: hover)").matches) {
    document.querySelectorAll(".sheen-card").forEach((card) => {
      card.addEventListener("pointermove", (e) => {
        const r = card.getBoundingClientRect();
        card.style.setProperty("--mx", (((e.clientX - r.left) / r.width) * 100).toFixed(1) + "%");
        card.style.setProperty("--my", (((e.clientY - r.top) / r.height) * 100).toFixed(1) + "%");
      });
    });
  }

  /* ── Counters ────────────────────────────────────────────────────────── */
  function animateCounter(el) {
    const target = Number(el.dataset.target || 0);
    const suffix = el.dataset.suffix || "";
    if (!target || reduceMotion) {
      el.textContent = target.toLocaleString("en-IN") + suffix;
      return;
    }
    const start = performance.now();
    const duration = 1000;
    const step = (now) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      el.textContent = Math.round(target * eased).toLocaleString("en-IN") + suffix;
      if (t < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }

  const counters = document.querySelectorAll(".counter");
  if ("IntersectionObserver" in window) {
    const co = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          co.unobserve(entry.target);
        }
      });
    }, { threshold: 0.6 });
    counters.forEach((c) => co.observe(c));
  } else {
    counters.forEach(animateCounter);
  }

  /* ── Mac terminal animation ──────────────────────────────────────────── */
  const terminalBody = $("terminalBody");
  const replayBtn = $("termReplay");
  const statusDot = $("termStatusDot");
  const statusText = $("termStatusText");
  const termTabs = document.querySelectorAll(".term-tab");

  const SCENES = {
    float: [
      { type: "cmd", text: "float start --workspace \"NovaForge\"" },
      { type: "progress", label: "Opening encrypted vault", done: "Vault ready · 0 external dependencies" },
      { type: "cmd", text: "float sheets new budget_2027.xlsx" },
      { type: "out", text: "  1,000 × 1,000 grid · formulas and charts on" },
      { type: "cmd", text: "float export --pdf --xlsx" },
      { type: "ok", text: "✓ Saved locally · keys sealed with AES-256-GCM" }
    ],
    finance: [
      { type: "cmd", text: "float-finance check --gst --payroll" },
      { type: "progress", label: "Verifying GST ledgers", done: "Invoices locked · PF, ESI, PT, TDS correct" },
      { type: "cmd", text: "float-finance expiries --within 30d" },
      { type: "out", text: "  2 renewals due: insurance (MH-12), PUC (DL-01)" },
      { type: "cmd", text: "float-finance approvals" },
      { type: "ok", text: "✓ Salary run waiting for owner sign-off" }
    ]
  };

  const PROMPT = "novaforge@mac ~ % ";
  const SPIN = ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"];
  const SESSION_KEY_STORAGE = "novaforge.term.key";
  const SESSION_PROV_STORAGE = "novaforge.term.provider";
  let currentScene = "float";
  let runId = 0;
  let busy = false;
  const cmdHistory = [];
  let histIdx = -1;

  const SYSTEM_PROMPT =
    "You are the NovaForge Mac Terminal AI assistant. NovaForge builds local-first AI software " +
    "for companies with zero external runtime dependencies. Products: (1) Float AI Agent — private AI workspace " +
    "with a 1,000x1,000 spreadsheet studio (Float Sheets), .xlsx/.pdf export, BYO API key, AES-256-GCM transport; " +
    "(2) Float for Finance — fleet & car rental finance suite with immutable GST invoices, driver payroll (PF/ESI/PT/TDS), " +
    "3-tier owner approval policy, DPDP consent & GPS/EXIF photo scrubbing, and 30/60/90-day expiry alerts. " +
    "Founders: Prabhjot (Co-Founder & CEO), Shiva (Co-Founder & Lead Developer), Yatharth (Co-Founder & Head of Product & Design). " +
    "For pricing/licensing, direct users to info.novaforge.2026@gmail.com. Answer concisely in 2-4 crisp plain-text sentences suitable for a terminal.";

  function el(tag, cls, text) {
    const node = document.createElement(tag);
    if (cls) node.className = cls;
    if (text !== undefined) node.textContent = text;
    return node;
  }

  function scrollTerminal() {
    if (terminalBody) terminalBody.scrollTop = terminalBody.scrollHeight;
  }

  function setStatus(text, done) {
    if (statusText) statusText.textContent = text;
    if (statusDot) statusDot.classList.toggle("done", !!done);
  }

  function appendLine(children) {
    const line = el("div", "term-line");
    children.forEach((c) => line.append(c));
    terminalBody.append(line);
    scrollTerminal();
    return line;
  }

  function getActiveAI() {
    let sessKey = "";
    let sessProv = "";
    try {
      sessKey = sessionStorage.getItem(SESSION_KEY_STORAGE) || "";
      sessProv = sessionStorage.getItem(SESSION_PROV_STORAGE) || "";
    } catch { /* ignore */ }
    const apiKey = (TERMINAL_AI.apiKey || sessKey || "").trim();
    const provider = (sessProv || TERMINAL_AI.provider || "openai").toLowerCase();
    return { apiKey, provider, model: TERMINAL_AI.model || "gpt-4o-mini" };
  }

  async function typeText(text, cls, alive, speed = 12) {
    const lines = String(text || "").split("\n");
    for (const part of lines) {
      if (!alive()) return;
      const span = el("span", cls);
      appendLine([span]);
      if (reduceMotion) {
        span.textContent = part;
      } else {
        for (const ch of part) {
          if (!alive()) return;
          span.textContent += ch;
          scrollTerminal();
          await sleep(ch === " " ? speed + 6 : speed + Math.random() * 10);
        }
      }
      await sleep(60);
    }
  }

  function mountPrompt(focusInput = false) {
    if (!terminalBody) return;
    const old = terminalBody.querySelector(".term-input-line");
    if (old) old.remove();

    const row = el("div", "term-input-line");
    const promptSpan = el("span", "term-prompt term-prompt-fixed", PROMPT);
    const input = document.createElement("input");
    input.type = "text";
    input.className = "term-input";
    input.id = "termInput";
    input.autocomplete = "off";
    input.spellcheck = false;
    input.setAttribute("aria-label", "Type a question or command in the NovaForge terminal");
    input.placeholder = "Ask anything or type 'help'…";

    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        const val = input.value;
        handleTerminalCommand(val);
      } else if (e.key === "ArrowUp") {
        if (!cmdHistory.length) return;
        e.preventDefault();
        histIdx = histIdx < 0 ? cmdHistory.length - 1 : Math.max(0, histIdx - 1);
        input.value = cmdHistory[histIdx] || "";
      } else if (e.key === "ArrowDown") {
        if (histIdx < 0) return;
        e.preventDefault();
        histIdx += 1;
        if (histIdx >= cmdHistory.length) {
          histIdx = -1;
          input.value = "";
        } else {
          input.value = cmdHistory[histIdx] || "";
        }
      }
    });

    row.append(promptSpan, input);
    terminalBody.append(row);
    scrollTerminal();
    if (focusInput) input.focus({ preventScroll: true });
  }

  async function callProviderAI(question, cfg) {
    const { apiKey, provider, model } = cfg;
    if (provider === "anthropic") {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01",
          "anthropic-dangerous-direct-browser-access": "true",
        },
        body: JSON.stringify({
          model: model.includes("claude") ? model : "claude-3-5-haiku-latest",
          max_tokens: 220,
          system: SYSTEM_PROMPT,
          messages: [{ role: "user", content: question }],
        }),
      });
      if (!res.ok) throw new Error("API " + res.status);
      const data = await res.json();
      return (data.content && data.content[0] && data.content[0].text) || "";
    }

    if (provider === "gemini") {
      const gModel = model.includes("gemini") ? model : "gemini-2.0-flash";
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(gModel)}:generateContent?key=${encodeURIComponent(apiKey)}`;
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
          contents: [{ role: "user", parts: [{ text: question }] }],
        }),
      });
      if (!res.ok) throw new Error("API " + res.status);
      const data = await res.json();
      return data.candidates?.[0]?.content?.parts?.[0]?.text || "";
    }

    const endpoint =
      provider === "openrouter"
        ? "https://openrouter.ai/api/v1/chat/completions"
        : "https://api.openai.com/v1/chat/completions";
    const res = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        max_tokens: 220,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: question },
        ],
      }),
    });
    if (!res.ok) throw new Error("API " + res.status);
    const data = await res.json();
    return data.choices?.[0]?.message?.content || "";
  }

  function offlineNovaForgeAI(q) {
    const s = q.toLowerCase();
    if (/^(hi|hello|hey|namaste)\b/.test(s)) {
      return "Hello from NovaForge! Ask me about Float AI Agent, Float for Finance, our founders, security, or pricing.";
    }
    if (/(founder|founded|team|who made|who built|who runs|owner|ceo|developer|designer|shiva|prabhjot|yatharth)/.test(s)) {
      return "NovaForge is founded and run by Prabhjot (Co-Founder & CEO), Shiva (Co-Founder & Lead Developer), and Yatharth (Co-Founder & Head of Product & Design).";
    }
    if (/(price|cost|buy|license|quote|how much|subscription)/.test(s)) {
      return `We offer tailored company licensing and full buyout packages. Please email ${EMAIL} with your team size and workflow for a quote.`;
    }
    if (/(contact|email|reach|demo|pilot|talk)/.test(s)) {
      return `Reach our founders directly at ${EMAIL}, or use the inquiry form at the bottom of this page.`;
    }
    if (/(finance|gst|payroll|fleet|driver|dpdp|exif|approval|tier)/.test(s)) {
      return "Float for Finance is built for car rental & fleet teams: immutable GST invoices, PF/ESI/PT/TDS driver payroll, 3-tier owner approvals, DPDP consent & EXIF scrubbing, and 30/60/90-day expiry alerts.";
    }
    if (/(float|sheet|excel|xlsx|pdf|workspace|agent)/.test(s)) {
      return "Float AI Agent is a local-first AI workspace with Float Sheets (a 1,000 × 1,000 spreadsheet grid with formulas, charts, .xlsx and .pdf export) and zero external runtime dependencies.";
    }
    if (/(privacy|security|key|encrypt|cloud|offline|local|mac|windows)/.test(s)) {
      return "Everything runs natively on Mac or Windows with your own API key encrypted via AES-256-GCM and a local SQLite WAL database — your files never live on third-party clouds.";
    }
    return `NovaForge builds local-first AI software (Float AI Agent & Float for Finance) with zero external dependencies. Type 'help' for commands or email ${EMAIL} to speak with our founders.`;
  }

  async function handleTerminalCommand(raw) {
    const text = raw.trim();
    if (!text || busy) return;

    cmdHistory.push(text);
    histIdx = -1;
    busy = true;

    const id = ++runId;
    const alive = () => id === runId;

    const inputRow = terminalBody.querySelector(".term-input-line");
    if (inputRow) inputRow.remove();
    appendLine([el("span", "term-prompt", PROMPT), el("span", "term-cmd", text)]);

    const lower = text.toLowerCase();

    if (lower === "clear") {
      terminalBody.innerHTML = "";
      busy = false;
      mountPrompt(true);
      return;
    }

    if (lower === "replay") {
      busy = false;
      runTerminal(currentScene);
      return;
    }

    if (lower === "help" || lower === "?") {
      await typeText(
        "Commands: products · float · finance · founders · pricing · contact · replay · clear\n" +
        "Tip: Ask any question in plain English, or run `setkey <api-key>` to use your live AI key.",
        "term-info",
        alive,
        8
      );
      busy = false;
      mountPrompt(true);
      return;
    }

    if (lower.startsWith("setkey ")) {
      const parts = text.slice(7).trim().split(/\s+/);
      let prov = TERMINAL_AI.provider;
      let key = parts[0] || "";
      if (parts.length >= 2 && ["openai", "openrouter", "anthropic", "gemini"].includes(parts[0].toLowerCase())) {
        prov = parts[0].toLowerCase();
        key = parts[1];
      }
      try {
        sessionStorage.setItem(SESSION_KEY_STORAGE, key);
        sessionStorage.setItem(SESSION_PROV_STORAGE, prov);
      } catch { /* ignore */ }
      await typeText(`✓ Session API key saved for ${prov}. Ask any question now!`, "term-ok", alive, 10);
      busy = false;
      mountPrompt(true);
      return;
    }

    if (lower === "clearkey") {
      try {
        sessionStorage.removeItem(SESSION_KEY_STORAGE);
        sessionStorage.removeItem(SESSION_PROV_STORAGE);
      } catch { /* ignore */ }
      await typeText("✓ Cleared session API key (using built-in NovaForge assistant).", "term-ok", alive, 10);
      busy = false;
      mountPrompt(true);
      return;
    }

    if (lower === "whoami") {
      await typeText("guest@novaforge — welcome! Ask anything about our products.", "term-info", alive, 10);
      busy = false;
      mountPrompt(true);
      return;
    }

    if (lower === "ls") {
      await typeText("float-ai-agent/   float-for-finance/   founders.txt   pricing.txt", "term-info", alive, 10);
      busy = false;
      mountPrompt(true);
      return;
    }

    // AI Response (uses live API key if configured, otherwise NovaForge assistant)
    setStatus("Thinking…", false);
    const spinSpan = el("span", "term-spin", `${SPIN[0]} Thinking…`);
    const spinLine = appendLine([spinSpan]);
    let spinIdx = 0;
    const spinTimer = setInterval(() => {
      spinIdx = (spinIdx + 1) % SPIN.length;
      spinSpan.textContent = `${SPIN[spinIdx]} Thinking…`;
    }, 80);

    let answer = "";
    const cfg = getActiveAI();
    try {
      if (cfg.apiKey) {
        answer = await callProviderAI(text, cfg);
      } else {
        await sleep(320);
        answer = offlineNovaForgeAI(text);
      }
    } catch {
      answer = offlineNovaForgeAI(text);
    } finally {
      clearInterval(spinTimer);
      spinLine.remove();
    }

    if (!alive()) {
      busy = false;
      return;
    }

    await typeText(answer.trim() || offlineNovaForgeAI(text), "term-ai", alive, 11);
    setStatus("Interactive · type a question below", true);
    busy = false;
    mountPrompt(true);
  }

  // Render everything at once (reduced motion, or a finished state).
  function renderStatic(script) {
    terminalBody.innerHTML = "";
    script.forEach((step) => {
      if (step.type === "cmd") {
        appendLine([el("span", "term-prompt", PROMPT), el("span", "term-cmd", step.text)]);
      } else if (step.type === "progress") {
        appendLine([el("span", "term-ok", "✓ " + step.done)]);
      } else {
        appendLine([el("span", step.type === "ok" ? "term-ok" : "term-info", step.text)]);
      }
    });
    appendLine([el("span", "term-hint", "Easter egg unlocked: type a question or 'help' below.")]);
    setStatus("Interactive · type a question below", true);
    mountPrompt(false);
  }

  async function runTerminal(sceneKey) {
    if (!terminalBody) return;
    currentScene = sceneKey || currentScene;
    busy = false;
    const id = ++runId;
    const alive = () => id === runId;
    const script = SCENES[currentScene] || SCENES.float;

    if (reduceMotion) {
      renderStatic(script);
      return;
    }

    terminalBody.innerHTML = "";
    setStatus("Running…", false);
    await sleep(160);

    for (const step of script) {
      if (!alive()) return;

      if (step.type === "cmd") {
        const cmd = el("span", "term-cmd");
        const cursor = el("span", "term-cursor");
        appendLine([el("span", "term-prompt", PROMPT), cmd, cursor]);
        await sleep(180);
        for (const ch of step.text) {
          if (!alive()) return;
          cmd.textContent += ch;
          await sleep(ch === " " ? 38 : 18 + Math.random() * 20);
        }
        await sleep(150);
        cursor.remove();
      } else if (step.type === "progress") {
        const span = el("span", "term-spin");
        appendLine([span]);
        for (let i = 0; i <= 20; i++) {
          if (!alive()) return;
          const filled = Math.round(i / 2);
          span.textContent =
            `${SPIN[i % SPIN.length]} ${step.label} ` +
            `[${"█".repeat(filled)}${"░".repeat(10 - filled)}] ${i * 5}%`;
          await sleep(35);
        }
        span.className = "term-ok";
        span.textContent = "✓ " + step.done;
        await sleep(180);
      } else {
        appendLine([el("span", step.type === "ok" ? "term-ok" : "term-info", step.text)]);
        await sleep(220);
      }
    }

    if (!alive()) return;
    appendLine([el("span", "term-hint", "Easter egg unlocked: type any question or 'help' below.")]);
    setStatus("Interactive · type a question below", true);
    mountPrompt(false);
  }

  if (terminalBody) {
    terminalBody.addEventListener("click", () => {
      const inp = $("termInput");
      if (inp) inp.focus();
    });
  }

  function selectScene(tab) {
    termTabs.forEach((t) => {
      const on = t === tab;
      t.classList.toggle("active", on);
      t.setAttribute("aria-selected", String(on));
      t.tabIndex = on ? 0 : -1;
    });
    runTerminal(tab.dataset.scene || "float");
  }

  termTabs.forEach((tab, i) => {
    tab.addEventListener("click", () => selectScene(tab));
    tab.addEventListener("keydown", (e) => {
      if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
      const next = termTabs[(i + (e.key === "ArrowRight" ? 1 : -1) + termTabs.length) % termTabs.length];
      next.focus();
      selectScene(next);
    });
  });

  if (replayBtn) {
    replayBtn.addEventListener("click", () => runTerminal(currentScene));
  }

  if (terminalBody) {
    runTerminal("float");
  }

  /* ── Product capability switchers ────────────────────────────────────── */
  const DETAILS = {
    "agent-sheets": "Built-in 1,000 × 1,000 spreadsheet grid supporting Excel (.xlsx) import and export, PDF generation, live charts, and formulas without leaving the app.",
    "agent-security": "Your API key stays encrypted on disk with a device-bound key, travels inside AES-256-GCM envelopes, and is guarded by Host and origin checks. No third-party tracking.",
    "agent-admin": "Admins control model access, monthly spend limits for each member, workspace notices, and automatic daily backups from one clear panel.",
    "fin-tax": "Exact decimal tax math with immutable issued GST invoices, database-level protection, and driver payroll covering PF, ESI, PT, and TDS.",
    "fin-risk": "A three-tier approval policy lets desk staff prepare routine work while owners and finance managers sign off on bank, salary, and payout changes.",
    "fin-dpdp": "Recorded consent for bank details and driver photos, automatic removal of GPS and EXIF data from photos, and 30, 60, and 90-day vehicle document reminders."
  };

  document.querySelectorAll(".pill-switcher").forEach((group) => {
    const box = $("detail-" + group.dataset.card);
    let token = 0;
    group.querySelectorAll(".pill-btn").forEach((btn) => {
      btn.setAttribute("aria-pressed", String(btn.classList.contains("active")));
      btn.addEventListener("click", () => {
        if (btn.classList.contains("active")) return;
        group.querySelectorAll(".pill-btn").forEach((b) => {
          b.classList.toggle("active", b === btn);
          b.setAttribute("aria-pressed", String(b === btn));
        });
        if (!box) return;
        const mine = ++token;
        box.style.opacity = "0";
        setTimeout(() => {
          if (mine !== token) return;
          box.textContent = DETAILS[btn.dataset.detail] || "";
          box.style.opacity = "1";
        }, 160);
      });
    });
  });

  /* ── "How it fits your office" preview ───────────────────────────────── */
  const WF_DATA = [
    {
      address: "Float · First launch",
      tag: "Step 01 · Local workspace",
      title: "Opens straight away on Mac or Windows",
      desc: "Run Float on one computer or share it across your office network. The database sets itself up beside the app.",
      rows: [
        ["Extra software needed", "None"],
        ["Where data lives", "Your own computer"],
        ["Backups", "Automatic, every day"]
      ]
    },
    {
      address: "Settings · Model & keys",
      tag: "Step 02 · Bring your own key",
      title: "Connect OpenAI, Anthropic, Google, or a local model",
      desc: "Paste your company key once. Float encrypts it, and team members only ever see the last four characters.",
      rows: [
        ["Key protection", "AES-256-GCM"],
        ["Visible to staff", "Last 4 characters"],
        ["Spending", "Monthly limit per member"]
      ]
    },
    {
      address: "Float for Finance · Approvals",
      tag: "Step 03 · Human sign-off",
      title: "Float prepares the work. Your managers decide.",
      desc: "Payroll runs, bank updates, deposit adjustments, and final GST invoices wait for a named person to approve them.",
      rows: [
        ["Driver salary run", "Waiting for approval"],
        ["GST invoice INV-2041", "Locked once issued"],
        ["Activity history", "Every change recorded"]
      ]
    }
  ];

  const wfSteps = document.querySelectorAll(".wf-step");
  const previewTitle = $("previewTitle");
  const previewContent = $("previewContent");
  let wfToken = 0;

  function buildPreview(data) {
    previewContent.innerHTML = "";
    const rows = el("div", "pv-rows");
    data.rows.forEach(([k, v]) => {
      const row = el("div", "pv-row");
      row.append(el("strong", null, k), el("span", "pv-pill", v));
      rows.append(row);
    });
    previewContent.append(el("div", "pv-tag", data.tag), el("h4", null, data.title), el("p", null, data.desc), rows);
    if (previewTitle) previewTitle.textContent = data.address;
  }

  function renderWorkflowStep(idx, animate) {
    if (!previewContent) return;
    const data = WF_DATA[idx] || WF_DATA[0];
    if (!animate || reduceMotion) {
      buildPreview(data);
      return;
    }
    const mine = ++wfToken;
    previewContent.classList.add("switching");
    setTimeout(() => {
      if (mine !== wfToken) return;
      buildPreview(data);
      previewContent.classList.remove("switching");
    }, 180);
  }

  renderWorkflowStep(0, false);
  wfSteps.forEach((step) => {
    step.addEventListener("click", () => {
      if (step.classList.contains("active")) return;
      wfSteps.forEach((s) => {
        const on = s === step;
        s.classList.toggle("active", on);
        s.setAttribute("aria-selected", String(on));
      });
      renderWorkflowStep(Number(step.dataset.step || 0), true);
    });
  });

  /* ── FAQ accordion ───────────────────────────────────────────────────── */
  document.querySelectorAll(".faq-item").forEach((item) => {
    const btn = item.querySelector(".faq-q");
    if (!btn) return;
    btn.addEventListener("click", () => {
      const wasOpen = item.classList.contains("open");
      document.querySelectorAll(".faq-item.open").forEach((other) => {
        other.classList.remove("open");
        const q = other.querySelector(".faq-q");
        if (q) q.setAttribute("aria-expanded", "false");
      });
      if (!wasOpen) {
        item.classList.add("open");
        btn.setAttribute("aria-expanded", "true");
      }
    });
  });

  /* ── Toast ───────────────────────────────────────────────────────────── */
  const toastEl = $("toast");
  let toastTimer = null;
  function showToast(msg) {
    if (!toastEl) return;
    toastEl.hidden = true;
    void toastEl.offsetWidth; // restart the pop animation
    toastEl.textContent = msg;
    toastEl.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { toastEl.hidden = true; }, 2800);
  }

  async function copyText(text) {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return;
    }
    // Fallback for non-HTTPS pages and older browsers
    const area = document.createElement("textarea");
    area.value = text;
    area.setAttribute("readonly", "");
    area.style.position = "fixed";
    area.style.opacity = "0";
    document.body.append(area);
    area.select();
    const ok = document.execCommand("copy");
    area.remove();
    if (!ok) throw new Error("copy failed");
  }

  /* ── Contact ─────────────────────────────────────────────────────────── */
  const copyEmailBtn = $("copyEmailBtn");
  if (copyEmailBtn) {
    copyEmailBtn.addEventListener("click", async () => {
      try {
        await copyText(EMAIL);
        showToast("Email address copied");
      } catch {
        showToast(EMAIL);
      }
    });
  }

  const productSelect = $("productSelect");
  document.querySelectorAll("[data-product]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const wanted = btn.getAttribute("data-product");
      if (productSelect && [...productSelect.options].some((o) => o.value === wanted)) {
        productSelect.value = wanted;
      }
    });
  });

  function inquiry() {
    const company = ($("companyName")?.value || "").trim();
    const product = productSelect?.value || "Float AI Agent";
    const message = ($("messageInput")?.value || "").trim();
    const subject = `NovaForge inquiry: ${product}${company ? " (" + company + ")" : ""}`;
    const body =
      "Hello NovaForge team,\n\n" +
      `Name / company: ${company || "-"}\n` +
      `Product: ${product}\n\n` +
      `${message || "We would like to know more about pricing and licensing for our team."}\n`;
    return { subject, body };
  }

  const copyDraftBtn = $("copyDraftBtn");
  if (copyDraftBtn) {
    copyDraftBtn.addEventListener("click", async () => {
      const { subject, body } = inquiry();
      try {
        await copyText(`To: ${EMAIL}\nSubject: ${subject}\n\n${body}`);
        showToast("Message copied. Paste it into any email app.");
      } catch {
        showToast("Please write to " + EMAIL);
      }
    });
  }

  const contactForm = $("contactForm");
  if (contactForm) {
    contactForm.addEventListener("submit", (e) => {
      e.preventDefault();
      if (!contactForm.reportValidity()) return;
      const { subject, body } = inquiry();
      window.location.href =
        `mailto:${EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      showToast("Opening your email app…");
    });
  }
})();
