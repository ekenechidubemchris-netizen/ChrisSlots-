/* ==========================================================================
   ChrisSlots — auth.js
   Demo authentication using localStorage. Every function here is written so
   the body can later be replaced with a fetch() call to a real auth API
   without changing any calling code elsewhere in the site.
   ========================================================================== */

const Auth = (() => {
  const USERS_KEY = "cs_users";
  const SESSION_KEY = "cs_session";

  function getUsers() {
    return JSON.parse(localStorage.getItem(USERS_KEY) || "[]");
  }
  function saveUsers(users) {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  }

  function currentUser() {
    const email = localStorage.getItem(SESSION_KEY);
    if (!email) return null;
    return getUsers().find(u => u.email === email) || null;
  }

  function register({ name, email, phone, password }) {
    const users = getUsers();
    if (users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
      return { ok: false, error: "An account with this email already exists." };
    }
    const user = { id: "u" + Date.now(), name, email, phone: phone || "", password, joined: new Date().toISOString().slice(0, 10) };
    users.push(user);
    saveUsers(users);
    localStorage.setItem(SESSION_KEY, email);
    return { ok: true, user };
  }

  function login({ email, password }) {
    const users = getUsers();
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (!user) return { ok: false, error: "No account found with that email." };
    if (user.password !== password) return { ok: false, error: "Incorrect password." };
    localStorage.setItem(SESSION_KEY, email);
    return { ok: true, user };
  }

  function logout() {
    localStorage.removeItem(SESSION_KEY);
    App.toast("You've been logged out");
    setTimeout(() => location.href = "index.html", 500);
  }

  function updateProfile(fields) {
    const users = getUsers();
    const email = localStorage.getItem(SESSION_KEY);
    const idx = users.findIndex(u => u.email === email);
    if (idx === -1) return { ok: false };
    users[idx] = { ...users[idx], ...fields };
    saveUsers(users);
    if (fields.email) localStorage.setItem(SESSION_KEY, fields.email);
    return { ok: true, user: users[idx] };
  }

  function seedDemoAccount() {
    const users = getUsers();
    if (!users.some(u => u.email === "demo@chrisslots.com")) {
      users.push({ id: "u_demo", name: "Jamie Rivera", email: "demo@chrisslots.com", phone: "+1 555 0101", password: "demo1234", joined: "2026-01-14" });
      saveUsers(users);
    }
  }
  seedDemoAccount();

  return { currentUser, register, login, logout, updateProfile };
})();
              
