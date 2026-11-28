(function () {
  "use strict";

  const EMAIL = "info.novaforge.2026@gmail.com";
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const $ = (id) => document.getElementById(id);

  /* ── Sticky header shadow, scroll progress (GPU scaleX) & active nav ──── */
  const header = $("siteHeader");
  const progressBar = $("scrollProgress");
  const backToTop = $("backToTop");
  const menuToggle = $("menuToggle");
  const mobileNav = $("mobileNav");
  const trackedNavLinks = document.querySelectorAll(".nav-links a[data-section], .mobile-nav a[data-section]");
  const trackedSections = [...new Set([...trackedNavLinks].map((a) => a.dataset.section))]
    .map((id) => $(id))
    .filter(Boolean);

  let ticking = false;
  function setActiveNav(activeId) {
    trackedNavLinks.forEach((link) => {
      const match = link.dataset.section === activeId;
      link.classList.toggle("active", match);
      if (match) link.setAttribute("aria-current", "location");
      else link.removeAttribute("aria-current");
    });
  }

  function updateActiveSection() {
    if (!trackedSections.length) return;
    const scrollPos = window.scrollY + (header ? header.offsetHeight : 64) + 120;
    const atBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 40;
    if (atBottom) {
      setActiveNav(trackedSections[trackedSections.length - 1].id);
      return;
    }
    let current = "";
    for (const sec of trackedSections) {
      if (sec.offsetTop <= scrollPos) current = sec.id;
    }
    setActiveNav(current);
  }

  function onScroll() {
    const y = window.scrollY;
    const doc = document.documentElement;
    const max = doc.scrollHeight - doc.clientHeight;
    if (progressBar) {
      const ratio = max > 0 ? Math.min(1, Math.max(0, y / max)) : 0;
      progressBar.style.transform = `scaleX(${ratio.toFixed(4)})`;
    }
    if (header) header.classList.toggle("scrolled", y > 8);
    if (backToTop) backToTop.hidden = y < 480;
    updateActiveSection();
    ticking = false;
  }

  window.addEventListener("scroll", () => {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(onScroll);
    }
  }, { passive: true });
  onScroll();

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
    menuToggle.addEventListener("click", (e) => {
      e.stopPropagation();
      const willOpen = mobileNav.hidden;
      mobileNav.hidden = !willOpen;
      menuToggle.setAttribute("aria-expanded", String(willOpen));
      menuToggle.setAttribute("aria-label", willOpen ? "Close menu" : "Open menu");
    });
    mobileNav.querySelectorAll("a").forEach((link) => link.addEventListener("click", closeMenu));
    document.addEventListener("click", (e) => {
      if (!mobileNav.hidden && !mobileNav.contains(e.target) && !menuToggle.contains(e.target)) closeMenu();
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") closeMenu();
    });
  }

  /* ── Scroll reveal (guaranteed visible fallback) ─────────────────────── */
  const reveals = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && !reduceMotion) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.02, rootMargin: "0px 0px -12px 0px" });
    reveals.forEach((el) => io.observe(el));
  } else {
    reveals.forEach((el) => el.classList.add("visible"));
  }

  /* ── Interactive Hero Live Counter Showcase (4 Tabs) ─────────────────── */
  const counterBody = $("counterBody");
  const counterTabs = document.querySelectorAll(".counter-tab");
  let waveDispatched = false;
  let challanPosted = false;

  function renderCounterView(view) {
    if (!counterBody) return;
    if (view === "wave") {
      counterBody.innerHTML = `
        <div class="cv-kpis">
          <div class="cv-kpi"><span>Pickups due</span><strong>${waveDispatched ? "0 pending" : "14 cars"}</strong></div>
          <div class="cv-kpi"><span>Overdue alerts</span><strong class="cv-warn">2 returns</strong></div>
          <div class="cv-kpi"><span>Wash-bay TAT</span><strong class="cv-good">18 min avg</strong></div>
        </div>
        <div class="cv-list">
          <div class="cv-row"><span><strong>MH-02-HV-4589</strong> · Innova Hycross</span><span class="cv-tag ${waveDispatched ? "cv-tag-good" : ""}">${waveDispatched ? "Dispatched" : "Ready · Bay 2"}</span></div>
          <div class="cv-row"><span><strong>DL-01-CD-8821</strong> · Dzire AT</span><span class="cv-tag ${waveDispatched ? "cv-tag-good" : ""}">${waveDispatched ? "Dispatched" : "Ready · Bay 4"}</span></div>
          <div class="cv-row"><span><strong>MH-01-EF-1904</strong> · Ertiga ZXi</span><span class="cv-tag">Wash 14m · Mark Ready</span></div>
        </div>
        <button
          type="button"
          class="astryx-button cv-action-btn"
          id="cvDispatchBtn"
          data-astryx-component="button"
          data-variant="${waveDispatched ? "success" : "primary"}"
          data-size="lg"
          data-width="full"
        >
          <span class="astryx-button-content">
            <span class="astryx-button-label">${waveDispatched ? "✓ 14 conflict-free cars dispatched (0.21s)" : "1-click dispatch 14 conflict-free cars"}</span>
          </span>
        </button>`;
      const btn = $("cvDispatchBtn");
      if (btn) btn.addEventListener("click", () => { waveDispatched = !waveDispatched; renderCounterView("wave"); });
    } else if (view === "fastag") {
      counterBody.innerHTML = `
        <div class="cv-input-bar">
          <span class="cv-chip">Plate: <strong>MH-02-HV-4589</strong></span>
          <span class="cv-chip">Timestamp: <strong>14 Oct, 16:42</strong></span>
        </div>
        <div class="cv-match-card">
          <div class="cv-match-head"><span>Instant match · 0.04s</span><strong>Booking #FLT-2841 (Rohan K.)</strong></div>
          <p class="cv-match-sub">Trip window: 14 Oct 09:00 → 16 Oct 18:00 · Deposit held: ₹5,000</p>
        </div>
        <button
          type="button"
          class="astryx-button cv-action-btn"
          id="cvPostChallanBtn"
          data-astryx-component="button"
          data-variant="${challanPosted ? "success" : "primary"}"
          data-size="lg"
          data-width="full"
        >
          <span class="astryx-button-content">
            <span class="astryx-button-label">${challanPosted ? "✓ ₹1,200 challan posted to Booking #FLT-2841 ledger" : "Post ₹1,200 challan to ledger"}</span>
          </span>
        </button>`;
      const btn = $("cvPostChallanBtn");
      if (btn) btn.addEventListener("click", () => { challanPosted = !challanPosted; renderCounterView("fastag"); });
    } else if (view === "gst") {
      counterBody.innerHTML = `
        <div class="cv-inv-head">
          <div><strong>FLT/2026-27/00419</strong><span>SQLite-locked · Immutable trigger active</span></div>
          <span class="cv-tag cv-tag-good">Corporate Net-30</span>
        </div>
        <div class="cv-list">
          <div class="cv-row"><span>Base rental + prorated 6h extension</span><strong>₹18,450.00</strong></div>
          <div class="cv-row"><span>CGST (2.5%) + SGST (2.5%) · Decimal ROUND_HALF_UP</span><strong>₹922.50</strong></div>
          <div class="cv-row cv-row-total"><span>Locked grand total (B2B ledger)</span><strong>₹19,372.50</strong></div>
        </div>
        <div class="cv-foot-note">Corrections require sequential Credit Note CN/2026-27/00018</div>`;
    } else {
      counterBody.innerHTML = `
        <div class="cv-list">
          <div class="cv-row"><span><strong>192.168.1.14</strong> → Counter Desk 2</span><span class="cv-tag cv-tag-good">IP bound</span></div>
          <div class="cv-row"><span>4-digit Quick PIN lock</span><span class="cv-tag">Auto-lock 120s</span></div>
          <div class="cv-row"><span>5-role RBAC active</span><span class="cv-tag">Owner · Mgr · Desk · Acct · Auditor</span></div>
          <div class="cv-row"><span>DPDP Act 2023 compliance</span><span class="cv-tag cv-tag-good">GPS/EXIF scrubbed</span></div>
        </div>
        <div class="cv-foot-note">Multi-Desk Hub LAN Server · Unlimited counter PCs per hub</div>`;
    }
  }

  renderCounterView("wave");
  counterTabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      counterTabs.forEach((t) => {
        const on = t === tab;
        t.classList.toggle("active", on);
        t.setAttribute("aria-selected", String(on));
        t.dataset.isPressed = String(on);
      });
      renderCounterView(tab.dataset.view || "wave");
    });
  });

  /* ── Interactive Fleet Leakage & SaaS-Tax Calculator (bug-fixed 500+) ── */
  const fleetSlider = $("fleetSlider");
  const staffSlider = $("staffSlider");
  const fmtINR = (n) => "₹" + Math.round(n).toLocaleString("en-IN");

  function updateROI() {
    if (!fleetSlider || !staffSlider) return;
    const cars = Number(fleetSlider.value);
    const staff = Number(staffSlider.value);
    $("fleetVal").textContent = cars >= 500 ? "500+ cars" : `${cars} cars`;
    $("staffVal").textContent = staff >= 100 ? "100+ staff" : `${staff} staff`;

    const monthlyTolls = cars * 850;
    const monthlyHours = Math.round(cars * 3.5);
    const saas3Yr = (staff * 1200 + cars * 350) * 36;

    let edition = "Float Basic", price = 600000;
    if (cars >= 500) { edition = "Float Enterprise Max"; price = 2100000; }
    else if (cars > 150) { edition = "Float Enterprise"; price = 1650000; }
    else if (cars > 60) { edition = "Float Pro"; price = 1350000; }
    else if (cars > 25) { edition = "Float Plus"; price = 900000; }

    const monthlyBenefit = monthlyTolls + (saas3Yr / 36);
    const paybackMonths = Math.max(2, Math.round(price / Math.max(1, monthlyBenefit)));
    const lakhLabel = (price / 100000).toString().replace(/\.0$/, "");

    $("roiTolls").textContent = fmtINR(monthlyTolls);
    $("roiHours").textContent = `${monthlyHours.toLocaleString("en-IN")} hrs`;
    $("roiSaas").textContent = fmtINR(saas3Yr);
    $("roiRec").textContent = `${edition} (₹${lakhLabel}L) · ~${paybackMonths} mo`;
  }

  if (fleetSlider && staffSlider) {
    fleetSlider.addEventListener("input", updateROI);
    staffSlider.addEventListener("input", updateROI);
    updateROI();
  }

  /* ── "How it fits your office" preview with real screenshots ─────────── */
  const WF_DATA = [
    {
      address: "Float · Local Counter Workspace (Step 1 of 3)",
      tag: "Step 01 · 15–30 minutes",
      image: "assets/step-1-launch.png",
      alt: "Float running locally with the Express Clean-to-Ready turnaround queue and local backup status",
      title: "Opens straight away on Mac or Windows",
      desc: "Run Float on one counter PC or share it across your Multi-Desk Hub LAN. Crash-safe SQLite WAL storage sets itself up automatically beside the app.",
      rows: [["Extra software", "None"], ["Response speed", "< 0.3s local"], ["Daily backups", "Automatic"]]
    },
    {
      address: "Float Settings · Fleet & AI Key (Step 2 of 3)",
      tag: "Step 02 · ~5 minutes",
      image: "assets/step-2-apikey.png",
      alt: "Float API key settings showing encrypted company key and monthly per-employee spend caps",
      title: "Import rate cards & connect your AI key",
      desc: "Import your vehicle list and corporate GST rate cards. AES-256-GCM protects your company AI key on disk so counter staff never see the raw key.",
      rows: [["Key protection", "AES-256-GCM"], ["Staff visibility", "Last 4 chars"], ["Budget control", "Per-user cap"]]
    },
    {
      address: "Float · Locked GST & Approvals (Step 3 of 3)",
      tag: "Step 03 · Ready on day 1",
      image: "assets/step-3-approvals.png",
      alt: "Float Owner Approval Queue showing locked GST invoices and audit history",
      title: "Dispatch waves, match tolls & lock GST",
      desc: "Counter staff dispatch morning waves and recover FASTag/e-challans in seconds while issued sequential GST invoices remain locked permanently.",
      rows: [["FASTag match", "1 second"], ["GST invoices", "SQLite-locked"], ["Audit trail", "Every edit"]]
    }
  ];

  const wfSteps = document.querySelectorAll(".wf-step");
  const previewTitle = $("previewTitle");
  const previewContent = $("previewContent");
  let wfToken = 0;

  function buildPreview(data) {
    if (!previewContent) return;
    previewContent.innerHTML = "";
    const frame = document.createElement("div");
    frame.className = "pv-shot-frame";
    const img = document.createElement("img");
    img.src = data.image; img.alt = data.alt; img.className = "pv-shot"; img.loading = "lazy";
    frame.append(img);

    const caption = document.createElement("div");
    caption.className = "pv-caption-bar";
    caption.innerHTML = `<div class="pv-tag">${data.tag}</div><h4>${data.title}</h4><p>${data.desc}</p>`;

    const rows = document.createElement("div");
    rows.className = "pv-rows";
    data.rows.forEach(([k, v]) => {
      const row = document.createElement("div");
      row.className = "pv-row";
      row.innerHTML = `<strong>${k}</strong><span class="pv-pill">${v}</span>`;
      rows.append(row);
    });
    previewContent.append(frame, caption, rows);
    if (previewTitle) previewTitle.textContent = data.address;
  }

  function renderWorkflowStep(idx, animate) {
    if (!previewContent) return;
    const data = WF_DATA[idx] || WF_DATA[0];
    if (!animate || reduceMotion) { buildPreview(data); return; }
    const mine = ++wfToken;
    previewContent.classList.add("switching");
    setTimeout(() => {
      if (mine !== wfToken) return;
      buildPreview(data);
      previewContent.classList.remove("switching");
    }, 150);
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

  /* ── Toast & Clipboard ───────────────────────────────────────────────── */
  const toastEl = $("toast");
  let toastTimer = null;
  function showToast(msg) {
    if (!toastEl) return;
    toastEl.hidden = true;
    void toastEl.offsetWidth;
    toastEl.textContent = msg;
    toastEl.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { toastEl.hidden = true; }, 2600);
  }

  async function copyText(text) {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return;
    }
    const area = document.createElement("textarea");
    area.value = text;
    area.setAttribute("readonly", "");
    area.style.position = "fixed";
    area.style.opacity = "0";
    document.body.append(area);
    area.select();
    document.execCommand("copy");
    area.remove();
  }

  /* ── B2B Contact Flow (Email + WhatsApp + Copy Brief) ────────────────── */
  const copyEmailBtn = $("copyEmailBtn");
  if (copyEmailBtn) {
    copyEmailBtn.addEventListener("click", async () => {
      try { await copyText(EMAIL); showToast("Email address copied"); }
      catch { showToast(EMAIL); }
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

  function buildBrief() {
    const company = ($("companyName")?.value || "").trim() || "-";
    const city = ($("cityHub")?.value || "").trim() || "-";
    const fleet = ($("fleetSize")?.value || "").trim() || "-";
    const setup = ($("currentSetup")?.value || "Tally + Excel").trim();
    const phone = ($("phoneWhatsapp")?.value || "").trim() || "-";
    const product = productSelect?.value || "Free 48-Hour Leakage Audit + 14-Day Office Pilot (₹0)";
    const notes = ($("messageInput")?.value || "").trim();
    const subject = `Float Pilot / Inquiry: ${company} (${fleet} cars, ${city})`;
    const body =
      `Hello NovaForge Founders (Prabhjot, Shiva & Yatharth),\n\n` +
      `Interest: ${product}\n` +
      `Company / Agency: ${company}\n` +
      `City / Airport Hub: ${city}\n` +
      `Fleet Size: ${fleet} cars\n` +
      `Current Setup: ${setup}\n` +
      `Phone / WhatsApp: ${phone}\n` +
      (notes ? `\nNotes: ${notes}\n` : "");
    return { subject, body };
  }

  const copyDraftBtn = $("copyDraftBtn");
  if (copyDraftBtn) {
    copyDraftBtn.addEventListener("click", async () => {
      const { subject, body } = buildBrief();
      try { await copyText(`To: ${EMAIL}\nSubject: ${subject}\n\n${body}`); showToast("Pilot brief copied"); }
      catch { showToast("Please write to " + EMAIL); }
    });
  }

  const whatsappBtn = $("whatsappBtn");
  if (whatsappBtn) {
    whatsappBtn.addEventListener("click", () => {
      const { body } = buildBrief();
      window.open(`https://wa.me/?text=${encodeURIComponent(body)}`, "_blank", "noopener,noreferrer");
      showToast("Opening WhatsApp with pre-filled brief");
    });
  }

  const contactForm = $("contactForm");
  if (contactForm) {
    contactForm.addEventListener("submit", (e) => {
      e.preventDefault();
      if (!contactForm.reportValidity()) return;
      const { subject, body } = buildBrief();
      window.location.href = `mailto:${EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      showToast("Opening your email app");
    });
  }
})();
