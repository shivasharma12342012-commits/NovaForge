(function () {
  "use strict";

  const EMAIL = "info.novaforge.2026@gmail.com";

  /* ── Scroll progress & header shadow ─────────────────────────────────── */
  const progressBar = document.getElementById("scrollProgress");
  const header = document.getElementById("siteHeader");

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
  }, { passive: true });

  /* ── Mobile menu ─────────────────────────────────────────────────────── */
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

  /* ── Scroll reveal animations ────────────────────────────────────────── */
  const reveals = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    reveals.forEach((el) => observer.observe(el));
  } else {
    reveals.forEach((el) => el.classList.add("visible"));
  }

  /* ── Animated counters ───────────────────────────────────────────────── */
  const counters = document.querySelectorAll(".counter");
  const animateCounter = (el) => {
    const target = Number(el.dataset.target || 0);
    if (target === 0) {
      el.textContent = "0";
      return;
    }
    const duration = 900;
    const start = performance.now();
    const step = (now) => {
      const progress = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = String(Math.round(target * eased));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };

  if ("IntersectionObserver" in window) {
    const counterObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          counterObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });
    counters.forEach((c) => counterObserver.observe(c));
  } else {
    counters.forEach(animateCounter);
  }

  /* ── Cute Mac Terminal typing animation ──────────────────────────────── */
  const terminalBody = document.getElementById("terminalBody");
  const replayBtn = document.getElementById("termReplay");

  const SCRIPT = [
    { type: "cmd", text: "float init --company \"Apex Fleet\"" },
    { type: "ok", text: "✓ Encrypted local SQLite ready (0 external deps)" },
    { type: "cmd", text: "float-sheets new --size 1000x1000 --export xlsx" },
    { type: "info", text: "  Built Q3_Fleet_Unit_Economics.xlsx in 0.14s" },
    { type: "cmd", text: "float-finance check --gst --payroll --dpdp" },
    { type: "ok", text: "✓ GST invoices locked · PF/ESI/TDS verified" },
    { type: "ok", text: "✓ 3-tier owner approval policy active" }
  ];

  let animRunId = 0;

  async function runTerminal() {
    if (!terminalBody) return;
    const runId = ++animRunId;
    terminalBody.innerHTML = "";

    const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

    for (const step of SCRIPT) {
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
          await sleep(28 + Math.random() * 24);
        }
        await sleep(220);
        cursor.remove();
      } else {
        const out = document.createElement("span");
        out.className = step.type === "ok" ? "term-ok" : "term-info";
        out.textContent = step.text;
        line.append(out);
        terminalBody.append(line);
        await sleep(280);
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
  }

  runTerminal();
  if (replayBtn) {
    replayBtn.addEventListener("click", runTerminal);
  }

  /* ── Toast helper ────────────────────────────────────────────────────── */
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

  /* ── Copy email & product pre-selection ──────────────────────────────── */
  const copyBtn = document.getElementById("copyEmailBtn");
  if (copyBtn) {
    copyBtn.addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(EMAIL);
        showToast("Copied " + EMAIL);
      } catch {
        showToast("Email: " + EMAIL);
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

  /* ── Contact form mailto builder ─────────────────────────────────────── */
  const contactForm = document.getElementById("contactForm");
  if (contactForm) {
    contactForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const company = (document.getElementById("companyName")?.value || "").trim();
      const product = document.getElementById("productSelect")?.value || "Float";
      const message = (document.getElementById("messageInput")?.value || "").trim();

      const subject = encodeURIComponent(`NovaForge Inquiry: ${product}${company ? " — " + company : ""}`);
      const body = encodeURIComponent(
        `Hello NovaForge Team,\n\n` +
        `Company / Name: ${company || "N/A"}\n` +
        `Product of Interest: ${product}\n\n` +
        `${message || "Please share licensing and pricing details."}\n`
      );
      window.location.href = `mailto:${EMAIL}?subject=${subject}&body=${body}`;
      showToast("Opening your email client…");
    });
  }
})();
