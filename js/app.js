/* ==========================================================================
   ChrisSlots — app.js
   Site chrome (navbar/footer), mobile menu, dropdowns, toasts, small helpers.
   Loaded on every page, after data.js and auth.js.
   ========================================================================== */

const App = (() => {

  const NAV_LINKS = [
    { href: "index.html", label: "Home" },
    { href: "listing.html?type=all", label: "Explore" },
    { href: "listing.html?type=train", label: "Transport" },
    { href: "listing.html?type=restaurant", label: "Restaurants" },
    { href: "listing.html?type=hotel", label: "Hotels" },
    { href: "listing.html?type=event", label: "Events" },
    { href: "listing.html?type=cinema", label: "Movies" },
    { href: "dashboard.html?tab=bookings", label: "My Bookings" },
    { href: "about.html", label: "About" },
    { href: "help.html", label: "Help" },
  ];

  function currentFile() {
    return location.pathname.split("/").pop() || "index.html";
  }

  function renderHeader() {
    const el = document.getElementById("site-header");
    if (!el) return;
    const file = currentFile();
    const user = Auth.currentUser();
    const favCount = Booking.getFavorites().length;
    const walletBalance = user ? Booking.getWalletBalance() : 0;
    const notifs = Booking.getNotifications();
    const unread = notifs.filter(n => !n.read).length;

    el.innerHTML = `
      <div class="navbar">
        <div class="container nav-inner">
          <a href="index.html" class="brand">
            <span class="brand-mark">CS</span>
            <span class="brand-text">Chris<span>Slots</span></span>
          </a>
          <nav class="nav-links">
            ${NAV_LINKS.map(l => `<a href="${l.href}" class="${file === l.href.split("?")[0] ? "active" : ""}">${l.label}</a>`).join("")}
          </nav>
          <div class="nav-actions">
            <form class="quick-search" style="display:flex" role="search" onsubmit="App.quickSearch(event)">
              <button type="submit" class="icon-btn" aria-label="Search" title="Search">🔎</button>
            </form>
            <div class="dropdown" id="notif-dropdown">
              <button class="icon-btn" aria-label="Notifications" onclick="App.toggleDropdown('notif-dropdown')">
                🔔${unread ? `<span class="icon-badge">${unread}</span>` : ""}
              </button>
              <div class="dropdown-panel">
                <h4>Notifications</h4>
                ${notifs.length ? notifs.slice(0, 6).map(n => `
                  <div class="notif-item ${n.read ? "read" : ""}">
                    <span class="notif-dot"></span>
                    <div><p>${n.text}</p><div class="t">${n.time}</div></div>
                  </div>`).join("") : `<div class="notif-item"><p class="muted">No notifications yet.</p></div>`}
              </div>
            </div>
            ${user ? `
              <div class="dropdown" id="user-dropdown">
                <button class="user-chip" onclick="App.toggleDropdown('user-dropdown')">
                  <span class="avatar">${user.name.slice(0,1).toUpperCase()}</span>
                  <span>${user.name.split(" ")[0]}</span>
                </button>
                <div class="dropdown-panel">
                  <a class="menu-item" href="dashboard.html?tab=profile">👤 Profile</a>
                  <a class="menu-item" href="dashboard.html?tab=bookings">🧾 My Bookings</a>
                  <a class="menu-item" href="dashboard.html?tab=wallet">👛 Wallet (${money(walletBalance)})</a>
                  <a class="menu-item" href="dashboard.html?tab=favorites">❤️ Favorites (${favCount})</a>
                  <hr class="divider" style="margin:6px 0">
                  <button class="menu-item" style="width:100%;text-align:left;border:none;background:none" onclick="Auth.logout()">🚪 Log out</button>
                </div>
              </div>` : `<a href="login.html" class="btn btn-secondary btn-sm">Log in</a>`}
            <button class="hamburger" aria-label="Open menu" onclick="App.toggleDrawer(true)">☰</button>
          </div>
        </div>
      </div>
      <div class="mobile-drawer" id="mobile-drawer" onclick="if(event.target===this) App.toggleDrawer(false)">
        <div class="mobile-drawer-panel">
          <button class="drawer-close" onclick="App.toggleDrawer(false)">✕</button>
          ${NAV_LINKS.map(l => `<a href="${l.href}">${l.label}</a>`).join("")}
          <hr class="divider">
          ${user ? `<a href="dashboard.html?tab=profile">Profile</a><button class="btn btn-secondary" onclick="Auth.logout()">Log out</button>` : `<a href="login.html" class="btn btn-primary center">Log in</a>`}
        </div>
      </div>
    `;
  }

  function renderFooter() {
    const el = document.getElementById("site-footer");
    if (!el) return;
    el.innerHTML = `
      <footer class="footer">
        <div class="footer-trust">
          <div class="container trust-row">
            <div class="trust-item"><span class="trust-icon c1">🔒</span><span>Secure Payments</span></div>
            <div class="trust-item"><span class="trust-icon c2">✅</span><span>Verified Listings</span></div>
            <div class="trust-item"><span class="trust-icon c3">↩️</span><span>Easy Cancellations</span></div>
            <div class="trust-item"><span class="trust-icon c4">🎧</span><span>24/7 Support</span></div>
          </div>
        </div>

        <div class="footer-body">
          <div class="container">
            <div class="footer-grid">
              <div>
                <div class="footer-brand"><span class="brand-mark">CS</span> ChrisSlots</div>
                <p style="max-width:280px">One platform to discover, compare and reserve transportation, restaurants, hotels, events and more.</p>
              </div>
              <div>
                <h5>Services</h5>
                <ul>
                  <li><a href="listing.html?type=train">Train tickets</a></li>
                  <li><a href="listing.html?type=bus">Bus tickets</a></li>
                  <li><a href="listing.html?type=cab">Cab booking</a></li>
                  <li><a href="listing.html?type=restaurant">Restaurants</a></li>
                  <li><a href="listing.html?type=hotel">Hotels</a></li>
                </ul>
              </div>
              <div>
                <h5>Discover</h5>
                <ul>
                  <li><a href="listing.html?type=cinema">Cinema</a></li>
                  <li><a href="listing.html?type=event">Events</a></li>
                  <li><a href="listing.html?type=flight">Flights</a></li>
                  <li><a href="listing.html?type=venue">Venues</a></li>
                  <li><a href="listing.html?type=all">Explore all</a></li>
                </ul>
              </div>
              <div>
                <h5>Help</h5>
                <ul>
                  <li><a href="help.html">Help center</a></li>
                  <li><a href="help.html#cancellation">Cancellations</a></li>
                  <li><a href="help.html#payment">Payment</a></li>
                  <li><a href="help.html#contact">Contact support</a></li>
                </ul>
              </div>
              <div>
                <h5>Company</h5>
                <ul>
                  <li><a href="about.html">About ChrisSlots</a></li>
                  <li><a href="dashboard.html">My account</a></li>
                  <li><a href="#">Terms &amp; Conditions</a></li>
                  <li><a href="#">Privacy Policy</a></li>
                </ul>
              </div>
            </div>

            <hr class="footer-divider">

            <div class="footer-subsection">
              <h6>Follow Us</h6>
              <div class="social-pill-row">
                <a href="https://ig.me/m/dubem1488" target="_blank" rel="noopener" class="social-pill"><span class="social-icon" style="background:linear-gradient(45deg,#F58529,#DD2A7B,#8134AF)">📷</span>Instagram</a>
                <a href="https://www.facebook.com/profile.php?id=100087038303607" target="_blank" rel="noopener" class="social-pill"><span class="social-icon" style="background:#1877F2">f</span>Facebook</a>
                <a href="https://youtube.com/@ekenechukwuchidubem?si=YMz2JSii5hzW54lZ" target="_blank" rel="noopener" class="social-pill"><span class="social-icon" style="background:#FF0000">▶</span>YouTube</a>
                <a href="https://www.linkedin.com/in/ekenechukwu-chidubem-789039309" target="_blank" rel="noopener" class="social-pill"><span class="social-icon" style="background:#0A66C2">in</span>LinkedIn</a>
                <a href="https://wa.me/message/4Q4W5CWMMGO2P1" target="_blank" rel="noopener" class="social-pill"><span class="social-icon" style="background:#25D366">💬</span>WhatsApp</a>
              </div>
            </div>

            <div class="footer-subsection" style="margin-bottom:0">
              <h6>We Accept</h6>
              <div class="accept-row">
                <span class="accept-badge">VISA</span>
                <span class="accept-badge">💳 Mastercard</span>
                <span class="accept-badge">PayPal</span>
                <span class="accept-badge">🍎 Apple Pay</span>
                <span class="accept-badge">G Pay</span>
                <span class="accept-badge wallet">👛 ChrisSlots Wallet</span>
              </div>
            </div>

            <div class="footer-bottom">
              <span>© 2026 ChrisSlots. All rights reserved.</span>
              <span>Book it. Reserve it. Enjoy it.</span>
            </div>
          </div>
        </div>
      </footer>
    `;
  }

  function toggleDropdown(id) {
    document.querySelectorAll(".dropdown.open").forEach(d => { if (d.id !== id) d.classList.remove("open"); });
    document.getElementById(id)?.classList.toggle("open");
  }
  function toggleDrawer(open) {
    document.getElementById("mobile-drawer")?.classList.toggle("open", open);
  }
  document.addEventListener("click", e => {
    document.querySelectorAll(".dropdown.open").forEach(d => {
      if (!d.contains(e.target)) d.classList.remove("open");
    });
  });

  function quickSearch(e) {
    e.preventDefault();
    location.href = "listing.html?type=all";
  }

  function toast(msg) {
    let wrap = document.querySelector(".toast-wrap");
    if (!wrap) {
      wrap = document.createElement("div");
      wrap.className = "toast-wrap";
      document.body.appendChild(wrap);
    }
    const t = document.createElement("div");
    t.className = "toast";
    t.textContent = msg;
    wrap.appendChild(t);
    setTimeout(() => t.remove(), 3200);
  }

  function qs(name, fallback = "") {
    return new URLSearchParams(location.search).get(name) || fallback;
  }

  function money(n) { return "$" + Number(n).toFixed(2); }

  function stars(rating) {
    const full = Math.round(rating);
    return "★".repeat(full) + "☆".repeat(5 - full);
  }

  function todayISO() {
    return new Date().toISOString().slice(0, 10);
  }

  function requireAuthOrPrompt(next) {
    if (Auth.currentUser()) { next(); return; }
    toast("Please log in to continue");
    setTimeout(() => location.href = `login.html?redirect=${encodeURIComponent(location.pathname.split("/").pop() + location.search)}`, 700);
  }

  function init() {
    renderHeader();
    renderFooter();
  }

  document.addEventListener("DOMContentLoaded", init);

  return { toggleDropdown, toggleDrawer, quickSearch, toast, qs, money, stars, todayISO, requireAuthOrPrompt, renderHeader };
})();

