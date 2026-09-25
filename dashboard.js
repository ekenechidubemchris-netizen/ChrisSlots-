/* ==========================================================================
   ChrisSlots — dashboard.js
   Powers dashboard.html: bookings history, favorites, and profile editing.
   ========================================================================== */

const Dashboard = (() => {
  let activeTab = "bookings";
  let bookingFilter = "upcoming";

  function init() {
    const user = Auth.currentUser();
    if (!user) {
      document.getElementById("dash-guard").style.display = "block";
      document.getElementById("dash-main").style.display = "none";
      return;
    }
    activeTab = App.qs("tab", "bookings");
    document.getElementById("dash-guard").style.display = "none";
    document.getElementById("dash-main").style.display = "block";
    renderProfileHeader(user);
    setTab(activeTab);
  }

  function renderProfileHeader(user) {
    document.getElementById("dash-avatar").textContent = user.name.slice(0, 1).toUpperCase();
    document.getElementById("dash-name").textContent = user.name;
    document.getElementById("dash-email").textContent = user.email;
    document.getElementById("dash-since").textContent = `Member since ${user.joined}`;
  }

  function setTab(tab) {
    activeTab = tab;
    document.querySelectorAll(".tab-btn").forEach(b => b.classList.toggle("active", b.dataset.tab === tab));
    document.querySelectorAll(".dash-panel").forEach(p => p.style.display = p.dataset.panel === tab ? "block" : "none");
    if (tab === "bookings") renderBookings();
    if (tab === "wallet") renderWallet();
    if (tab === "favorites") renderFavorites();
    if (tab === "profile") renderProfileForm();
  }

  function classify(b) {
    if (b.status === "Cancelled") return "cancelled";
    const d = new Date(b.date + "T" + (b.time && b.time.match(/\d/) ? "00:00" : "00:00"));
    return d.getTime() < Date.now() - 86400000 ? "completed" : "upcoming";
  }

  function setBookingFilter(f) {
    bookingFilter = f;
    document.querySelectorAll(".booking-filter-chip").forEach(c => c.classList.toggle("active", c.dataset.f === f));
    renderBookings();
  }

  function renderBookings() {
    const el = document.getElementById("bookings-list");
    if (!el) return;
    let list = Booking.getBookings();
    if (bookingFilter !== "all") list = list.filter(b => classify(b) === bookingFilter);
    if (!list.length) {
      el.innerHTML = `<div class="empty-state"><div class="em-icon">🧾</div><h3>No bookings here yet</h3><p>Once you reserve something, it will show up in this list.</p><a class="btn btn-primary" href="listing.html?type=all">Start exploring</a></div>`;
      return;
    }
    el.innerHTML = list.map(b => `
      <div class="card" style="margin-bottom:14px;flex-direction:row">
        <div class="card-body" style="flex:1">
          <div class="card-top">
            <div><h3 style="margin-bottom:2px">${b.title}</h3><span class="muted text-sm">${b.provider || ""}</span></div>
            <span class="badge badge-${(b.status === "Cancelled" ? "cancelled" : classify(b) === "completed" ? "completed" : b.status === "Pending" ? "pending" : "confirmed")}">${b.status === "Cancelled" ? "Cancelled" : classify(b) === "completed" ? "Completed" : b.status}</span>
          </div>
          <div class="card-meta">
            <span>📅 ${b.date}</span><span>🕒 ${b.time || "—"}</span><span>📍 ${b.location || "—"}</span><span>🔖 ${b.ref}</span>
          </div>
          <div class="card-foot">
            <span class="price">${App.money(b.total)}</span>
            <div class="card-actions">
              <a class="btn btn-secondary btn-sm" href="confirmation.html?ref=${b.ref}">View details</a>
              ${b.status !== "Cancelled" && classify(b) === "upcoming" ? `<button class="btn btn-danger btn-sm" onclick="Dashboard.cancel('${b.ref}')">Cancel</button>` : ""}
            </div>
          </div>
        </div>
      </div>`).join("");
  }

  function cancel(ref) {
    if (!confirm("Cancel this booking? This can't be undone in the demo.")) return;
    Booking.cancelBooking(ref);
    App.toast("Booking cancelled");
    renderBookings();
    App.renderHeader();
  }

  let selectedQuickAmount = 50;
  function renderWallet() {
    const balanceWrap = document.getElementById("wallet-balance-wrap");
    const txnList = document.getElementById("wallet-txn-list");
    const quickAmounts = document.getElementById("wallet-quick-amounts");
    if (!balanceWrap) return;

    const balance = Booking.getWalletBalance();
    balanceWrap.innerHTML = `
      <div class="wallet-card">
        <div>
          <div class="wc-label">Wallet balance</div>
          <div class="wc-balance">${App.money(balance)}</div>
        </div>
        <span class="tag" style="background:rgba(255,255,255,.15);border-color:rgba(255,255,255,.4);color:#fff">Use it at checkout on any booking</span>
      </div>`;

    const amounts = [25, 50, 100, 200];
    quickAmounts.innerHTML = amounts.map(a => `<button type="button" class="chip ${selectedQuickAmount === a ? "active" : ""}" onclick="Dashboard.setQuickAmount(${a}, this)">$${a}</button>`).join("");
    document.getElementById("wallet-amount").value = selectedQuickAmount;

    const txns = Booking.getWalletTransactions();
    if (!txns.length) {
      txnList.innerHTML = `<p class="muted text-sm">No transactions yet.</p>`;
      return;
    }
    txnList.innerHTML = txns.map(t => `
      <div class="wallet-txn">
        <div>
          <div class="wt-label">${t.label}</div>
          <div class="wt-date">${new Date(t.date).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })}</div>
        </div>
        <div class="wt-amount ${t.type}">${t.type === "credit" ? "+" : "−"}${App.money(t.amount)}</div>
      </div>`).join("");
  }

  function setQuickAmount(a, el) {
    selectedQuickAmount = a;
    document.getElementById("wallet-amount").value = a;
    document.querySelectorAll("#wallet-quick-amounts .chip").forEach(c => c.classList.remove("active"));
    if (el) el.classList.add("active");
  }

  function topUp() {
    const amount = Number(document.getElementById("wallet-amount").value);
    const method = document.getElementById("wallet-topup-method").value;
    const res = Booking.topUpWallet(amount, method);
    if (!res.ok) { App.toast(res.error); return; }
    App.toast(`Added ${App.money(amount)} to your wallet`);
    renderWallet();
  }

  function renderFavorites() {
    const el = document.getElementById("favorites-list");
    if (!el) return;
    const list = Booking.getFavorites();
    if (!list.length) {
      el.innerHTML = `<div class="empty-state"><div class="em-icon">❤️</div><h3>No favorites saved</h3><p>Tap the heart icon on any listing to save it here.</p></div>`;
      el.className = "";
      return;
    }
    el.className = "grid";
    el.innerHTML = list.map(f => `
      <a class="card" href="details.html?type=${f.type}&id=${f.id}">
        <div class="card-body">
          <div class="card-top"><h3>${f.name}</h3></div>
          <p class="muted text-sm">${f.sub || ""}</p>
          <span class="tag">${f.type}</span>
        </div>
      </a>`).join("");
  }

  function renderProfileForm() {
    const user = Auth.currentUser();
    const el = document.getElementById("profile-form-wrap");
    if (!el || !user) return;
    el.innerHTML = `
      <div class="form-row">
        <div class="form-group"><label>Full name</label><input id="pf-name" value="${user.name}"></div>
        <div class="form-group"><label>Email</label><input id="pf-email" value="${user.email}"></div>
      </div>
      <div class="form-group"><label>Phone</label><input id="pf-phone" value="${user.phone || ""}"></div>
      <button class="btn btn-primary" onclick="Dashboard.saveProfile()">Save changes</button>
    `;
  }
  function saveProfile() {
    const name = document.getElementById("pf-name").value.trim();
    const email = document.getElementById("pf-email").value.trim();
    const phone = document.getElementById("pf-phone").value.trim();
    if (!name || !email.includes("@")) { App.toast("Please enter a valid name and email"); return; }
    Auth.updateProfile({ name, email, phone });
    App.toast("Profile updated");
    App.renderHeader();
    renderProfileHeader(Auth.currentUser());
  }

  return { init, setTab, setBookingFilter, cancel, saveProfile, setQuickAmount, topUp };
})();
