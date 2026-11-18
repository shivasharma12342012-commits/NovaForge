(function () {
  "use strict";

  const EMAIL = "info.novaforge.2026@gmail.com";
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
  let currentScene = "float";
  let runId = 0;

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
    appendLine([el("span", "term-prompt", PROMPT), el("span", "term-cursor")]);
    setStatus("Finished on this Mac", true);
  }

  async function runTerminal(sceneKey) {
    if (!terminalBody) return;
    currentScene = sceneKey || currentScene;
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
    appendLine([el("span", "term-prompt", PROMPT), el("span", "term-cursor")]);
    setStatus("Finished on this Mac", true);
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
