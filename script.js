(function () {
  "use strict";

  const EMAIL = "info.novaforge.2026@gmail.com";
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const $ = (id) => document.getElementById(id);

  /* ── Light / Dark Theme Toggle ───────────────────────────────────────── */
  const themeToggle = $("themeToggle");
  const themeMeta = $("themeColorMeta");

  function applyTheme(theme, persist) {
    const next = theme === "dark" ? "dark" : "light";
    document.documentElement.setAttribute("data-theme", next);
    if (themeMeta) {
      themeMeta.setAttribute("content", next === "dark" ? "#0B0F17" : "#F5F7FA");
    }
    if (themeToggle) {
      themeToggle.setAttribute(
        "aria-label",
        next === "dark" ? "Switch to light mode" : "Switch to dark mode"
      );
    }
    if (persist) {
      try {
        localStorage.setItem("novaforge.theme", next);
      } catch (e) {}
    }
  }

  applyTheme(document.documentElement.getAttribute("data-theme") || "light", false);

  if (themeToggle) {
    themeToggle.addEventListener("click", () => {
      const cur = document.documentElement.getAttribute("data-theme");
      applyTheme(cur === "dark" ? "light" : "dark", true);
    });
  }

  /* ── Sticky header shadow, scroll progress & active nav ──────────────── */
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
    }, { threshold: 0.02, rootMargin: "0px 0px -12px 0px" });
    reveals.forEach((el) => io.observe(el));
  } else {
    reveals.forEach((el) => el.classList.add("visible"));
  }

  /* ── Interactive Hero Counter Screen (4 Simple Views) ────────────────── */
  const counterBody = $("counterBody");
  const counterTabs = document.querySelectorAll(".counter-tab");
  let waveDispatched = false;
  let challanPosted = false;

  function renderCounterView(view) {
    if (!counterBody) return;
    if (view === "wave") {
      counterBody.innerHTML = `
        <div class="cv-kpis">
          <div class="cv-kpi"><span>Pickups ready</span><strong>${waveDispatched ? "0 waiting" : "14 cars"}</strong></div>
          <div class="cv-kpi"><span>Late returns</span><strong class="cv-warn">2 cars</strong></div>
          <div class="cv-kpi"><span>Avg wash time</span><strong class="cv-good">18 mins</strong></div>
        </div>
        <div class="cv-list">
          <div class="cv-row"><span><strong>MH-02-HV-4589</strong> · Innova Hycross</span><span class="cv-tag ${waveDispatched ? "cv-tag-good" : ""}">${waveDispatched ? "Sent out" : "Ready · Bay 2"}</span></div>
          <div class="cv-row"><span><strong>DL-01-CD-8821</strong> · Dzire AT</span><span class="cv-tag ${waveDispatched ? "cv-tag-good" : ""}">${waveDispatched ? "Sent out" : "Ready · Bay 4"}</span></div>
          <div class="cv-row"><span><strong>MH-01-EF-1904</strong> · Ertiga ZXi</span><span class="cv-tag">Washing · 14m</span></div>
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
            <span class="astryx-button-label">${waveDispatched ? "✓ All 14 cars sent out (0.2s)" : "Send out 14 ready cars in 1 click"}</span>
          </span>
        </button>`;
      const btn = $("cvDispatchBtn");
      if (btn) btn.addEventListener("click", () => { waveDispatched = !waveDispatched; renderCounterView("wave"); });
    } else if (view === "fastag") {
      counterBody.innerHTML = `
        <div class="cv-input-bar">
          <span class="cv-chip">Car: <strong>MH-02-HV-4589</strong></span>
          <span class="cv-chip">Time: <strong>14 Oct, 4:42 PM</strong></span>
        </div>
        <div class="cv-match-card">
          <div class="cv-match-head"><span>Found in 0.04s</span><strong>Booking #FLT-2841 (Rohan K.)</strong></div>
          <p class="cv-match-sub">Trip time: 14 Oct 9:00 AM → 16 Oct 6:00 PM · Deposit held: ₹5,000</p>
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
            <span class="astryx-button-label">${challanPosted ? "✓ ₹1,200 fine added to Rohan K.'s bill" : "Add ₹1,200 fine to customer bill"}</span>
          </span>
        </button>`;
      const btn = $("cvPostChallanBtn");
      if (btn) btn.addEventListener("click", () => { challanPosted = !challanPosted; renderCounterView("fastag"); });
    } else if (view === "gst") {
      counterBody.innerHTML = `
        <div class="cv-inv-head">
          <div><strong>FLT/2026-27/00419</strong><span>Locked GST bill · Cannot be secretly edited</span></div>
          <span class="cv-tag cv-tag-good">Company 30-day bill</span>
        </div>
        <div class="cv-list">
          <div class="cv-row"><span>Base trip + 6 extra hours</span><strong>₹18,450.00</strong></div>
          <div class="cv-row"><span>CGST (2.5%) + SGST (2.5%) · Exact math</span><strong>₹922.50</strong></div>
          <div class="cv-row cv-row-total"><span>Final locked total</span><strong>₹19,372.50</strong></div>
        </div>
        <div class="cv-foot-note">Any later change creates a clean Credit Note for your CA</div>`;
    } else {
      counterBody.innerHTML = `
        <div class="cv-list">
          <div class="cv-row"><span><strong>192.168.1.14</strong> → Counter Desk 2</span><span class="cv-tag cv-tag-good">Desk locked</span></div>
          <div class="cv-row"><span>4-digit staff PIN lock</span><span class="cv-tag">Auto-locks in 2m</span></div>
          <div class="cv-row"><span>5 staff access levels</span><span class="cv-tag">Owner · Mgr · Desk · Acct · Auditor</span></div>
          <div class="cv-row"><span>Customer photo privacy</span><span class="cv-tag cv-tag-good">Location cleaned</span></div>
        </div>
        <div class="cv-foot-note">Connect unlimited counter PCs inside your office</div>`;
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

  /* ── Simple Savings Calculator ───────────────────────────────────────── */
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

  /* ── 3-Step Setup Screen Preview ─────────────────────────────────────── */
  const WF_DATA = [
    {
      address: "Float · Counter Screen (Step 1 of 3)",
      tag: "Step 01 · 15–30 minutes",
      image: "assets/step-1-launch.png",
      alt: "Float running on an office PC showing the car wash list and daily backup status",
      title: "Opens right away on Windows or Mac",
      desc: "Run Float on one counter PC or share it across every counter desk in your office. Everything saves safely on your own computer.",
      rows: [["Extra apps needed", "None"], ["Screen speed", "< 0.3s"], ["Daily backups", "Automatic"]]
    },
    {
      address: "Float Settings · Cars & AI Key (Step 2 of 3)",
      tag: "Step 02 · ~5 minutes",
      image: "assets/step-2-apikey.png",
      alt: "Float settings showing locked company AI key and monthly staff spending limits",
      title: "Load your cars, GST rates & AI key",
      desc: "Import your car list from Excel and paste your company AI key once. Your key stays locked on disk so counter staff cannot copy it.",
      rows: [["AI key safety", "Locked on PC"], ["Staff can see", "Last 4 digits"], ["Spend control", "Monthly limit"]]
    },
    {
      address: "Float · Locked GST Bills & History (Step 3 of 3)",
      tag: "Step 03 · Ready on day 1",
      image: "assets/step-3-approvals.png",
      alt: "Float approval screen showing locked GST bills and change log",
      title: "Send cars, catch tolls & lock GST bills",
      desc: "Staff send out morning cars and match FASTag tolls in seconds, while every printed GST bill stays locked against quiet changes.",
      rows: [["Toll finder", "1 second"], ["GST bills", "Locked"], ["Change log", "Every edit"]]
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

  /* ── NovaForge Labs Tabs (Float Personal & Float Hear) ───────────────── */
  document.querySelectorAll(".lab-tab").forEach((tab) => {
    tab.addEventListener("click", () => {
      const group = tab.dataset.labGroup;
      const targetId = tab.dataset.labPanel;
      if (!group || !targetId) return;
      document.querySelectorAll(`.lab-tab[data-lab-group="${group}"]`).forEach((sibling) => {
        const on = sibling === tab;
        sibling.classList.toggle("active", on);
        sibling.setAttribute("aria-selected", String(on));
        sibling.dataset.isPressed = String(on);
        const panel = $(sibling.dataset.labPanel || "");
        if (panel) panel.hidden = !on;
      });
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

  /* ── Contact Actions (Email + WhatsApp + Copy Message) ───────────────── */
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
    const product = productSelect?.value || "Free 48-Hour Check + 14-Day Office Trial (₹0)";
    const notes = ($("messageInput")?.value || "").trim();
    const subject = `Float Free Trial / Inquiry: ${company} (${fleet} cars, ${city})`;
    const body =
      `Hello NovaForge Founders (Prabhjot, Shiva & Yatharth),\n\n` +
      `Interested in: ${product}\n` +
      `Company: ${company}\n` +
      `City / Airport: ${city}\n` +
      `Cars: ${fleet}\n` +
      `Current Setup: ${setup}\n` +
      `Phone / WhatsApp: ${phone}\n` +
      (notes ? `\nNotes: ${notes}\n` : "");
    return { subject, body };
  }

  const copyDraftBtn = $("copyDraftBtn");
  if (copyDraftBtn) {
    copyDraftBtn.addEventListener("click", async () => {
      const { subject, body } = buildBrief();
      try { await copyText(`To: ${EMAIL}\nSubject: ${subject}\n\n${body}`); showToast("Message copied"); }
      catch { showToast("Please email " + EMAIL); }
    });
  }

  const whatsappBtn = $("whatsappBtn");
  if (whatsappBtn) {
    whatsappBtn.addEventListener("click", () => {
      const { body } = buildBrief();
      window.open(`https://wa.me/?text=${encodeURIComponent(body)}`, "_blank", "noopener,noreferrer");
      showToast("Opening WhatsApp");
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
