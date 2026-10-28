/* AO Koropiou USA TSC — site behaviour: header, menu drawer, news, contact form */
(function () {
  "use strict";
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const CFG = window.CLUB || {};
  const esc = s => String(s == null ? "" : s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
  const MON = MONTHS.map(m => m.slice(0, 3));
  const parse = d => { const [y, m, day] = d.split("-").map(Number); return new Date(y, m - 1, day); };
  const longDate = d => { const x = parse(d); return `${MONTHS[x.getMonth()]} ${x.getDate()}, ${x.getFullYear()}`; };
  const shortDate = d => { const x = parse(d); return `${MON[x.getMonth()]} ${x.getDate()}`; };

  /* ---------- year ---------- */
  $$("[data-year]").forEach(el => { el.textContent = new Date().getFullYear(); });

  /* ---------- header shadow on scroll ---------- */
  const header = $(".site-header");
  const onScroll = () => header && header.classList.toggle("scrolled", window.scrollY > 8);
  window.addEventListener("scroll", onScroll, { passive: true }); onScroll();

  /* ---------- drawer ---------- */
  const mobile = () => window.matchMedia("(max-width: 760px)").matches;
  let lastFocus = null;
  function selectGroup(id) {
    $$(".group-btn").forEach(b => {
      const on = b.dataset.group === id;
      b.classList.toggle("active", on);
      if (!mobile()) b.setAttribute("aria-expanded", on ? "true" : "false");
    });
    $$(".drawer-panel").forEach(p => { p.hidden = p.id !== "dp-" + id; });
  }
  function openDrawer() {
    lastFocus = document.activeElement;
    document.body.classList.add("drawer-open");
    const start = document.body.dataset.group || "club";
    selectGroup(start);
    if (mobile()) {
      $$(".group-btn").forEach(b => {
        const on = b.dataset.group === start;
        b.setAttribute("aria-expanded", on ? "true" : "false");
        const sub = $("#ds-" + b.dataset.group); if (sub) sub.hidden = !on;
      });
    }
    setTimeout(() => { const b = $(`.group-btn[data-group="${start}"]`) || $(".group-btn"); b && b.focus(); }, 60);
  }
  function closeDrawer() {
    document.body.classList.remove("drawer-open");
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }
  $$(".menu-btn").forEach(b => b.addEventListener("click", openDrawer));
  $$("[data-close]").forEach(b => b.addEventListener("click", closeDrawer));
  document.addEventListener("keydown", e => { if (e.key === "Escape" && document.body.classList.contains("drawer-open")) closeDrawer(); });
  $$(".group-btn").forEach(b => {
    b.addEventListener("click", () => {
      if (mobile()) {
        const sub = $("#ds-" + b.dataset.group);
        const open = b.getAttribute("aria-expanded") !== "true";
        b.setAttribute("aria-expanded", open ? "true" : "false");
        if (sub) sub.hidden = !open;
      } else selectGroup(b.dataset.group);
    });
    b.addEventListener("mouseenter", () => { if (!mobile()) selectGroup(b.dataset.group); });
  });
  // keep focus inside the open drawer
  const drawer = $(".drawer");
  if (drawer) drawer.addEventListener("keydown", e => {
    if (e.key !== "Tab") return;
    const f = $$("a[href], button:not([disabled])", drawer).filter(el => el.offsetParent !== null);
    if (!f.length) return;
    const first = f[0], last = f[f.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  });

  /* ---------- news ---------- */
  const needsNews = $("#latest-news") || $("#news-list") || $("#roots-list") || $("#post");
  if (needsNews) {
    fetch("data/news.json", { cache: "no-cache" })
      .then(r => { if (!r.ok) throw new Error(r.status); return r.json(); })
      .then(renderNews)
      .catch(() => {
        $$("[data-news-fallback]").forEach(el => { el.hidden = false; });
      });
  }

  const ARROW = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>';

  function postCard(p) {
    const cover = p.image
      ? `<div class="news-cover has-photo"><img class="cover-photo" src="${esc(p.image)}" alt="" loading="lazy"></div>`
      : `<div class="news-cover"><img class="cover-crest" src="assets/img/crest-128.webp" alt="" width="64" height="64"><span class="big">${esc((p.cover && p.cover.big) || shortDate(p.date))}<small>${esc((p.cover && p.cover.small) || p.tag || "")}</small></span></div>`;
    return `<a class="news-card" href="post.html?id=${encodeURIComponent(p.id)}">${cover}
      <div class="news-body"><div class="news-meta"><span class="tag">${esc(p.tag || "News")}</span><time datetime="${esc(p.date)}">${esc(longDate(p.date))}</time></div>
      <h3>${esc(p.title)}</h3><p>${esc(p.summary || "")}</p><span class="more">Read more</span></div></a>`;
  }
  function rootCard(r) {
    const y = parse(r.date).getFullYear();
    return `<a class="news-card" href="news.html#roots-${y}"><div class="news-cover roots"><span class="big">${y}<small>Our roots</small></span></div>
      <div class="news-body"><div class="news-meta"><span class="tag gold">Our roots</span><time datetime="${esc(r.date)}">${esc(longDate(r.date))}</time></div>
      <h3>${esc(r.title)}</h3><p>${esc(r.text)}</p><span class="more">See the archive</span></div></a>`;
  }

  function renderNews(data) {
    const posts = (data.posts || []).slice().sort((a, b) => b.date.localeCompare(a.date));
    const roots = (data.roots || []).slice().sort((a, b) => b.date.localeCompare(a.date));

    const latest = $("#latest-news");
    if (latest) {
      const n = parseInt(latest.dataset.count || "3", 10);
      const cards = posts.slice(0, n).map(postCard);
      roots.slice(0, Math.max(0, n - cards.length)).forEach(r => cards.push(rootCard(r)));
      latest.innerHTML = cards.join("");
    }

    const list = $("#news-list");
    if (list) list.innerHTML = posts.length ? posts.map(postCard).join("") : `<p>No news yet.</p>`;

    const rl = $("#roots-list");
    if (rl) {
      const byYear = {};
      roots.forEach(r => { const y = parse(r.date).getFullYear(); (byYear[y] = byYear[y] || []).push(r); });
      rl.innerHTML = Object.keys(byYear).sort((a, b) => b - a).map(y => `
        <div class="year-block" id="roots-${y}"><h3>${y}</h3><ol class="roots-list">${byYear[y].map(r => `
          <li class="roots-item"><time datetime="${esc(r.date)}">${esc(shortDate(r.date))}</time>
          <div><h4>${esc(r.title)}</h4><p>${esc(r.text)}</p><span class="club-was">As ${esc(r.club)}</span></div></li>`).join("")}</ol></div>`).join("");
      if (location.hash && location.hash.startsWith("#roots-")) {
        const t = document.getElementById(location.hash.slice(1)); if (t) setTimeout(() => t.scrollIntoView(), 50);
      }
    }

    const post = $("#post");
    if (post) {
      const id = new URLSearchParams(location.search).get("id");
      const p = posts.find(x => x.id === id);
      if (!p) { post.innerHTML = `<div class="wrap narrow post-head"><h1>Post not found</h1><p><a class="link" href="news.html">Back to all news</a></p></div>`; return; }
      document.title = `${p.title} · AO Koropiou USA TSC`;
      const others = posts.filter(x => x.id !== p.id).slice(0, 3);
      post.innerHTML = `
        <div class="wrap narrow post-head">
          <div class="news-meta"><a class="tag" href="news.html">${esc(p.tag || "News")}</a><time datetime="${esc(p.date)}">${esc(longDate(p.date))}</time></div>
          <h1>${esc(p.title)}</h1>
          ${p.image ? `<div class="post-cover"><img src="${esc(p.image)}" alt=""></div>` : ""}
        </div>
        <div class="wrap narrow post-body">${(p.body || []).map(t => `<p>${esc(t)}</p>`).join("")}
          <p style="margin-top:2em"><a class="link" href="news.html">${ARROW.replace("M5 12h14M13 6l6 6-6 6", "M19 12H5M11 6l-6 6 6 6")} All news</a></p>
        </div>
        ${others.length ? `<section class="section tight cloud"><div class="wrap"><div class="section-head"><h2 style="font-size:var(--s3)">More news</h2></div><div class="news-grid">${others.map(postCard).join("")}</div></div></section>` : ""}`;
    }
  }

  /* ---------- contact form (Web3Forms) ---------- */
  const form = $("#contact-form");
  if (form) {
    if (new URLSearchParams(location.search).get("interest") === "merch") {
      const r = form.querySelector('input[value="Club merchandise"]'); if (r) r.checked = true;
    }
    const status = $("#form-status");
    const mailLink = `<a href="mailto:${esc(CFG.email)}">${esc(CFG.email)}</a>`;
    form.addEventListener("submit", e => {
      e.preventDefault();
      if (!form.reportValidity()) return;
      if (form.querySelector(".hp input").value) return; // bot
      const btn = form.querySelector("button[type=submit]");
      const fd = new FormData(form);
      const payload = {};
      fd.forEach((v, k) => { if (k !== "_honey") payload[k] = v; });
      payload.access_key = CFG.formKey;
      payload.subject = `Website message: ${payload["Interested in"] || "Contact"} - ${payload.Name || ""}`;
      payload.from_name = "AO Koropiou USA TSC website";
      payload.replyto = payload.Email;
      btn.disabled = true; const label = btn.textContent; btn.textContent = "Sending…";
      status.hidden = true;
      fetch("https://api.web3forms.com/submit", {
        method: "POST", headers: { "Content-Type": "application/json", "Accept": "application/json" }, body: JSON.stringify(payload)
      }).then(r => r.json().catch(() => ({}))).then(res => {
        const ok = res && (res.success === true || res.success === "true");
        const msg = String((res && res.message) || "");
        if (ok) {
          status.className = "form-status ok"; status.textContent = "Thank you! Your message has been sent. We'll get back to you soon.";
          form.reset();
        } else if (msg) {
          // Web3Forms' own explanation, shown as it is
          status.className = "form-status err";
          status.innerHTML = `The message couldn't be sent: ${esc(msg)} You can also email us at ${mailLink}.`;
        } else throw new Error("failed");
      }).catch(() => {
        status.className = "form-status err";
        status.innerHTML = `Sorry, the message couldn't be sent. Please check your connection and try again, or email us at ${mailLink}.`;
      }).finally(() => { status.hidden = false; btn.disabled = false; btn.textContent = label; status.scrollIntoView({ block: "nearest" }); });
    });
  }
})();
