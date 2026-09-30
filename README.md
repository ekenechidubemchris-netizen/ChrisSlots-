# ChrisSlots — Frontend Demo

A multi-service booking platform (trains, buses, cabs, restaurants, hotels,
cinema, events, flights, venues) built entirely in HTML, CSS and vanilla
JavaScript. No frameworks, no build tools, no backend.

This README exists to be honest about what that last part means. Everything
below is organized as **"what's real," "what's simulated well," and "what a
frontend genuinely cannot do."** Read it before assuming this is
production-ready — it isn't, and no amount of frontend polish changes that.

## Running it

Unzip the folder and open `index.html` in any browser. No install step, no
server required (though some browsers restrict a few APIs — see the "Web
Crypto" note below — so if anything looks off, try serving the folder with
`python3 -m http.server` and opening `http://localhost:8000` instead).

---

## What's genuinely real

- **Every page, every flow, fully built.** Search, filters, sorting, seat
  maps, a live restaurant table floor plan, hotel room selection, checkout,
  a wallet, six payment method UIs, auth, a dashboard, favorites, reviews,
  notifications, an FAQ. Not a partial mockup — the whole thing works,
  end to end, in a real browser.
- **Passwords are hashed before storage**, not stored as plain text. Each
  account gets a random salt, and the password is run through SHA-256 (via
  the browser's Web Crypto API) before it ever touches `localStorage`. See
  the security note in `js/auth.js` for exactly what this does and does not
  protect against — short version: it stops a plaintext leak, it does not
  make this a secure auth system.
- **Real client-side validation** on every form: email format, phone
  format, card number (Luhn checksum), expiry date (including "is it
  already expired"), CVC format, required fields, date-not-in-the-past
  checks. This catches typos. It does not stop someone who opens devtools —
  see "What a frontend cannot fix," below.
- **Deterministic, collision-free demo data.** Earlier drafts of this
  project seeded "random" data from a string's `.length`, which sounds
  harmless until you notice `"r1"` and `"h1"` are both length 2 — every
  restaurant was getting identical reviews, every train on a route had the
  identical seat map, every restaurant had the identical table layout, and
  every movie had the identical showtimes. All of that is fixed: data is
  now seeded from an actual hash of the relevant id (and, for
  trains/buses/flights, the id **and** the search date), so results are
  stable if you repeat the same search, but different across different
  routes, dates, and items.
- **A working (if honestly-scoped) simulation of booking conflicts.** See
  the dedicated section below — this is the most interesting thing here and
  worth reading in full before assuming "no backend" means "no
  concurrency handling at all."

## What's simulated well, with limits stated up front

### Social login (Facebook / Google / Apple)
Login and registration both offer "Continue with Google/Facebook/Apple."
Each provider logs into a **stable, dedicated demo identity** — clicking
"Continue with Google" always logs into the same simulated account (Sam
Chen), Facebook always resolves to Alex Morgan, Apple to Jordan Lee — the
way a real social login always resolves to the same person, tested to
confirm this actually holds across repeated logins. **This is fully
simulated.** No frontend can do real "Sign in with X": that requires the
provider itself redirecting back to a server that verifies a token
directly with them, which is exactly the server-side trust boundary this
project doesn't have. There is no real Facebook, Google, or Apple account
contacted, ever — the login page says so directly underneath the buttons.

### The wallet and payment methods
The wallet is a real running balance stored per account, with a genuine
transaction ledger, top-ups, and deductions — the math is correct (tested:
top-up, payment, insufficient-balance rejection, and refund-on-failure all
behave correctly). Six payment methods are selectable at checkout
(Wallet, Card, PayPal, Apple Pay, Google Pay, Cash for cab rides), each
with real client-side validation where it applies (card number/expiry/CVC).
**None of this moves real money.** There is no payment processor
integration; "Card" accepts any number that passes a Luhn checksum
(4242 4242 4242 4242 is the standard test number and works fine), and
PayPal/Apple Pay/Google Pay are visual stand-ins with no actual redirect or
device API call behind them.

### Booking conflicts and double-booking
This is the part worth actually understanding rather than skimming:

**What it does:** open the same train's seat map, or the same restaurant's
table map, or the same hotel's room picker, in two tabs of the same
browser. Select and start checking out on a seat/table in one tab, and the
other tab will — live, without a refresh — show that seat or table as
unavailable. Try to check out on it anyway and you'll get a real "someone
else just took this" rejection. Hotel rooms work the same way but by count
rather than individual identity (each room type has a fixed, stable
inventory of 3–8 units; booking checks and decrements that count, and a
sold-out room type is genuinely blocked). Cancel a booking and the
seat/table/room becomes available again, live, in any open tab.

**How:** two tabs of the same browser share `localStorage`, and the
`storage` event fires in one tab whenever *another* tab changes it. That's
a real browser mechanism, not a fake animation — the "hold" a seat gets
while you're mid-checkout, and the permanent "taken" state once you
confirm, are both just entries in `localStorage` that every open tab can
see and react to.

**The honest limit:** this only works across tabs of the *same browser on
the same device*, because `localStorage` never leaves that device. It
cannot see, and cannot protect against, a booking happening on a different
browser, a different device, or a different visitor entirely — for that,
you need one shared, server-side source of truth that every visitor's
request goes through. This demo shows you the *pattern* a real backend
would implement (hold → verify-before-commit → release-on-cancel); it does
not, and structurally cannot, provide the actual cross-device guarantee.

### SEO
Restaurant, hotel, event and venue detail pages get a dynamically-set meta
description and schema.org JSON-LD structured data (the markup that
powers rich search results), plus `robots.txt` and `sitemap.xml`. This is
a genuine improvement over having nothing. It is still weaker than a real
site: this is all injected by JavaScript after the page loads, so it only
helps search crawlers that execute JavaScript (Google's does; a
meaningful number of others don't), and every listing lives behind a
`?type=x&id=y` query string rather than its own clean URL
(`/restaurants/basalt-and-vine`) — which hurts both crawlability and
shareability, and is not fixable without either a backend that generates
real routes or a static-site-generation build step.

---

## What a frontend genuinely cannot fix

Naming these plainly, because implying otherwise would be dishonest:

1. **There is no real security boundary.** Every check in this app —
   login, wallet balance, seat availability, form validation — runs in
   the browser the user controls. Anyone can open devtools and call
   `Auth.login()`, `Booking.payFromWallet()`, or `Booking.takeUnits()`
   directly, skip the UI, and do whatever those functions allow. A real
   backend re-checks everything server-side, where the client can't
   interfere; nothing here does that, because nothing here *can*, without
   a server.
2. **No cross-device or cross-visitor data.** Every account, booking,
   wallet balance, and hold lives in one browser's `localStorage`. Open
   this site in a different browser, a different device, or incognito
   mode, and none of it is there. This is the direct consequence of #1 —
   there's no shared source of truth.
3. **No real payment processing.** Covered above; worth repeating so it's
   not missed.
4. **No real email/SMS.** Booking confirmations, notifications and
   reminders all render in-app; nothing is actually sent anywhere.
5. **SEO has a real ceiling.** Covered above.
6. **Tests exist for logic, not for layout or real browser behavior.** See
   "Automated tests" below — `js/data.js`, `js/auth.js`, `js/booking.js`
   and `Validate` are genuinely covered now, run against the real shipped
   source. What's still hand-verification-only: anything visual (does the
   seat map actually render correctly, does the layout hold up on mobile),
   and anything that needs a real DOM click (does the "Reserve table"
   button actually work when a real person taps it). Adding that would
   mean adding a real browser-automation tool as a dependency, which this
   project deliberately hasn't done.

## A note on the Web Crypto password hashing

`crypto.subtle` (used for the SHA-256 hashing) requires a "secure context"
— HTTPS, or `localhost`. If you open `index.html` directly from disk
(`file://...`) in a browser that treats that as insecure, hashing falls
back to a much weaker non-cryptographic hash so login/registration still
work. This is flagged in `js/auth.js` and mentioned here so it isn't a
silent surprise: if you want the real SHA-256 path, serve the folder over
`http://localhost` (e.g. `python3 -m http.server`) rather than opening the
file directly.

---

## Automated tests

`tests/` has 46 tests covering `js/data.js`, `js/auth.js`, `js/booking.js`
and the `Validate` module in `js/app.js`. Run them with:

```
npm test
```
(equivalent to `node --test` — no dependencies, no install step required;
Node's built-in test runner, available since Node 18, is what's running).

These aren't tests of a reimplementation — `tests/support/env.js` loads the
actual `js/*.js` files that ship in this project into a sandboxed
environment (via Node's `vm` module, backed by real `localStorage`,
`sessionStorage`, and Node's real Web Crypto implementation), so a change
that breaks the wallet math or reopens one of the seed-collision bugs
breaks a test, not just a hand-run check in a chat transcript. Notably:

- Every previously-found bug in this project (reviews/showtimes/table
  layouts/seat maps colliding across items) has a regression test that
  fails if the bug comes back.
- The two-tab booking-conflict simulation is tested by literally creating
  two separate sandboxed environments that share one `localStorage` but
  not `sessionStorage` — mirroring how two real browser tabs relate — and
  asserting the hold/take/release/cancel sequence behaves correctly across
  both.
- What these tests do *not* do: touch a real DOM, click a real button, or
  take a screenshot. They test logic, not layout. Visual/responsive
  correctness is still a manual check (see the screenshot rounds earlier
  in this project's history), because writing that as an automated check
  would mean adding a real browser-automation dependency, which is a
  bigger addition than "add tests" implied.

## Build step

```
npm run build
```
(equivalent to `node build.js`, zero dependencies) reads the project as it
stands and writes a second, bundled copy into `dist/`: every page's several
`<link>`/`<script>` tags collapse into one `css/bundle.css` and one
`js/bundle.js`, comments and blank lines stripped. It does not touch
anything outside `dist/` — the plain, unbundled files you're looking at
right now remain the default way to use this project.

Worth being precise about what "minified" means here, since the word gets
oversold: this strips comments and blank lines, nothing more. No variable
renaming, no dead-code elimination — those need an actual JavaScript
parser to do safely, and a hand-rolled zero-dependency script has no
business guessing at that. It's verified to actually work, not just run
without crashing: `dist/js/bundle.js` was loaded fresh and exercised
end-to-end (DB queries, register/login, wallet top-up, a resource hold)
with identical results to the unbundled source. If you want real
minification on top of this, point Terser or esbuild at
`dist/js/bundle.js` — the concatenation work is already done for it.

## If you wanted to make this real

The shortest honest list: a real database (not `localStorage`), a real
auth service with server-side session/password checks, a payment
processor (Stripe et al.), server-side validation duplicating every check
this frontend does, and — for the booking-conflict logic specifically — a
single server endpoint that every visitor's "take this seat" request goes
through, so two different people on two different devices can't both
succeed. Everything in this codebase is written with that seam in mind
(`data.js`, `auth.js`, and `booking.js` are structured so their function
bodies can be swapped for `fetch()` calls without changing any calling
code) — but the seam existing doesn't mean the backend exists. It doesn't,
here, on purpose.
