/* ==========================================================================
   ChrisSlots — search.js
   Powers listing.html: renders results for whichever service type is
   selected, wires filters/sort, and re-renders without a page reload.
   ========================================================================== */

const Search = (() => {
  let state = { type: "all", city: "", q: "", sort: "", minRating: "", from: "", to: "", date: "" };

  function init() {
    const params = new URLSearchParams(location.search);
    state.type = params.get("type") || "all";
    state.city = params.get("city") || "";
    state.q = params.get("q") || "";
    state.from = params.get("from") || "";
    state.to = params.get("to") || "";
    state.date = params.get("date") || App.todayISO();
    renderTypeTabs();
    renderFilters();
    renderResults();
  }

  function typeLabel(t) {
    const c = DB.CATEGORIES.find(c => c.type === t);
    return c ? `${c.icon} ${c.name}` : "All services";
  }

  function renderTypeTabs() {
    const el = document.getElementById("type-tabs");
    if (!el) return;
    const types = ["all", ...DB.CATEGORIES.map(c => c.type)];
    el.innerHTML = types.map(t => `
      <button class="search-tab ${state.type === t ? "active" : ""}" onclick="Search.setType('${t}')">
        ${t === "all" ? "✨ All" : typeLabel(t)}
      </button>`).join("");
  }

  function setType(t) {
    state.type = t;
    updateURL();
    renderTypeTabs();
    renderFilters();
    renderResults();
  }

  function updateURL() {
    const p = new URLSearchParams();
    p.set("type", state.type);
    if (state.city) p.set("city", state.city);
    if (state.q) p.set("q", state.q);
    history.replaceState(null, "", `listing.html?${p.toString()}`);
  }

  function renderFilters() {
    const el = document.getElementById("filters-panel");
    if (!el) return;
    const needsCity = state.type !== "cab";
    el.innerHTML = `
      <h4>Filters</h4>
      ${needsCity ? `
      <div class="filter-group">
        <label class="hint" style="display:block;margin-bottom:8px">Location</label>
        <select class="sort-select" style="width:100%" onchange="Search.setCity(this.value)">
          <option value="">All cities</option>
          ${DB.CITIES.map(c => `<option value="${c}" ${state.city === c ? "selected" : ""}>${c}</option>`).join("")}
        </select>
      </div>` : ""}
      <div class="filter-group">
        <label class="hint" style="display:block;margin-bottom:8px">Minimum rating</label>
        <div class="filter-chip-row">
          ${["", "3", "4", "4.5"].map(r => `
            <button class="chip ${state.minRating === r ? "active" : ""}" onclick="Search.setRating('${r}')">${r ? r + "★+" : "Any"}</button>
          `).join("")}
        </div>
      </div>
      <div class="filter-group">
        <label class="hint" style="display:block;margin-bottom:8px">Search within results</label>
        <input type="text" class="sort-select" style="width:100%" placeholder="Name, cuisine, city..." value="${state.q}" oninput="Search.setQuery(this.value)">
      </div>
    `;
  }

  function setCity(v) { state.city = v; renderResults(); }
  function setRating(v) { state.minRating = v; renderFilters(); renderResults(); }
  function setQuery(v) { state.q = v; renderResults(); }
  function setSort(v) { state.sort = v; renderResults(); }

  function card(type, item) {
    switch (type) {
      case "restaurant": return restaurantCard(item);
      case "hotel": return hotelCard(item);
      case "event": return eventCard(item);
      case "venue": return venueCard(item);
      case "cinema": return movieCard(item);
      case "train": return transitCard("train", item, "🚆");
      case "bus": return transitCard("bus", item, "🚌");
      case "flight": return flightCard(item);
      case "cab": return "";
      default: return "";
    }
  }

  function favBtn(id, type, payload) {
    const active = Booking.isFavorite(id);
    return `<button class="fav-btn ${active ? "active" : ""}" onclick='Search.fav(event, ${JSON.stringify({ id, type, ...payload }).replace(/'/g, "&#39;")})'>${active ? "♥" : "♡"}</button>`;
  }
  function fav(e, item) {
    e.preventDefault(); e.stopPropagation();
    const now = Booking.toggleFavorite(item);
    App.toast(now ? "Added to favorites" : "Removed from favorites");
    renderResults();
  }

  function restaurantCard(r) {
    return `<a class="card" href="details.html?type=restaurant&id=${r.id}">
      <div class="card-media"><img src="${DB.img("restaurant", DB.idIndex(r.id))}" alt="${r.name} dining room" loading="lazy">
        <span class="card-badge">${r.price}</span>${favBtn(r.id, "restaurant", { name: r.name, sub: r.cuisine })}</div>
      <div class="card-body">
        <div class="card-top"><h3>${r.name}</h3><span class="rating-pill">★ ${r.rating}</span></div>
        <div class="card-meta"><span>📍 ${r.city}</span><span>🍽 ${r.cuisine}</span><span>🕒 ${r.hours}</span></div>
        <p class="muted" style="font-size:13.5px">${r.desc}</p>
        <div class="card-foot"><span class="price">Reserve free</span><span class="btn btn-primary btn-sm">Reserve table</span></div>
      </div></a>`;
  }
  function hotelCard(h) {
    return `<a class="card" href="details.html?type=hotel&id=${h.id}">
      <div class="card-media"><img src="${DB.img("hotel", DB.idIndex(h.id))}" alt="${h.name} exterior" loading="lazy">
        ${favBtn(h.id, "hotel", { name: h.name, sub: h.city })}</div>
      <div class="card-body">
        <div class="card-top"><h3>${h.name}</h3><span class="rating-pill">★ ${h.rating}</span></div>
        <div class="card-meta"><span>📍 ${h.city}</span></div>
        <div class="tag-row">${h.amenities.slice(0, 3).map(a => `<span class="tag">${a}</span>`).join("")}</div>
        <div class="card-foot"><span class="price">${App.money(h.price)}<small>/night</small></span><span class="btn btn-primary btn-sm">View rooms</span></div>
      </div></a>`;
  }
  function eventCard(ev) {
    return `<a class="card" href="details.html?type=event&id=${ev.id}">
      <div class="card-media"><img src="${ev.image}" alt="${ev.name}" loading="lazy">
        <span class="card-badge">${ev.category}</span>${favBtn(ev.id, "event", { name: ev.name, sub: ev.city })}</div>
      <div class="card-body">
        <div class="card-top"><h3>${ev.name}</h3></div>
        <div class="card-meta"><span>📅 ${ev.date}</span><span>🕒 ${ev.time}</span><span>📍 ${ev.city}</span></div>
        <p class="muted" style="font-size:13.5px">${ev.desc}</p>
        <div class="card-foot"><span class="price">From ${App.money(Math.min(...ev.tiers.map(t=>t.price)))}</span><span class="btn btn-primary btn-sm">Get tickets</span></div>
      </div></a>`;
  }
  function venueCard(v) {
    return `<a class="card" href="details.html?type=venue&id=${v.id}">
      <div class="card-media"><img src="${v.image}" alt="${v.name}" loading="lazy">
        ${favBtn(v.id, "venue", { name: v.name, sub: v.city })}</div>
      <div class="card-body">
        <div class="card-top"><h3>${v.name}</h3></div>
        <div class="card-meta"><span>📍 ${v.city}</span><span>👥 Up to ${v.capacity}</span></div>
        <div class="tag-row">${v.amenities.slice(0, 3).map(a => `<span class="tag">${a}</span>`).join("")}</div>
        <div class="card-foot"><span class="price">${App.money(v.price)}<small>/day</small></span><span class="btn btn-primary btn-sm">Reserve venue</span></div>
      </div></a>`;
  }
  function movieCard(m) {
    return `<a class="card" href="details.html?type=cinema&id=${m.id}">
      <div class="card-media"><img src="${m.poster}" alt="${m.title} poster" loading="lazy"><span class="card-badge">${m.rating}</span></div>
      <div class="card-body">
        <div class="card-top"><h3>${m.title}</h3></div>
        <div class="card-meta"><span>🎭 ${m.genre}</span><span>⏱ ${m.duration} min</span></div>
        <p class="muted" style="font-size:13.5px">${m.desc}</p>
        <div class="card-foot"><span></span><span class="btn btn-primary btn-sm">Showtimes</span></div>
      </div></a>`;
  }
  function transitCard(kind, t, icon) {
    return `<div class="card" style="flex-direction:row" >
      <div class="card-body" style="flex:1">
        <div class="card-top"><h3>${icon} ${t.name || t.company}</h3><span class="rating-pill">★ ${t.rating}</span></div>
        <div class="card-meta">
          <span>🛫 ${t.depTime} ${t.from}</span><span>🛬 ${t.arrTime} ${t.to}</span><span>⏱ ${t.durationH}h</span>
          <span>💺 ${t.seatsAvailable} left</span>
        </div>
        <div class="tag-row">${(t.amenities || []).map(a => `<span class="tag">${a}</span>`).join("")}${t.cls ? `<span class="tag">${t.cls}</span>` : ""}${t.busType ? `<span class="tag">${t.busType}</span>` : ""}</div>
        <div class="card-foot"><span class="price">${App.money(t.price)}</span>
          <a class="btn btn-primary btn-sm" href="seatmap.html?type=${kind}&id=${t.id}&from=${encodeURIComponent(t.from)}&to=${encodeURIComponent(t.to)}&date=${state.date}">Select seat</a>
        </div>
      </div></div>`;
  }
  function flightCard(f) {
    return `<div class="card" style="flex-direction:row">
      <div class="card-body" style="flex:1">
        <div class="card-top"><h3>✈️ ${f.airline} · ${f.flightNo}</h3></div>
        <div class="card-meta">
          <span>🛫 ${f.depTime} ${f.from}</span><span>🛬 ${f.arrTime} ${f.to}</span><span>⏱ ${f.durationH}h</span>
          <span>${f.stops === 0 ? "Nonstop" : f.stops + " stop(s)"}</span>
        </div>
        <div class="tag-row"><span class="tag">${f.cls}</span><span class="tag">${f.baggage}</span></div>
        <div class="card-foot"><span class="price">${App.money(f.price)}</span>
          <a class="btn btn-primary btn-sm" href="booking.html?type=flight&id=${f.id}&from=${encodeURIComponent(f.from)}&to=${encodeURIComponent(f.to)}&date=${state.date}">Select flight</a>
        </div>
      </div></div>`;
  }

  function getList() {
    const filters = { city: state.city, q: state.q, sort: state.sort, minRating: state.minRating };
    const from = state.from || "New York", to = state.to || "Boston";
    switch (state.type) {
      case "restaurant": return DB.getRestaurants(filters);
      case "hotel": return DB.getHotels(filters);
      case "event": return DB.getEvents(filters);
      case "venue": return DB.getVenues(filters);
      case "cinema": return DB.getMovies();
      case "train": return DB.getTrains(from, to);
      case "bus": return DB.getBuses(from, to);
      case "flight": return DB.getFlights(from, to);
      case "cab": return [];
      case "all": return [];
      default: return [];
    }
  }

  function renderResults() {
    const grid = document.getElementById("results-grid");
    const count = document.getElementById("results-count");
    const heading = document.getElementById("listing-heading");
    if (!grid) return;
    if (heading) heading.textContent = state.type === "all" ? "Explore everything on ChrisSlots" : typeLabel(state.type);

    if (state.type === "all") {
      grid.className = "grid";
      grid.innerHTML = DB.CATEGORIES.map(c => `
        <a class="card" href="listing.html?type=${c.type}">
          <div class="card-body" style="align-items:flex-start">
            <div class="cat-icon">${c.icon}</div>
            <h3 style="margin:6px 0 0">${c.name}</h3>
            <p class="muted" style="font-size:13.5px">${c.desc}</p>
            <span class="btn btn-secondary btn-sm">Browse ${c.name.toLowerCase()}</span>
          </div>
        </a>`).join("");
      if (count) count.textContent = `${DB.CATEGORIES.length} categories`;
      return;
    }

    if (state.type === "cab") {
      grid.className = "";
      grid.innerHTML = `<div class="empty-state"><div class="em-icon">🚕</div><h3>Book a cab in seconds</h3>
        <p>Enter your pickup and drop-off to see live vehicle options.</p>
        <a class="btn btn-primary" href="booking.html?type=cab">Book a cab</a></div>`;
      if (count) count.textContent = "";
      return;
    }

    let list = getList();
    if (state.q && ["train", "bus", "flight"].includes(state.type)) {
      const q = state.q.toLowerCase();
      list = list.filter(x => JSON.stringify(x).toLowerCase().includes(q));
    }
    if (state.sort === "price-asc") list = list.slice().sort((a,b)=>a.price-b.price);
    if (state.sort === "price-desc") list = list.slice().sort((a,b)=>b.price-a.price);
    if (state.sort === "rating") list = list.slice().sort((a,b)=>(b.rating||0)-(a.rating||0));

    if (count) count.textContent = `${list.length} result${list.length === 1 ? "" : "s"}${state.city ? " in " + state.city : ""}`;

    if (!list.length) {
      grid.className = "";
      grid.innerHTML = `<div class="empty-state"><div class="em-icon">🔍</div><h3>No results match your filters</h3><p>Try a different city or clear your filters.</p></div>`;
      return;
    }
    grid.className = "grid";
    grid.innerHTML = list.map(item => card(state.type, item)).join("");
  }

  return { init, setType, setCity, setRating, setQuery, setSort, fav };
})();
