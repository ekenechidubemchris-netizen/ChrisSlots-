/* ==========================================================================
   ChrisSlots — booking.js
   Handles the in-progress "pending booking" (cart), confirmed bookings,
   favorites, notifications and user-submitted reviews. All persisted to
   localStorage for this frontend demo; every function is a clean seam for
   swapping in real API calls later.
   ========================================================================== */

const Booking = (() => {
  const PENDING_KEY = "cs_pending_booking";
  const BOOKINGS_KEY = "cs_bookings";
  const FAVORITES_KEY = "cs_favorites";
  const NOTIFS_KEY = "cs_notifications";
  const REVIEWS_KEY = "cs_reviews";

  function userKey() {
    const u = Auth.currentUser();
    return u ? u.email : "guest";
  }

  /* ------------------------------------------------------------- pending */
  function setPending(obj) {
    sessionStorage.setItem(PENDING_KEY, JSON.stringify(obj));
  }
  function getPending() {
    const raw = sessionStorage.getItem(PENDING_KEY);
    return raw ? JSON.parse(raw) : null;
  }
  function clearPending() {
    sessionStorage.removeItem(PENDING_KEY);
  }

  /* ------------------------------------------------------------ bookings */
  function allBookingsRaw() {
    return JSON.parse(localStorage.getItem(BOOKINGS_KEY) || "{}");
  }
  function getBookings() {
    const all = allBookingsRaw();
    return (all[userKey()] || []).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }
  function confirmBooking(details) {
    const all = allBookingsRaw();
    const key = userKey();
    if (!all[key]) all[key] = [];
    const booking = {
      ref: DB.ref(),
      status: "Confirmed",
      createdAt: new Date().toISOString(),
      ...details,
    };
    all[key].unshift(booking);
    localStorage.setItem(BOOKINGS_KEY, JSON.stringify(all));
    addNotification(`Booking confirmed — ${details.title} on ${details.date}.`);
    clearPending();
    return booking;
  }
  function cancelBooking(ref) {
    const all = allBookingsRaw();
    const key = userKey();
    const list = all[key] || [];
    const b = list.find(x => x.ref === ref);
    if (b) {
      b.status = "Cancelled";
      localStorage.setItem(BOOKINGS_KEY, JSON.stringify(all));
      addNotification(`Booking ${ref} was cancelled.`);
    }
    return b;
  }
  function getBooking(ref) {
    return getBookings().find(b => b.ref === ref);
  }

  /* ----------------------------------------------------------- favorites */
  function allFavoritesRaw() {
    return JSON.parse(localStorage.getItem(FAVORITES_KEY) || "{}");
  }
  function getFavorites() {
    const all = allFavoritesRaw();
    return all[userKey()] || [];
  }
  function isFavorite(id) {
    return getFavorites().some(f => f.id === id);
  }
  function toggleFavorite(item) {
    const all = allFavoritesRaw();
    const key = userKey();
    if (!all[key]) all[key] = [];
    const idx = all[key].findIndex(f => f.id === item.id);
    let nowFav;
    if (idx > -1) { all[key].splice(idx, 1); nowFav = false; }
    else { all[key].unshift(item); nowFav = true; }
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(all));
    return nowFav;
  }

  /* -------------------------------------------------------- notifications */
  function allNotifsRaw() {
    return JSON.parse(localStorage.getItem(NOTIFS_KEY) || "{}");
  }
  function getNotifications() {
    const all = allNotifsRaw();
    return all[userKey()] || [];
  }
  function addNotification(text) {
    const all = allNotifsRaw();
    const key = userKey();
    if (!all[key]) all[key] = [];
    all[key].unshift({ text, time: "Just now", read: false });
    all[key] = all[key].slice(0, 20);
    localStorage.setItem(NOTIFS_KEY, JSON.stringify(all));
  }
  function markAllRead() {
    const all = allNotifsRaw();
    const key = userKey();
    (all[key] || []).forEach(n => n.read = true);
    localStorage.setItem(NOTIFS_KEY, JSON.stringify(all));
  }

  /* ---------------------------------------------------------------- wallet */
  const WALLET_KEY = "cs_wallet";
  function allWalletsRaw() {
    return JSON.parse(localStorage.getItem(WALLET_KEY) || "{}");
  }
  function saveWallets(all) {
    localStorage.setItem(WALLET_KEY, JSON.stringify(all));
  }
  function getWallet() {
    const all = allWalletsRaw();
    const key = userKey();
    if (!all[key]) {
      // Seed every new wallet with a welcome credit so the demo has something to spend.
      all[key] = {
        balance: 150,
        transactions: [
          { type: "credit", label: "Welcome credit", amount: 150, date: new Date().toISOString() },
        ],
      };
      saveWallets(all);
    }
    return all[key];
  }
  function getWalletBalance() {
    return getWallet().balance;
  }
  function getWalletTransactions() {
    return getWallet().transactions.slice().sort((a, b) => b.date.localeCompare(a.date));
  }
  function topUpWallet(amount, method) {
    amount = Math.round(Number(amount) * 100) / 100;
    if (!amount || amount <= 0) return { ok: false, error: "Enter an amount greater than $0." };
    const all = allWalletsRaw();
    const key = userKey();
    const wallet = all[key] || getWallet();
    wallet.balance = Math.round((wallet.balance + amount) * 100) / 100;
    wallet.transactions.unshift({ type: "credit", label: `Top-up via ${method || "card"}`, amount, date: new Date().toISOString() });
    all[key] = wallet;
    saveWallets(all);
    addNotification(`Added ${money(amount)} to your wallet.`);
    return { ok: true, balance: wallet.balance };
  }
  function payFromWallet(amount, label) {
    amount = Math.round(Number(amount) * 100) / 100;
    const all = allWalletsRaw();
    const key = userKey();
    const wallet = all[key] || getWallet();
    if (wallet.balance < amount) return { ok: false, error: "Insufficient wallet balance." };
    wallet.balance = Math.round((wallet.balance - amount) * 100) / 100;
    wallet.transactions.unshift({ type: "debit", label: label || "Booking payment", amount, date: new Date().toISOString() });
    all[key] = wallet;
    saveWallets(all);
    return { ok: true, balance: wallet.balance };
  }
  function money(n) { return "$" + Number(n).toFixed(2); }

  /* -------------------------------------------------------------- reviews */
  function getUserReviews(itemId) {
    const all = JSON.parse(localStorage.getItem(REVIEWS_KEY) || "{}");
    return all[itemId] || [];
  }
  function addReview(itemId, review) {
    const all = JSON.parse(localStorage.getItem(REVIEWS_KEY) || "{}");
    if (!all[itemId]) all[itemId] = [];
    all[itemId].unshift(review);
    localStorage.setItem(REVIEWS_KEY, JSON.stringify(all));
  }

  return {
    setPending, getPending, clearPending,
    getBookings, confirmBooking, cancelBooking, getBooking,
    getFavorites, isFavorite, toggleFavorite,
    getNotifications, addNotification, markAllRead,
    getUserReviews, addReview,
    getWallet, getWalletBalance, getWalletTransactions, topUpWallet, payFromWallet,
  };
})();
