/* ==========================================================================
   ChrisSlots — data.js
   Central demo dataset. In production this file is replaced by calls to a
   real API/database — every other script reads through the DB.get* methods
   below, so swapping the source later means editing only this file.
   ========================================================================== */

const DB = (() => {

  const CATEGORIES = [
    { type: "train",      icon: "🚆", name: "Train",      desc: "City to city, on schedule" },
    { type: "bus",        icon: "🚌", name: "Bus",        desc: "Affordable long-distance travel" },
    { type: "cab",        icon: "🚕", name: "Cab",        desc: "Door-to-door rides on demand" },
    { type: "restaurant", icon: "🍽",  name: "Restaurant", desc: "Tables at places worth visiting" },
    { type: "hotel",      icon: "🏨", name: "Hotel",      desc: "Stays for every kind of trip" },
    { type: "cinema",     icon: "🎬", name: "Cinema",     desc: "New releases, best seats" },
    { type: "event",      icon: "🎟",  name: "Events",     desc: "Concerts, festivals, and shows" },
    { type: "flight",     icon: "✈️",  name: "Flights",    desc: "Domestic and connecting routes" },
    { type: "venue",      icon: "🏢", name: "Venues",     desc: "Rooms and halls for any occasion" },
  ];

  const CITIES = ["New York", "Boston", "Washington DC", "Philadelphia", "Chicago", "San Francisco", "Los Angeles", "Seattle", "Austin", "Miami", "Denver", "Atlanta"];

  // Real photography hotlinked from Unsplash's CDN (images.unsplash.com).
  // Every ID below was verified by hand against its actual photo content
  // (see conversation) so each category shows genuinely matching imagery.
  // Unsplash's License permits this use freely, with no attribution required.
  const IMG = {
    train: ["1527295110-5145f6b148d0", "1532105956626-9569c03602f6", "1553184257-604db3e574a8"],
    bus: ["1632276536839-84cad7fd03b0", "1564694202883-46e7448c1b26", "1660233868431-3b1372aef4d0"],
    cab: ["1628947733273-cdae71c9bfd3", "1630717285906-29364ffacea0", "1572013343866-dfdb9b416810", "1610886023290-6ba32b20e354"],
    restaurant: ["1667388969250-1c7220bf3f37", "1551632436-cbf8dd35adfa", "1613274554329-70f997f5789f", "1729394405518-eaf2a0203aa7", "1570560258879-af7f8e1447ac"],
    hotel: ["1618773928121-c32242e63f39", "1611892440504-42a792e24d32", "1629140727571-9b5c6f6267b4", "1631049307264-da0ec9d70304", "1711059985570-4c32ed12a12c"],
    cinema: ["1635400138431-0bbde4d01484", "1668890094751-6986d0ca9dfc", "1561722798-9a732d141027"],
    event: ["1459749411175-04bf5292ceea", "1563841930606-67e2bce48b78", "1470229722913-7c0e2dbbafd3", "1533174072545-7a4b6ad7a6c3", "1514525253161-7a46d19cd819"],
    flight: ["1641447093043-241f064568fb", "1636699811128-1a83547b76d5", "1638716769885-e73a0bab1756"],
    venue: ["1628062699790-7c45262b82b4", "1431540015161-0bf868a2d407", "1517502884422-41eaead166d4", "1610374792793-f016b77ca51a", "1503423571797-2d2bb372094a"],
  };
  function img(type, i, w = 800, h = 600) {
    const set = IMG[type] || IMG.hotel;
    const id = set[i % set.length];
    return `https://images.unsplash.com/photo-${id}?w=${w}&h=${h}&fit=crop&auto=format`;
  }

  function seededRand(seed) {
    let s = seed;
    return () => {
      s = (s * 9301 + 49297) % 233280;
      return s / 233280;
    };
  }
  function pick(arr, r) { return arr[Math.floor(r() * arr.length)]; }
  function ref() {
    return "CS-" + Date.now().toString(36).toUpperCase().slice(-6) + Math.random().toString(36).toUpperCase().slice(2, 5);
  }

  /* ---------------------------------------------------------------- TRAINS */
  const TRAIN_NAMES = ["Coastal Express", "Metro Link", "Highline Flyer", "Summit Runner", "River Route", "Capital Connector"];
  function genTrains(from, to, count = 6) {
    const r = seededRand((from + to).length * 17 + 3);
    const out = [];
    for (let i = 0; i < count; i++) {
      const depH = 5 + Math.floor(r() * 17);
      const durH = 1 + Math.floor(r() * 6);
      const classes = ["Economy", "Business", "First Class"];
      out.push({
        id: `tr-${from}-${to}-${i}`.replace(/\s+/g, ""),
        name: pick(TRAIN_NAMES, r),
        number: `EX${100 + Math.floor(r() * 800)}`,
        from, to,
        depTime: `${String(depH).padStart(2, "0")}:${pick(["00", "15", "30", "45"], r)}`,
        durationH: durH,
        arrTime: `${String((depH + durH) % 24).padStart(2, "0")}:${pick(["00", "15", "30", "45"], r)}`,
        seatsAvailable: 8 + Math.floor(r() * 80),
        totalSeats: 96,
        cls: pick(classes, r),
        price: 29 + Math.floor(r() * 140),
        amenities: pick([["Wi-Fi", "Power outlets"], ["Wi-Fi", "Food service"], ["Power outlets", "Quiet car"], ["Wi-Fi", "Power outlets", "Food service"]], r),
        rating: (3.6 + r() * 1.3).toFixed(1),
      });
    }
    return out.sort((a, b) => a.depTime.localeCompare(b.depTime));
  }

  /* ------------------------------------------------------------------ BUS */
  const BUS_COMPANIES = ["Interstate Coach", "Skyline Lines", "Comet Bus Co.", "Prairie Express", "Union Coachways"];
  function genBuses(from, to, count = 6) {
    const r = seededRand((from + to).length * 11 + 7);
    const out = [];
    for (let i = 0; i < count; i++) {
      const depH = 5 + Math.floor(r() * 18);
      const durH = 2 + Math.floor(r() * 8);
      out.push({
        id: `bus-${from}-${to}-${i}`.replace(/\s+/g, ""),
        company: pick(BUS_COMPANIES, r),
        busType: pick(["Standard", "Semi-Sleeper", "Sleeper", "Luxury Recliner"], r),
        from, to,
        depTime: `${String(depH).padStart(2, "0")}:${pick(["00", "20", "40"], r)}`,
        durationH: durH,
        arrTime: `${String((depH + durH) % 24).padStart(2, "0")}:${pick(["00", "20", "40"], r)}`,
        boarding: `${from} Central Terminal`,
        dropoff: `${to} Downtown Station`,
        seatsAvailable: 4 + Math.floor(r() * 40),
        totalSeats: 44,
        amenities: pick([["Wi-Fi", "AC"], ["AC", "Charging ports"], ["Wi-Fi", "AC", "Reclining seats"], ["Restroom", "AC"]], r),
        price: 15 + Math.floor(r() * 70),
        rating: (3.5 + r() * 1.4).toFixed(1),
      });
    }
    return out.sort((a, b) => a.depTime.localeCompare(b.depTime));
  }

  /* ------------------------------------------------------------------ CAB */
  const CAB_TYPES = [
    { cls: "Economy", cap: 4, imgId: "photo-1549317661-bd32c8ce0db2", base: 1.3, desc: "Budget-friendly everyday rides" },
    { cls: "Comfort", cap: 4, imgId: "photo-1502877338535-766e1452684a", base: 1.7, desc: "Newer cars, extra legroom" },
    { cls: "Premium", cap: 4, imgId: "photo-1511919884226-fd3cad34687c", base: 2.4, desc: "High-end sedans, top-rated drivers" },
    { cls: "SUV", cap: 6, imgId: "photo-1519641471654-76ce0107ad1b", base: 2.1, desc: "Extra room for groups and luggage" },
  ];
  function genCabs(distanceKm) {
    return CAB_TYPES.map((c, i) => ({
      id: `cab-${c.cls.toLowerCase()}`,
      cls: c.cls,
      capacity: c.cap,
      desc: c.desc,
      image: img("cab", i),
      etaMin: 3 + i * 2,
      durationMin: Math.max(8, Math.round(distanceKm * 2.1)),
      price: Math.round((5 + distanceKm * c.base) * 100) / 100,
    }));
  }

  /* ------------------------------------------------------------ RESTAURANTS */
  const RESTAURANTS = [
    { id: "r1", name: "Basalt & Vine", cuisine: "Modern American", city: "New York", price: "$$$", rating: 4.7, hours: "5:00 PM – 11:00 PM", desc: "Wood-fired mains and a rotating natural wine list in a warm, low-lit dining room.", dishes: ["Roasted bone marrow", "Charred octopus", "Dry-aged ribeye"], amenities: ["Outdoor seating", "Full bar", "Private room"] },
    { id: "r2", name: "Nori Lane", cuisine: "Japanese", city: "New York", price: "$$", rating: 4.6, hours: "12:00 PM – 10:00 PM", desc: "Counter-style sushi and izakaya plates from a chef trained in Osaka.", dishes: ["Omakase set", "Miso black cod", "Uni toast"], amenities: ["Sushi counter", "Sake pairing", "Takeout"] },
    { id: "r3", name: "Casa Marisol", cuisine: "Mexican", city: "Los Angeles", price: "$$", rating: 4.5, hours: "11:00 AM – 10:00 PM", desc: "Family-run kitchen serving Oaxacan-inspired moles and fresh masa tortillas.", dishes: ["Mole negro", "Al pastor tacos", "Elote"], amenities: ["Patio", "Live music Fri–Sat", "Family style"] },
    { id: "r4", name: "The Copper Room", cuisine: "Steakhouse", city: "Chicago", price: "$$$$", rating: 4.8, hours: "5:00 PM – 11:30 PM", desc: "Dry-aged steaks, a deep whiskey list, and white-tablecloth service downtown.", dishes: ["Tomahawk for two", "Lobster mac", "Bone-in filet"], amenities: ["Valet", "Private dining", "Cigar lounge"] },
    { id: "r5", name: "Green Door Café", cuisine: "Vegetarian", city: "Austin", price: "$", rating: 4.4, hours: "8:00 AM – 4:00 PM", desc: "All-day plant-forward café known for its weekend brunch line.", dishes: ["Turmeric scramble", "Jackfruit tacos", "Chai latte"], amenities: ["Outdoor seating", "Vegan options", "Wi-Fi"] },
    { id: "r6", name: "Porto & Pine", cuisine: "Mediterranean", city: "Boston", price: "$$$", rating: 4.6, hours: "5:00 PM – 10:30 PM", desc: "Coastal Mediterranean small plates built around a charcoal grill.", dishes: ["Grilled branzino", "Lamb kofta", "Burrata"], amenities: ["Waterfront view", "Full bar", "Group dining"] },
    { id: "r7", name: "Maple & Ash Diner", cuisine: "American", city: "Seattle", price: "$$", rating: 4.3, hours: "7:00 AM – 9:00 PM", desc: "Classic diner fare with a scratch kitchen and daily pie specials.", dishes: ["Short stack pancakes", "Patty melt", "Chicken pot pie"], amenities: ["All-day breakfast", "Kid friendly", "Takeout"] },
    { id: "r8", name: "Saffron House", cuisine: "Indian", city: "San Francisco", price: "$$", rating: 4.7, hours: "11:30 AM – 10:00 PM", desc: "Regional Indian dishes cooked in a wood-fired tandoor.", dishes: ["Tandoori lamb chops", "Paneer tikka", "Butter chicken"], amenities: ["Vegan options", "Private room", "Catering"] },
  ];

  /* ------------------------------------------------------------------ HOTELS */
  const HOTELS = [
    { id: "h1", name: "The Arden Hotel", city: "New York", rating: 4.6, price: 289, desc: "A boutique stay steps from the theater district, with a rooftop bar overlooking the skyline.", amenities: ["Free Wi-Fi", "Rooftop bar", "Gym", "Room service"], rooms: [{ type: "Standard Queen", price: 289, beds: "1 Queen" }, { type: "Deluxe King", price: 349, beds: "1 King" }, { type: "Suite", price: 549, beds: "1 King + Sofa" }] },
    { id: "h2", name: "Harbor View Inn", city: "Boston", rating: 4.4, price: 219, desc: "Waterfront rooms with harbor views, five minutes from the historic district.", amenities: ["Free Wi-Fi", "Harbor view", "Breakfast included", "Parking"], rooms: [{ type: "Harbor Queen", price: 219, beds: "1 Queen" }, { type: "Harbor King", price: 259, beds: "1 King" }] },
    { id: "h3", name: "Canyon Ridge Resort", city: "Denver", rating: 4.8, price: 399, desc: "A mountain-view resort with a full spa and ski-in access in winter.", amenities: ["Spa", "Ski access", "Pool", "Free Wi-Fi"], rooms: [{ type: "Mountain View", price: 399, beds: "1 King" }, { type: "Family Suite", price: 549, beds: "2 Queen" }] },
    { id: "h4", name: "Midtown Lofts", city: "Chicago", rating: 4.3, price: 179, desc: "Loft-style rooms with exposed brick in the heart of downtown.", amenities: ["Free Wi-Fi", "Pet friendly", "Gym", "Parking"], rooms: [{ type: "Loft Queen", price: 179, beds: "1 Queen" }, { type: "Loft King", price: 219, beds: "1 King" }] },
    { id: "h5", name: "Palm & Pier Hotel", city: "Miami", rating: 4.5, price: 259, desc: "Steps from the beach, with a rooftop pool and nightly live music.", amenities: ["Beach access", "Rooftop pool", "Bar", "Free Wi-Fi"], rooms: [{ type: "Ocean View Queen", price: 259, beds: "1 Queen" }, { type: "Ocean View King", price: 319, beds: "1 King" }] },
    { id: "h6", name: "The Sequoia", city: "San Francisco", rating: 4.7, price: 329, desc: "A quiet, design-led hotel near Union Square with an award-winning restaurant.", amenities: ["Restaurant", "Free Wi-Fi", "Gym", "Concierge"], rooms: [{ type: "City Queen", price: 329, beds: "1 Queen" }, { type: "City King", price: 379, beds: "1 King" }] },
  ];

  /* ----------------------------------------------------------------- MOVIES */
  const MOVIES = [
    { id: "m1", title: "Northern Lights", genre: "Drama", duration: 128, rating: "PG-13", desc: "A family drama set across three generations in rural Alaska.", poster: img("cinema", 0, 400, 600) },
    { id: "m2", title: "Velocity", genre: "Action", duration: 112, rating: "PG-13", desc: "An ex-racer is pulled back for one last job across three continents.", poster: img("cinema", 1, 400, 600) },
    { id: "m3", title: "The Quiet Orbit", genre: "Sci-Fi", duration: 134, rating: "PG", desc: "A crew on a decade-long mission confronts what they left behind.", poster: img("cinema", 2, 400, 600) },
    { id: "m4", title: "Paper Moths", genre: "Comedy", duration: 98, rating: "PG-13", desc: "Two estranged siblings clean out their late father's bookshop.", poster: img("event", 1, 400, 600) },
  ];
  const CINEMAS = ["Downtown 12", "Riverside Multiplex", "Uptown Cinema Grand"];
  function genShowtimes(movieId) {
    const r = seededRand(movieId.length * 31);
    const times = ["11:30 AM", "2:15 PM", "5:00 PM", "7:45 PM", "10:15 PM"];
    return CINEMAS.map(c => ({
      cinema: c,
      slots: times.filter(() => r() > 0.25).map(t => ({ time: t, price: 11 + Math.floor(r() * 8) })),
    }));
  }

  /* ----------------------------------------------------------------- EVENTS */
  const EVENTS = [
    { id: "e1", name: "Harborlight Music Festival", category: "Festival", city: "Chicago", date: "2026-10-10", time: "2:00 PM", organizer: "Harborlight Presents", desc: "A two-stage outdoor festival featuring indie and electronic acts.", image: img("event", 0), tiers: [{ name: "General", price: 65 }, { name: "VIP", price: 149 }], available: 320 },
    { id: "e2", name: "Future Stack Conference", category: "Conference", city: "San Francisco", date: "2026-11-04", time: "9:00 AM", organizer: "Future Stack Inc.", desc: "A one-day conference on product, design and engineering practice.", image: img("event", 1), tiers: [{ name: "Standard", price: 199 }, { name: "Student", price: 79 }], available: 140 },
    { id: "e3", name: "City Lights Comedy Night", category: "Show", city: "Austin", date: "2026-10-22", time: "8:00 PM", organizer: "Laugh Loft", desc: "A touring lineup of stand-up comedians for one night only.", image: img("event", 2), tiers: [{ name: "General Admission", price: 35 }, { name: "Front Row", price: 60 }], available: 80 },
    { id: "e4", name: "Riverside Jazz Sessions", category: "Concert", city: "New York", date: "2026-10-15", time: "7:30 PM", organizer: "Riverside Arts", desc: "An intimate evening of jazz on the waterfront stage.", image: img("event", 3), tiers: [{ name: "General", price: 45 }, { name: "Reserved Table", price: 120 }], available: 95 },
    { id: "e5", name: "Founders Workshop: From Idea to Launch", category: "Workshop", city: "Boston", date: "2026-10-29", time: "10:00 AM", organizer: "Beacon Ventures", desc: "A full-day hands-on workshop for early-stage founders.", image: img("event", 4), tiers: [{ name: "Seat", price: 89 }], available: 40 },
  ];

  /* ---------------------------------------------------------------- FLIGHTS */
  const AIRLINES = ["Continental Air", "Skyward Airlines", "Alpine Jet", "Coastal Airways"];
  function genFlights(from, to, count = 6) {
    const r = seededRand((from + to).length * 23 + 5);
    const out = [];
    for (let i = 0; i < count; i++) {
      const depH = 5 + Math.floor(r() * 18);
      const durH = 1 + Math.floor(r() * 6);
      const stops = pick([0, 0, 0, 1, 1, 2], r);
      out.push({
        id: `fl-${from}-${to}-${i}`.replace(/\s+/g, ""),
        airline: pick(AIRLINES, r),
        flightNo: pick(["AA", "SK", "AJ", "CA"], r) + (100 + Math.floor(r() * 800)),
        from, to,
        depTime: `${String(depH).padStart(2, "0")}:${pick(["00", "10", "25", "40"], r)}`,
        durationH: durH,
        arrTime: `${String((depH + durH) % 24).padStart(2, "0")}:${pick(["00", "10", "25", "40"], r)}`,
        stops,
        baggage: pick(["1 carry-on", "1 carry-on + 1 checked", "2 checked bags"], r),
        cls: pick(["Economy", "Premium Economy", "Business"], r),
        price: 79 + Math.floor(r() * 420),
      });
    }
    return out.sort((a, b) => a.price - b.price);
  }

  /* ----------------------------------------------------------------- VENUES */
  const VENUES = [
    { id: "v1", name: "The Atrium Hall", city: "Chicago", capacity: 300, desc: "A light-filled event hall with a retractable glass roof, ideal for receptions.", amenities: ["AV equipment", "Catering kitchen", "Parking", "Wheelchair access"], price: 1200, image: img("venue", 3) },
    { id: "v2", name: "Union Co-Work Loft", city: "Austin", capacity: 40, desc: "A flexible meeting space in a converted warehouse, popular for workshops.", amenities: ["Wi-Fi", "Whiteboard walls", "Coffee bar", "Projector"], price: 220, image: img("venue", 2) },
    { id: "v3", name: "Meridian Conference Center", city: "Washington DC", capacity: 500, desc: "A full-service conference center with breakout rooms and a main auditorium.", amenities: ["AV equipment", "Breakout rooms", "Catering", "Livestream support"], price: 2400, image: img("venue", 0) },
    { id: "v4", name: "Willow Garden Estate", city: "Los Angeles", capacity: 180, desc: "An outdoor garden venue with string lighting, popular for weddings.", amenities: ["Outdoor space", "Bridal suite", "Parking", "On-site coordinator"], price: 3200, image: img("venue", 4) },
    { id: "v5", name: "The Signal Room", city: "Seattle", capacity: 60, desc: "An industrial-style room with exposed beams for small parties and launches.", amenities: ["Sound system", "Bar setup", "Wi-Fi", "Loading dock"], price: 650, image: img("venue", 1) },
  ];

  /* ---------------------------------------------------------------- reviews */
  function genReviews(seed) {
    const r = seededRand(String(seed).length * 41 + 13);
    const names = ["Jordan P.", "Maya T.", "Sam R.", "Alex K.", "Priya N.", "Chris D.", "Taylor M."];
    const comments = [
      "Exactly as described, and the booking process was quick.",
      "Great experience overall, would come back again.",
      "Good value, though it was busier than expected.",
      "Really enjoyed this — staff were attentive and helpful.",
      "Solid choice, nothing went wrong and everything was on time.",
      "A little pricier than expected but worth it for the quality.",
    ];
    const out = [];
    const n = 3 + Math.floor(r() * 3);
    for (let i = 0; i < n; i++) {
      out.push({
        name: pick(names, r),
        rating: 3 + Math.floor(r() * 3),
        date: `2026-${String(1 + Math.floor(r() * 9)).padStart(2, "0")}-${String(1 + Math.floor(r() * 27)).padStart(2, "0")}`,
        comment: pick(comments, r),
        verified: r() > 0.35,
      });
    }
    return out;
  }

  function idIndex(id) {
    const m = String(id).match(/\d+/);
    return m ? parseInt(m[0], 10) : 0;
  }

  return {
    CATEGORIES, CITIES, img, ref, genReviews, idIndex,
    getRestaurants: (filters = {}) => filterList(RESTAURANTS, filters, ["city"], "rating"),
    getRestaurant: id => RESTAURANTS.find(x => x.id === id),
    getHotels: (filters = {}) => filterList(HOTELS, filters, ["city"], "rating"),
    getHotel: id => HOTELS.find(x => x.id === id),
    getMovies: () => MOVIES,
    getMovie: id => MOVIES.find(x => x.id === id),
    getShowtimes: genShowtimes,
    getEvents: (filters = {}) => filterList(EVENTS, filters, ["city", "category"], "date"),
    getEvent: id => EVENTS.find(x => x.id === id),
    getVenues: (filters = {}) => filterList(VENUES, filters, ["city"], "capacity"),
    getVenue: id => VENUES.find(x => x.id === id),
    getTrains: genTrains,
    getBuses: genBuses,
    getCabs: genCabs,
    getFlights: genFlights,
  };

  function filterList(list, filters, cityKeys, defaultSort) {
    let out = list.slice();
    if (filters.q) {
      const q = filters.q.toLowerCase();
      out = out.filter(x => JSON.stringify(x).toLowerCase().includes(q));
    }
    if (filters.city) out = out.filter(x => !x.city || x.city === filters.city);
    if (filters.category) out = out.filter(x => !x.category || x.category === filters.category);
    if (filters.minRating) out = out.filter(x => !x.rating || Number(x.rating) >= Number(filters.minRating));
    if (filters.sort === "price-asc") out.sort((a, b) => (a.price || 0) - (b.price || 0));
    else if (filters.sort === "price-desc") out.sort((a, b) => (b.price || 0) - (a.price || 0));
    else if (filters.sort === "rating") out.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    else if (filters.sort === "popularity") out.sort((a, b) => (b.rating || 0) * 10 - (a.rating || 0) * 10);
    return out;
  }
})();
                                                     
