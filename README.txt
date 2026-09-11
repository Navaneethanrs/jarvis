JARVIS'26 — WEBSITE
====================

WHAT'S INSIDE
-------------
index.html              Home page — hero + 3D model, countdown, about, roadmap image
tech-events.html        Slot 1 & Slot 2 tech events
non-tech-events.html    Non-tech events
css/style.css           All styling (one file, shared by all 3 pages)
js/hero3d.js            The 3D phone/app model on the home page
js/countdown.js         The live countdown timer
js/register-links.js    <-- EDIT THIS to add your registration links
js/main.js              Menu + scroll animations
assets/roadmap.png      Your roadmap image

HOW TO PREVIEW
--------------
Just double-click index.html to open it in a browser — no install or
server needed. Click through the nav to see all 3 pages.

HOW TO ADD REGISTRATION LINKS
------------------------------
Open js/register-links.js. You'll see a list like:

  const REGISTER_LINKS = {
    GENERAL: "#",
    STARTUP_PITCH: "#",
    DEBUG_THE_CODE: "#",
    ...
  };

Replace the "#" with your Google Form / registration URL for each
event, e.g.:

  STARTUP_PITCH: "https://forms.gle/xxxxxxx",

Save the file — every "Register" button for that event updates
automatically across all pages. Until a link is filled in, the
button shows "Link coming soon" instead of going anywhere broken.

HOW TO CHANGE THE EVENT DATE/TIME
----------------------------------
Open js/countdown.js and edit the line at the top:

  const EVENT_DATE = new Date("2026-09-21T09:00:00");

HOW TO PUBLISH IT ONLINE (free options)
-----------------------------------------
Netlify Drop  — go to https://app.netlify.com/drop and drag this
                whole folder in. You get a live link instantly.
GitHub Pages  — push this folder to a GitHub repo, then enable
                Pages in the repo settings (Settings > Pages).
Vercel        — https://vercel.com/new, import the folder/repo.

NOTES
-----
- The 3D model on the home page is built with Three.js, loaded from
  a CDN (cdnjs.cloudflare.com) via a <script> tag in index.html —
  it needs an internet connection to load, same as the Google Fonts
  used across the site.
- All 3 pages are fully responsive — resize the browser or check on
  a phone to see it adapt.
- Coordinator names/numbers are pulled from what you shared; update
  them directly in the HTML (search for "COORDINATORS" or the
  event-card-foot / coord blocks) if anything changes.
- "Stack & Switch" has no coordinator listed yet — search for
  "To be announced" in tech-events.html and swap in a name/number
  when you have one.
