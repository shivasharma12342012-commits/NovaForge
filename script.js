(function () {
  "use strict";

  const EMAIL = "info.novaforge.2026@gmail.com";

  /* ── Scroll progress, header shadow & back-to-top ────────────────────── */
  const progressBar = document.getElementById("scrollProgress");
  const header = document.getElementById("siteHeader");
  const backToTop = document.getElementById("backToTop");

  window.addEventListener("scroll", () => {
    const doc = document.documentElement;
    const scrolled = doc.scrollTop || document.body.scrollTop;
    const max = doc.scrollHeight - doc.clientHeight;
    if (progressBar && max > 0) {
      progressBar.style.width = Math.min(100, (scrolled / max) * 100) + "%";
    }
    if (header) {
      header.classList.toggle("scrolled", scrolled > 12);
    }
    if (backToTop) {
      backToTop.hidden = scrolled < 420;
    }
  }, { passive: true });

  if (backToTop) {
    backToTop.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  /* ── Mobile navigation drawer ────────────────────────────────────────── */
  const menuToggle = document.getElementById("menuToggle");
  const mobileNav = document.getElementById("mobileNav");
  if (menuToggle && mobileNav) {
    menuToggle.addEventListener("click", () => {
      const open = mobileNav.hidden;
      mobileNav.hidden = !open;
      menuToggle.setAttribute("aria-expanded", String(open));
    });
    mobileNav.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        mobileNav.hidden = true;
        menuToggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  /* ── Pointer-following subtle paper sheen on cards ───────────────────── */
  document.querySelectorAll(".sheen-card").forEach((card) => {
    card.addEventListener("mousemove", (e) => {
      const rect = card.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      card.style.setProperty("--mx", x.toFixed(1) + "%");
      card.style.setProperty("--my", y.toFixed(1) + "%");
    });
  });

  /* ── Intersection Observer reveals & SVG draw triggers ───────────────── */
  const reveals = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.14 });
    reveals.forEach((el) => observer.observe(el));
  } else {
    reveals.forEach((el) => el.classList.add("visible"));
  }

  /* ── Animated numeric counters ───────────────────────────────────────── */
  const counters = document.querySelectorAll(".counter");
  const animateCounter = (el) => {
    const target = Number(el.dataset.target || 0);
    const suffix = el.dataset.suffix || "";
    if (target === 0) {
      el.textContent = "0" + suffix;
      return;
    }
    const duration = 950;
    const start = performance.now();
    const step = (now) => {
      const progress = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.round(target * eased) + suffix;
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };

  if ("IntersectionObserver" in window) {
    const cObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          cObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });
    counters.forEach((c) => cObserver.observe(c));
  } else {
    counters.forEach(animateCounter);
  }

  /* ── Cute Animated Mac Terminal (2 interactive scenes + spinner + bar) ─ */
  const terminalBody = document.getElementById("terminalBody");
  const replayBtn = document.getElementById("termReplay");
  const statusDot = document.getElementById("termStatusDot");
  const statusText = document.getElementById("termStatusText");
  const termTabs = document.querySelectorAll(".term-tab");

  const SCENES = {
    float: [
      { type: "cmd", text: "float init --company \"NovaForge Demo\"" },
      { type: "progress", label: "Initializing encrypted SQLite vault", done: "Vault ready (0 external runtime deps)" },
      { type: "cmd", text: "float sheets --build budget_2027.xlsx" },
      { type: "info", text: "  Allocated 1,000 × 1,000 studio grid + formulas" },
      { type: "cmd", text: "float export --format pdf --verify" },
      { type: "ok", text: "✓ Exported locally · API keys sealed via AES-256-GCM" }
    ],
    finance: [
      { type: "cmd", text: "float-finance check --gst --payroll" },
      { type: "progress", label: "Verifying immutable GST ledgers & TDS", done: "Decimal ROUND_HALF_UP checks passed" },
      { type: "cmd", text: "float-finance alerts --window 30d" },
      { type: "info", text: "  Checked insurance, PUC, fitness & permit dates" },
      { type: "cmd", text: "float-finance privacy --scrub-exif" },
      { type: "ok", text: "✓ DPDP consent active · 3-tier owner floor locked" }
    ]
  };

  let currentScene = "float";
  let animRunId = 0;

  async function runTerminal(sceneKey = currentScene) {
    if (!terminalBody) return;
    currentScene = sceneKey;
    const runId = ++animRunId;
    terminalBody.innerHTML = "";
    if (statusDot) statusDot.classList.remove("done");
    if (statusText) statusText.textContent = "Running on local MacBook...";

    const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
    const script = SCENES[sceneKey] || SCENES.float;

    for (const step of script) {
      if (runId !== animRunId) return;
      const line = document.createElement("div");
      line.className = "term-line";

      if (step.type === "cmd") {
        const prompt = document.createElement("span");
        prompt.className = "term-prompt";
        prompt.textContent = "novaforge@mac ~ % ";
        const cmd = document.createElement("span");
        cmd.className = "term-cmd";
        const cursor = document.createElement("span");
        cursor.className = "term-cursor";
        line.append(prompt, cmd, cursor);
        terminalBody.append(line);

        for (const ch of step.text) {
          if (runId !== animRunId) return;
          cmd.textContent += ch;
          await sleep(24 + Math.random() * 20);
        }
        await sleep(190);
        cursor.remove();
      } else if (step.type === "progress") {
        const spin = document.createElement("span");
        spin.className = "term-spin";
        line.append(spin);
        terminalBody.append(line);
        const frames = ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"];
        for (let i = 0; i <= 10; i++) {
          if (runId !== animRunId) return;
          const filled = "█".repeat(i);
          const empty = "░".repeat(10 - i);
          spin.textContent = `${frames[i % frames.length]} ${step.label} [${filled}${empty}] ${i * 10}%`;
          await sleep(65);
        }
        spin.className = "term-ok";
        spin.textContent = `✓ ${step.done}`;
        await sleep(180);
      } else {
        const out = document.createElement("span");
        out.className = step.type === "ok" ? "term-ok" : "term-info";
        out.textContent = step.text;
        line.append(out);
        terminalBody.append(line);
        await sleep(240);
      }
    }

    if (runId !== animRunId) return;
    const idle = document.createElement("div");
    idle.className = "term-line";
    const prompt = document.createElement("span");
    prompt.className = "term-prompt";
    prompt.textContent = "novaforge@mac ~ % ";
    const cursor = document.createElement("span");
    cursor.className = "term-cursor";
    idle.append(prompt, cursor);
    terminalBody.append(idle);

    if (statusDot) statusDot.classList.add("done");
    if (statusText) statusText.textContent = "Completed cleanly on workstation";
  }

  runTerminal("float");
  if (replayBtn) {
    replayBtn.addEventListener("click", () => runTerminal(currentScene));
  }
  termTabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      termTabs.forEach((t) => {
        t.classList.remove("active");
        t.setAttribute("aria-selected", "false");
      });
      tab.classList.add("active");
      tab.setAttribute("aria-selected", "true");
      runTerminal(tab.dataset.scene || "float");
    });
  });

  /* ── Interactive product detail switchers ────────────────────────────── */
  const DETAILS = {
    "agent-sheets": "Built-in 1,000 × 1,000 spreadsheet grid supporting Excel (.xlsx) import/export, PDF generation, live charts, and formula evaluation without leaving the app.",
    "agent-security": "Your API key stays encrypted on disk using a device-bound key, with AES-256-GCM transport envelopes, CSRF checks, and zero third-party telemetry.",
    "agent-admin": "Admins control model access, team monthly spend caps, workspace notices, and automated local daily backups from one uncluttered panel.",
    "fin-tax": "Exact Decimal ROUND_HALF_UP tax math with immutable issued GST invoices, database-level protection triggers, and driver payroll covering PF, ESI, PT, and TDS.",
    "fin-risk": "Three-tier approval engine lets desk staff prepare routine drafts while enforcing owner and finance manager sign-off on bank, salary, and payout actions.",
    "fin-dpdp": "Mandatory consent recording for bank details and driver photos, GPS/EXIF photo metadata scrubbing, and 30/60/90-day vehicle expiry monitoring."
  };

  document.querySelectorAll(".pill-switcher").forEach((group) => {
    const cardKey = group.dataset.card;
    const box = document.getElementById("detail-" + cardKey);
    group.querySelectorAll(".pill-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        group.querySelectorAll(".pill-btn").forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");
        if (box) {
          box.style.opacity = "0";
          setTimeout(() => {
            box.textContent = DETAILS[btn.dataset.detail] || "";
            box.style.opacity = "1";
          }, 130);
        }
      });
    });
  });

  /* ── Interactive "How It Fits Your Office" preview ───────────────────── */
  const WF_DATA = [
    {
      address: "localhost:8080 · Zero-Dependency Startup",
      tag: "Step 01 · Local Workspace",
      title: "Opens instantly on Mac or Windows",
      desc: "Launch Float on one workstation or share across an office LAN. Your SQLite WAL database initializes automatically beside the application.",
      rows: [
        ["Runtime requirements", "Zero external packages"],
        ["Storage engine", "SQLite WAL + automated daily backups"],
        ["Startup speed", "Sub-second local launch"]
      ]
    },
    {
      address: "Settings · Encrypted Key Vault",
      tag: "Step 02 · Bring Your Own Key",
      title: "Connect OpenAI, Anthropic, Google, or local AI",
      desc: "Paste your organization key once. Float seals credentials in transit and masks keys across team accounts so nothing is exposed.",
      rows: [
        ["Transport encryption", "AES-256-GCM sealed envelope"],
        ["Visible key preview", "Last 4 characters only"],
        ["Monthly allowance control", "Per-member caps + live usage gauge"]
      ]
    },
    {
      address: "Float Finance · Manager Approval Queue",
      tag: "Step 03 · Human Sign-Off",
      title: "AI drafts cleanly. Your managers decide.",
      desc: "Sensitive actions — payroll runs, bank updates, deposit adjustments, and GST invoice finalization — wait for named human approval.",
      rows: [
        ["Driver Salary Queue", "Pending Finance Manager approval"],
        ["GST Invoice #INV-2041", "Locked & immutable once issued"],
        ["Audit Trail", "Full before/after change history"]
      ]
    }
  ];

  const wfSteps = document.querySelectorAll(".wf-step");
  const previewTitle = document.getElementById("previewTitle");
  const previewContent = document.getElementById("previewContent");

  function renderWorkflowStep(idx) {
    const data = WF_DATA[idx] || WF_DATA[0];
    if (!previewContent) return;
    previewContent.classList.add("switching");
    setTimeout(() => {
      if (previewTitle) previewTitle.textContent = data.address;
      previewContent.innerHTML = "";
      const tag = document.createElement("div");
      tag.className = "pv-tag";
      tag.textContent = data.tag;
      const h4 = document.createElement("h4");
      h4.textContent = data.title;
      const p = document.createElement("p");
      p.textContent = data.desc;

      const rows = document.createElement("div");
      rows.className = "pv-rows";
      data.rows.forEach(([k, v]) => {
        const row = document.createElement("div");
        row.className = "pv-row";
        const strong = document.createElement("strong");
        strong.textContent = k;
        const pill = document.createElement("span");
        pill.className = "pv-pill";
        pill.textContent = v;
        row.append(strong, pill);
        rows.append(row);
      });

      previewContent.append(tag, h4, p, rows);
      previewContent.classList.remove("switching");
    }, 150);
  }

  renderWorkflowStep(0);
  wfSteps.forEach((step) => {
    step.addEventListener("click", () => {
      wfSteps.forEach((s) => {
        s.classList.remove("active");
        s.setAttribute("aria-selected", "false");
      });
      step.classList.add("active");
      step.setAttribute("aria-selected", "true");
      renderWorkflowStep(Number(step.dataset.step || 0));
    });
  });

  /* ── FAQ Accordion ───────────────────────────────────────────────────── */
  document.querySelectorAll(".faq-item").forEach((item) => {
    const btn = item.querySelector(".faq-q");
    if (!btn) return;
    btn.addEventListener("click", () => {
      const wasOpen = item.classList.contains("open");
      document.querySelectorAll(".faq-item.open").forEach((openItem) => {
        openItem.classList.remove("open");
        const q = openItem.querySelector(".faq-q");
        if (q) q.setAttribute("aria-expanded", "false");
      });
      if (!wasOpen) {
        item.classList.add("open");
        btn.setAttribute("aria-expanded", "true");
      }
    });
  });

  /* ── Toast notification ──────────────────────────────────────────────── */
  const toastEl = document.getElementById("toast");
  let toastTimer = null;
  function showToast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toastEl.hidden = true;
    }, 2800);
  }

  /* ── Email copy, product preselect & mailto inquiry ──────────────────── */
  const copyEmailBtn = document.getElementById("copyEmailBtn");
  if (copyEmailBtn) {
    copyEmailBtn.addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(EMAIL);
        showToast("Copied " + EMAIL);
      } catch {
        showToast("Contact email: " + EMAIL);
      }
    });
  }

  const productSelect = document.getElementById("productSelect");
  document.querySelectorAll("[data-product]").forEach((btn) => {
    btn.addEventListener("click", () => {
      if (productSelect) {
        productSelect.value = btn.getAttribute("data-product") || "Float AI Agent";
      }
    });
  });

  function buildInquiryDetails() {
    const company = (document.getElementById("companyName")?.value || "").trim();
    const product = document.getElementById("productSelect")?.value || "Float AI Agent";
    const message = (document.getElementById("messageInput")?.value || "").trim();
    const subject = `NovaForge Inquiry: ${product}${company ? " — " + company : ""}`;
    const body =
      `Hello NovaForge Team (Prabhjot, Shiva & Yatharth),\n\n` +
      `Company / Name: ${company || "N/A"}\n` +
      `Product of Interest: ${product}\n\n` +
      `${message || "We would like to discuss licensing and pricing for our team."}\n`;
    return { subject, body };
  }

  const copyDraftBtn = document.getElementById("copyDraftBtn");
  if (copyDraftBtn) {
    copyDraftBtn.addEventListener("click", async () => {
      const { subject, body } = buildInquiryDetails();
      const text = `To: ${EMAIL}\nSubject: ${subject}\n\n${body}`;
      try {
        await navigator.clipboard.writeText(text);
        showToast("Inquiry text & email copied to clipboard.");
      } catch {
        showToast("Email: " + EMAIL);
      }
    });
  }

  const contactForm = document.getElementById("contactForm");
  if (contactForm) {
    contactForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const { subject, body } = buildInquiryDetails();
      window.location.href = `mailto:${EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      showToast("Opening email draft to " + EMAIL);
    });
  }
})();
