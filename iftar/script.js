/**
 * নির্ভীক ’১২ ইফতার মাহফিল ২০২৭
 * Client-side SPA — LocalStorage registrations, tickets, admin
 */

(() => {
  "use strict";

  /* ------------------------------------------------------------------
   * Constants & Config
   * ------------------------------------------------------------------ */
  const STORAGE_KEY = "bzs12_iftar_2027_registrations";
  const THEME_KEY = "bzs12_iftar_2027_theme";
  const LAST_TICKET_KEY = "bzs12_iftar_2027_last_ticket";

  const EVENT = {
    name: "নির্ভীক ’১২ ইফতার মাহফিল ২০২৭",
    title: "মাহে রমজান উপলক্ষে ইফতার মাহফিল ২০২৭",
    subtitle: "নির্ভীক’১২ | বগুড়া জিলা স্কুল",
    date: "19 March 2027",
    time: "5:00 PM",
    venue: "বগুড়া জিলা স্কুল খেলার মাঠ",
    fee: "300 BDT",
    // Event start: 19 March 2027, 5:00 PM Bangladesh Time (UTC+6)
    startMs: new Date("2027-03-19T17:00:00+06:00").getTime(),
    lastRegMs: new Date("2027-03-18T23:59:59+06:00").getTime(),
  };

  const BD_MOBILE_RE = /^01[3-9]\d{8}$/;

  /* ------------------------------------------------------------------
   * DOM Helpers
   * ------------------------------------------------------------------ */
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

  /* ------------------------------------------------------------------
   * LocalStorage
   * ------------------------------------------------------------------ */
  function getRegistrations() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return [];
      const data = JSON.parse(raw);
      return Array.isArray(data) ? data : [];
    } catch {
      return [];
    }
  }

  function saveRegistrations(list) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  }

  function getNextTicketId(list) {
    const year = 2027;
    let max = 0;
    for (const r of list) {
      const m = String(r.ticketId || "").match(/BZS12-2027-(\d+)/i);
      if (m) max = Math.max(max, parseInt(m[1], 10));
    }
    const next = max + 1;
    return `BZS12-${year}-${String(next).padStart(4, "0")}`;
  }

  /* ------------------------------------------------------------------
   * Toast Notifications
   * ------------------------------------------------------------------ */
  function showToast(message, type = "info") {
    const container = $("#toast-container");
    if (!container) return;

    const icons = { success: "✓", error: "✕", info: "ℹ" };
    const el = document.createElement("div");
    el.className = `toast ${type}`;
    el.innerHTML = `<span class="toast-icon">${icons[type] || icons.info}</span><span>${escapeHtml(message)}</span>`;
    container.appendChild(el);

    setTimeout(() => {
      el.style.opacity = "0";
      el.style.transform = "translateY(-8px)";
      el.style.transition = "opacity 0.3s, transform 0.3s";
      setTimeout(() => el.remove(), 300);
    }, 3500);
  }

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  /* ------------------------------------------------------------------
   * Loading Overlay
   * ------------------------------------------------------------------ */
  function setLoading(on) {
    const overlay = $("#loading-overlay");
    if (!overlay) return;
    overlay.classList.toggle("hidden", !on);
    overlay.setAttribute("aria-hidden", on ? "false" : "true");
  }

  /* ------------------------------------------------------------------
   * Theme (Dark Mode)
   * ------------------------------------------------------------------ */
  function initTheme() {
    const saved = localStorage.getItem(THEME_KEY);
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const theme = saved || (prefersDark ? "dark" : "light");
    document.documentElement.setAttribute("data-theme", theme);

    $("#theme-toggle")?.addEventListener("click", () => {
      const current = document.documentElement.getAttribute("data-theme");
      const next = current === "dark" ? "light" : "dark";
      document.documentElement.setAttribute("data-theme", next);
      localStorage.setItem(THEME_KEY, next);
      showToast(next === "dark" ? "ডার্ক মোড চালু" : "লাইট মোড চালু", "info");
    });
  }

  /* ------------------------------------------------------------------
   * Stars Decor
   * ------------------------------------------------------------------ */
  function createStars() {
    const wrap = $("#stars");
    if (!wrap) return;
    const count = 28;
    for (let i = 0; i < count; i++) {
      const s = document.createElement("span");
      s.style.left = `${Math.random() * 100}%`;
      s.style.top = `${Math.random() * 100}%`;
      s.style.animationDelay = `${Math.random() * 3}s`;
      s.style.width = s.style.height = `${2 + Math.random() * 2}px`;
      wrap.appendChild(s);
    }
  }

  /* ------------------------------------------------------------------
   * Navbar
   * ------------------------------------------------------------------ */
  function initNavbar() {
    const navbar = $("#navbar");
    const menuToggle = $("#menu-toggle");
    const navLinks = $("#nav-links");

    window.addEventListener(
      "scroll",
      () => {
        navbar?.classList.toggle("scrolled", window.scrollY > 20);
      },
      { passive: true }
    );

    menuToggle?.addEventListener("click", () => {
      const open = navLinks?.classList.toggle("open");
      menuToggle.setAttribute("aria-expanded", open ? "true" : "false");
    });

    navLinks?.addEventListener("click", (e) => {
      if (e.target.tagName === "A") {
        navLinks.classList.remove("open");
        menuToggle?.setAttribute("aria-expanded", "false");
      }
    });
  }

  /* ------------------------------------------------------------------
   * Countdown Timer
   * ------------------------------------------------------------------ */
  function updateCountdown() {
    const now = Date.now();
    let diff = EVENT.startMs - now;

    if (diff <= 0) {
      $("#cd-days").textContent = "00";
      $("#cd-hours").textContent = "00";
      $("#cd-mins").textContent = "00";
      $("#cd-secs").textContent = "00";
      return;
    }

    const days = Math.floor(diff / 86400000);
    diff %= 86400000;
    const hours = Math.floor(diff / 3600000);
    diff %= 3600000;
    const mins = Math.floor(diff / 60000);
    diff %= 60000;
    const secs = Math.floor(diff / 1000);

    const pad = (n) => String(n).padStart(2, "0");
    $("#cd-days").textContent = pad(days);
    $("#cd-hours").textContent = pad(hours);
    $("#cd-mins").textContent = pad(mins);
    $("#cd-secs").textContent = pad(secs);
  }

  function initCountdown() {
    updateCountdown();
    setInterval(updateCountdown, 1000);
  }

  /* ------------------------------------------------------------------
   * Share / Copy / WhatsApp
   * ------------------------------------------------------------------ */
  function getShareUrl() {
    const url = new URL(window.location.href);
    url.searchParams.delete("admin");
    return url.origin + url.pathname + url.hash;
  }

  function getShareText() {
    return (
      `${EVENT.title}\n` +
      `${EVENT.subtitle}\n` +
      `📅 ${EVENT.date} · 🕐 ${EVENT.time}\n` +
      `📍 ${EVENT.venue}\n` +
      `💰 ফি: ${EVENT.fee}\n` +
      `রেজিস্ট্রেশন: ${getShareUrl()}`
    );
  }

  async function copyToClipboard(text) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.style.position = "fixed";
      ta.style.left = "-9999px";
      document.body.appendChild(ta);
      ta.select();
      const ok = document.execCommand("copy");
      ta.remove();
      return ok;
    }
  }

  function initShare() {
    $("#btn-copy-link")?.addEventListener("click", async () => {
      const ok = await copyToClipboard(getShareUrl());
      showToast(ok ? "রেজিস্ট্রেশন লিংক কপি হয়েছে!" : "কপি ব্যর্থ হয়েছে", ok ? "success" : "error");
    });

    $("#btn-whatsapp")?.addEventListener("click", () => {
      const url = `https://wa.me/?text=${encodeURIComponent(getShareText())}`;
      window.open(url, "_blank", "noopener,noreferrer");
    });

    const shareHandler = async () => {
      if (navigator.share) {
        try {
          await navigator.share({
            title: EVENT.name,
            text: getShareText(),
            url: getShareUrl(),
          });
          return;
        } catch (err) {
          if (err?.name === "AbortError") return;
        }
      }
      const ok = await copyToClipboard(getShareText());
      showToast(ok ? "শেয়ার টেক্সট কপি হয়েছে!" : "শেয়ার ব্যর্থ", ok ? "success" : "error");
    };

    $("#btn-share-event")?.addEventListener("click", shareHandler);
    $("#btn-share-native")?.addEventListener("click", shareHandler);
  }

  /* ------------------------------------------------------------------
   * Form Validation
   * ------------------------------------------------------------------ */
  function clearErrors() {
    $$(".field-error").forEach((el) => {
      el.textContent = "";
    });
    $$(".form-group input, .form-group select, .form-group textarea").forEach((el) => {
      el.classList.remove("invalid");
    });
  }

  function setError(fieldId, message) {
    const input = $(`#${fieldId}`);
    const err = $(`#err-${fieldId}`);
    input?.classList.add("invalid");
    if (err) err.textContent = message;
  }

  function validateForm(data) {
    clearErrors();
    let ok = true;

    if (!data.fullName.trim()) {
      setError("fullName", "পূর্ণ নাম আবশ্যক");
      ok = false;
    }

    if (!data.mobile.trim()) {
      setError("mobile", "মোবাইল নম্বর আবশ্যক");
      ok = false;
    } else if (!BD_MOBILE_RE.test(data.mobile.trim())) {
      setError("mobile", "সঠিক বাংলাদেশি মোবাইল দিন (01XXXXXXXXX)");
      ok = false;
    }

    if (!data.section) {
      setError("section", "সেকশন নির্বাচন করুন");
      ok = false;
    }

    if (!data.profession.trim()) {
      setError("profession", "পেশা আবশ্যক");
      ok = false;
    }

    if (!data.location.trim()) {
      setError("location", "অবস্থান আবশ্যক");
      ok = false;
    }

    if (!data.paymentMethod) {
      setError("paymentMethod", "পেমেন্ট মাধ্যম নির্বাচন করুন");
      ok = false;
    }

    if (!data.transactionId.trim()) {
      setError("transactionId", "Transaction ID আবশ্যক");
      ok = false;
    } else if (data.transactionId.trim().length < 5) {
      setError("transactionId", "Transaction ID কমপক্ষে ৫ অক্ষরের হতে হবে");
      ok = false;
    }

    if (!data.paymentNumber.trim()) {
      setError("paymentNumber", "পেমেন্ট নম্বর আবশ্যক");
      ok = false;
    } else if (!BD_MOBILE_RE.test(data.paymentNumber.trim())) {
      setError("paymentNumber", "সঠিক পেমেন্ট নম্বর দিন (01XXXXXXXXX)");
      ok = false;
    }

    return ok;
  }

  function isDuplicate(list, mobile, trxId) {
    const m = mobile.trim();
    const t = trxId.trim().toLowerCase();
    return list.some(
      (r) => r.mobile === m || String(r.transactionId || "").toLowerCase() === t
    );
  }

  /* ------------------------------------------------------------------
   * Ticket Rendering
   * ------------------------------------------------------------------ */
  function showTicketSection() {
    const section = $("#ticket-section");
    const navTicket = $("#nav-ticket");
    section?.classList.remove("hidden");
    navTicket?.classList.remove("hidden");
  }

  function renderTicket(reg) {
    showTicketSection();

    $("#ticket-name").textContent = reg.fullName;
    $("#ticket-section-val").textContent = `Section ${reg.section}`;
    $("#ticket-mobile").textContent = reg.mobile;
    $("#ticket-id").textContent = reg.ticketId;

    const qrHost = $("#ticket-qr");
    qrHost.innerHTML = "";

    // QR payload: ticket verification string
    const qrData = JSON.stringify({
      id: reg.ticketId,
      name: reg.fullName,
      section: reg.section,
      mobile: reg.mobile,
      event: "BZS12-IFTAR-2027",
      date: EVENT.date,
      venue: EVENT.venue,
    });

    if (typeof QRCode !== "undefined") {
      new QRCode(qrHost, {
        text: qrData,
        width: 116,
        height: 116,
        colorDark: "#0d4f3c",
        colorLight: "#ffffff",
        correctLevel: QRCode.CorrectLevel.M,
      });
    } else {
      qrHost.innerHTML = `<p style="font-size:0.7rem;color:#333;text-align:center;padding:0.5rem">${escapeHtml(reg.ticketId)}</p>`;
    }

    localStorage.setItem(LAST_TICKET_KEY, JSON.stringify(reg));
  }

  async function downloadTicketPng() {
    const ticket = $("#ticket");
    if (!ticket || typeof html2canvas === "undefined") {
      showToast("ডাউনলোড লাইব্রেরি লোড হয়নি", "error");
      return;
    }

    setLoading(true);
    try {
      // Wait a frame so QR canvas is painted
      await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));

      const canvas = await html2canvas(ticket, {
        scale: 2,
        backgroundColor: null,
        useCORS: true,
        logging: false,
      });

      const link = document.createElement("a");
      const id = $("#ticket-id")?.textContent || "ticket";
      link.download = `${id}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
      showToast("টিকেট PNG ডাউনলোড হয়েছে!", "success");
    } catch (err) {
      console.error(err);
      showToast("ডাউনলোড ব্যর্থ হয়েছে", "error");
    } finally {
      setLoading(false);
    }
  }

  function printTicket() {
    const ticket = $("#ticket");
    const printArea = $("#print-area");
    if (!ticket || !printArea) return;

    printArea.innerHTML = "";
    const clone = ticket.cloneNode(true);

    // Re-draw QR into clone (canvas doesn't clone pixel data reliably)
    const qrSrc = $("#ticket-qr canvas, #ticket-qr img");
    const qrDest = clone.querySelector("#ticket-qr") || clone.querySelector(".ticket-qr");
    if (qrSrc && qrDest) {
      qrDest.innerHTML = "";
      if (qrSrc.tagName === "CANVAS") {
        const img = document.createElement("img");
        img.src = qrSrc.toDataURL("image/png");
        img.width = 116;
        img.height = 116;
        img.alt = "QR Code";
        qrDest.appendChild(img);
      } else {
        qrDest.appendChild(qrSrc.cloneNode(true));
      }
    }

    printArea.appendChild(clone);
    window.print();
  }

  function reopenLastTicket() {
    try {
      const raw = localStorage.getItem(LAST_TICKET_KEY);
      if (!raw) {
        showToast("কোনো পূর্বের টিকেট পাওয়া যায়নি", "error");
        return;
      }
      const reg = JSON.parse(raw);
      renderTicket(reg);
      $("#ticket-section")?.scrollIntoView({ behavior: "smooth" });
      showToast("পূর্বের টিকেট খোলা হয়েছে", "success");
    } catch {
      showToast("টিকেট লোড করতে সমস্যা হয়েছে", "error");
    }
  }

  function initTicketActions() {
    $("#btn-download-ticket")?.addEventListener("click", downloadTicketPng);
    $("#btn-print-ticket")?.addEventListener("click", printTicket);
    $("#btn-reopen-ticket")?.addEventListener("click", reopenLastTicket);
    // Auto-show ticket section if last ticket exists
    try {
      const raw = localStorage.getItem(LAST_TICKET_KEY);
      if (raw) {
        showTicketSection();
      }
    } catch {
      /* ignore */
    }
  }

  /* ------------------------------------------------------------------
   * Section Payment Contacts
   * ------------------------------------------------------------------ */
  const SECTION_CONTACTS = {
    A: { name: "রাফিদ আল রিদওয়ান", phone: "01721914666", methods: ["bKash", "Nagad"] },
    B: { name: "ফররুখ আহমেদ নাইম", phone: "01740388856", methods: ["bKash", "Nagad"] },
    C: { name: "মোঃ তৌহিদুল ইসলাম", phone: "01965809747", methods: ["bKash", "Nagad"] },
    D: { name: "সাইফ উদ্দিন", phone: "01521116350", methods: ["bKash"] },
  };

  function highlightSectionContact(section) {
    $$(".contact-card").forEach((card) => {
      card.classList.toggle("active", section && card.dataset.section === section);
    });

    const note = $("#payment-note");
    const paySelect = $("#paymentMethod");
    const contact = SECTION_CONTACTS[section];

    if (note && contact) {
      const methods = contact.methods.join(" / ");
      note.innerHTML =
        `<strong>পেমেন্ট নির্দেশনা:</strong> সেকশন ${escapeHtml(section)} — ` +
        `<strong>${escapeHtml(contact.name)}</strong>-এর নম্বরে ` +
        `(${escapeHtml(methods)}) <code>${escapeHtml(contact.phone)}</code>-এ ` +
        `<strong>৩০০ টাকা</strong> Send Money করুন, তারপর Transaction ID দিন।`;
    } else if (note) {
      note.innerHTML =
        "<strong>পেমেন্ট নির্দেশনা:</strong> উপরের তালিকা থেকে <strong>নিজ সেকশনের</strong> নম্বরে " +
        "<strong>৩০০ টাকা</strong> Send Money করুন, তারপর Transaction ID এখানে দিন।";
    }

    // Section D: bKash only
    if (paySelect) {
      const current = paySelect.value;
      paySelect.innerHTML = '<option value="">নির্বাচন করুন</option>';
      const methods = contact ? contact.methods : ["bKash", "Nagad"];
      for (const m of methods) {
        const opt = document.createElement("option");
        opt.value = m;
        opt.textContent = m;
        paySelect.appendChild(opt);
      }
      if (methods.includes(current)) paySelect.value = current;
    }
  }

  function initSectionContacts() {
    $("#section")?.addEventListener("change", (e) => {
      highlightSectionContact(e.target.value);
    });

    $$(".btn-copy-phone").forEach((btn) => {
      btn.addEventListener("click", async () => {
        const phone = btn.dataset.phone;
        const ok = await copyToClipboard(phone);
        showToast(ok ? `নম্বর কপি হয়েছে: ${phone}` : "কপি ব্যর্থ হয়েছে", ok ? "success" : "error");
      });
    });
  }

  /* ------------------------------------------------------------------
   * Google Form Submission
   * ------------------------------------------------------------------ */
  const GOOGLE_FORM_ACTION =
    "https://docs.google.com/forms/d/e/1FAIpQLSdkqk4hBeE5EerNFWTKnmVRukPdwW12VMpp_tDFoEtOXxOwBg/formResponse";

  const GOOGLE_FORM_ENTRIES = {
    fullName: "entry.825740319",
    mobile: "entry.812592884",
    section: "entry.806996261",
    profession: "entry.679595318",
    location: "entry.1512653418",
    paymentMethod: "entry.1926038571",
    transactionId: "entry.1528865315",
    paymentNumber: "entry.2030868691",
    message: "entry.1904073469",
  };

  async function submitToGoogleForm(data) {
    const formData = new FormData();
    formData.append(GOOGLE_FORM_ENTRIES.fullName, data.fullName.trim());
    formData.append(GOOGLE_FORM_ENTRIES.mobile, data.mobile.trim());
    // Google Form choices are "Section A/B/C/D" (exact match required)
    formData.append(GOOGLE_FORM_ENTRIES.section, `Section ${data.section}`);
    formData.append(GOOGLE_FORM_ENTRIES.profession, data.profession.trim());
    formData.append(GOOGLE_FORM_ENTRIES.location, data.location.trim());
    formData.append(GOOGLE_FORM_ENTRIES.paymentMethod, data.paymentMethod);
    formData.append(GOOGLE_FORM_ENTRIES.transactionId, data.transactionId.trim());
    formData.append(GOOGLE_FORM_ENTRIES.paymentNumber, data.paymentNumber.trim());
    formData.append(GOOGLE_FORM_ENTRIES.message, data.message.trim());

    // no-cors: response is opaque; a resolved fetch means the browser sent the request
    await fetch(GOOGLE_FORM_ACTION, {
      method: "POST",
      mode: "no-cors",
      body: formData,
    });
  }

  /* ------------------------------------------------------------------
   * Registration Submit
   * ------------------------------------------------------------------ */
  function initRegistrationForm() {
    const form = $("#registration-form");
    if (!form) return;

    // Live mobile sanitize: digits only
    $("#mobile")?.addEventListener("input", (e) => {
      e.target.value = e.target.value.replace(/\D/g, "").slice(0, 11);
    });

    $("#paymentNumber")?.addEventListener("input", (e) => {
      e.target.value = e.target.value.replace(/\D/g, "").slice(0, 11);
    });

    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      const data = {
        fullName: $("#fullName").value,
        mobile: $("#mobile").value,
        section: $("#section").value,
        profession: $("#profession").value,
        location: $("#location").value,
        paymentMethod: $("#paymentMethod").value,
        transactionId: $("#transactionId").value,
        paymentNumber: $("#paymentNumber").value,
        message: $("#message").value,
      };

      if (!validateForm(data)) {
        showToast("দয়া করে সব আবশ্যক ফিল্ড সঠিকভাবে পূরণ করুন", "error");
        const firstInvalid = form.querySelector(".invalid");
        firstInvalid?.focus();
        return;
      }

      // Soft deadline notice (still allow if past, but warn)
      if (Date.now() > EVENT.lastRegMs) {
        const proceed = confirm(
          "শেষ রেজিস্ট্রেশন তারিখ (১৮ মার্চ ২০২৭) পেরিয়ে গেছে। তবুও রেজিস্টার করতে চান?"
        );
        if (!proceed) return;
      }

      setLoading(true);

      try {
        await submitToGoogleForm(data);

        // Local ticket for the registrant (not used as the source of truth)
        const list = getRegistrations();
        const registration = {
          ticketId: getNextTicketId(list),
          fullName: data.fullName.trim(),
          mobile: data.mobile.trim(),
          section: data.section,
          profession: data.profession.trim(),
          location: data.location.trim(),
          paymentMethod: data.paymentMethod,
          transactionId: data.transactionId.trim(),
          paymentNumber: data.paymentNumber.trim(),
          message: data.message.trim(),
          createdAt: new Date().toISOString(),
        };

        // Keep ticket reopen UX; do not write registrations to LocalStorage
        localStorage.setItem(LAST_TICKET_KEY, JSON.stringify(registration));

        form.reset();
        clearErrors();
        highlightSectionContact("");

        showToast(`রেজিস্ট্রেশন সফল! টিকেট: ${registration.ticketId}`, "success");
        renderTicket(registration);
        $("#ticket-section")?.scrollIntoView({ behavior: "smooth" });
      } catch (err) {
        console.error(err);
        showToast("সাবমিশন ব্যর্থ হয়েছে। আবার চেষ্টা করুন।", "error");
      } finally {
        setLoading(false);
      }
    });
  }

  /* ------------------------------------------------------------------
   * Participants List
   * ------------------------------------------------------------------ */
  function renderParticipants() {
    const list = getRegistrations();
    const search = ($("#search-name")?.value || "").trim().toLowerCase();
    const sectionFilter = $("#filter-section")?.value || "";

    const filtered = list.filter((r) => {
      const nameOk = !search || r.fullName.toLowerCase().includes(search);
      const secOk = !sectionFilter || r.section === sectionFilter;
      return nameOk && secOk;
    });

    // Newest first
    filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    const countEl = $("#reg-count");
    if (countEl) countEl.textContent = String(list.length);

    const host = $("#participants-list");
    const empty = $("#participants-empty");
    if (!host) return;

    host.innerHTML = "";

    if (filtered.length === 0) {
      if (empty) {
        empty.classList.remove("hidden");
        empty.textContent =
          list.length === 0
            ? "এখনো কোনো রেজিস্ট্রেশন নেই। প্রথমজন হোন!"
            : "কোনো মিল পাওয়া যায়নি।";
      }
      return;
    }

    empty?.classList.add("hidden");

    const frag = document.createDocumentFragment();
    for (const r of filtered) {
      const card = document.createElement("article");
      card.className = "glass-card participant-card";
      card.innerHTML = `
        <div class="participant-name">${escapeHtml(r.fullName)}</div>
        <div class="participant-meta">
          <span class="section-pill">Section ${escapeHtml(r.section)}</span>
          <span>${escapeHtml(r.profession)}</span>
        </div>
        <div class="participant-loc">📍 ${escapeHtml(r.location)}</div>
      `;
      frag.appendChild(card);
    }
    host.appendChild(frag);
  }

  function initParticipantsFilters() {
    $("#search-name")?.addEventListener("input", renderParticipants);
    $("#filter-section")?.addEventListener("change", renderParticipants);
  }

  /* ------------------------------------------------------------------
   * Admin Dashboard (?admin=true)
   * ------------------------------------------------------------------ */
  function isAdminMode() {
    const params = new URLSearchParams(window.location.search);
    return params.get("admin") === "true";
  }

  function updateAdmin() {
    if (!isAdminMode()) return;

    const list = getRegistrations();
    $("#stat-total").textContent = String(list.length);
    $("#stat-a").textContent = String(list.filter((r) => r.section === "A").length);
    $("#stat-b").textContent = String(list.filter((r) => r.section === "B").length);
    $("#stat-c").textContent = String(list.filter((r) => r.section === "C").length);
    $("#stat-d").textContent = String(list.filter((r) => r.section === "D").length);

    const tbody = $("#admin-tbody");
    if (!tbody) return;
    tbody.innerHTML = "";

    const sorted = [...list].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    for (const r of sorted) {
      const tr = document.createElement("tr");
      const when = r.createdAt
        ? new Date(r.createdAt).toLocaleString("en-GB", { timeZone: "Asia/Dhaka" })
        : "—";
      tr.innerHTML = `
        <td><code>${escapeHtml(r.ticketId)}</code></td>
        <td>${escapeHtml(r.fullName)}</td>
        <td>${escapeHtml(r.mobile)}</td>
        <td>${escapeHtml(r.section)}</td>
        <td>${escapeHtml(r.profession)}</td>
        <td>${escapeHtml(r.location)}</td>
        <td>${escapeHtml(r.paymentMethod)}</td>
        <td>${escapeHtml(r.transactionId)}</td>
        <td>${escapeHtml(when)}</td>
      `;
      tbody.appendChild(tr);
    }
  }

  function exportCsv() {
    const list = getRegistrations();
    if (list.length === 0) {
      showToast("এক্সপোর্ট করার মতো ডেটা নেই", "error");
      return;
    }

    const headers = [
      "Ticket ID",
      "Full Name",
      "Mobile",
      "Section",
      "Profession",
      "Location",
      "Payment Method",
      "Transaction ID",
      "Message",
      "Registered At",
    ];

    const rows = list.map((r) =>
      [
        r.ticketId,
        r.fullName,
        r.mobile,
        r.section,
        r.profession,
        r.location,
        r.paymentMethod,
        r.transactionId,
        r.message || "",
        r.createdAt || "",
      ]
        .map((cell) => {
          const s = String(cell).replace(/"/g, '""');
          return `"${s}"`;
        })
        .join(",")
    );

    // BOM for Excel Bengali support
    const csv = "\uFEFF" + [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `BZS12-Iftar-2027-registrations-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showToast("CSV এক্সপোর্ট সম্পন্ন!", "success");
  }

  function clearAllRegistrations() {
    const list = getRegistrations();
    if (list.length === 0) {
      showToast("মুছে ফেলার মতো রেজিস্ট্রেশন নেই", "info");
      return;
    }

    const confirmed = confirm(
      `সতর্কতা: ${list.length}টি রেজিস্ট্রেশন স্থায়ীভাবে মুছে যাবে। নিশ্চিত?`
    );
    if (!confirmed) return;

    const doubleCheck = confirm("আবার নিশ্চিত করুন — সব ডেটা মুছে ফেলতে চান?");
    if (!doubleCheck) return;

    saveRegistrations([]);
    localStorage.removeItem(LAST_TICKET_KEY);
    renderParticipants();
    updateAdmin();
    $("#ticket-section")?.classList.add("hidden");
    $("#nav-ticket")?.classList.add("hidden");
    showToast("সব রেজিস্ট্রেশন মুছে ফেলা হয়েছে", "success");
  }

  function initAdmin() {
    if (!isAdminMode()) return;

    $("#admin")?.classList.remove("hidden");
    $("#nav-admin")?.classList.remove("hidden");
    updateAdmin();

    $("#btn-export-csv")?.addEventListener("click", exportCsv);
    $("#btn-clear-all")?.addEventListener("click", clearAllRegistrations);
  }

  /* ------------------------------------------------------------------
   * UI vibe helpers
   * ------------------------------------------------------------------ */
  function initReveal() {
    const items = $$(".reveal");
    if (!items.length) return;

    if (!("IntersectionObserver" in window)) {
      items.forEach((el) => el.classList.add("visible"));
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
    );

    items.forEach((el) => io.observe(el));
  }

  function initMobileCta() {
    const cta = $("#mobile-cta");
    const register = $("#register");
    if (!cta || !register) return;

    const sync = () => {
      if (window.innerWidth >= 860) {
        cta.classList.remove("show");
        return;
      }
      const rect = register.getBoundingClientRect();
      const nearRegister = rect.top < window.innerHeight * 0.72 && rect.bottom > 120;
      const pastHero = window.scrollY > window.innerHeight * 0.45;
      cta.classList.toggle("show", pastHero && !nearRegister);
    };

    window.addEventListener("scroll", sync, { passive: true });
    window.addEventListener("resize", sync);
    sync();
  }

  // Soft tick animation on countdown seconds
  const _updateCountdown = updateCountdown;
  updateCountdown = function updateCountdownWithTick() {
    const prev = $("#cd-secs")?.textContent;
    _updateCountdown();
    const el = $("#cd-secs");
    const item = el?.closest(".countdown-item");
    if (item && el && el.textContent !== prev) {
      item.classList.remove("tick");
      // reflow
      void item.offsetWidth;
      item.classList.add("tick");
    }
  };

  /* ------------------------------------------------------------------
   * Boot
   * ------------------------------------------------------------------ */
  function init() {
    createStars();
    initTheme();
    initNavbar();
    initCountdown();
    initShare();
    initSectionContacts();
    initRegistrationForm();
    initParticipantsFilters();
    initTicketActions();
    initAdmin();
    renderParticipants();
    initReveal();
    initMobileCta();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
