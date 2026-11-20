# Personal website

A two-page personal site: a scrolling main page (Home → About → Rover → Travels) and a "Lately" page (coming next).
Plain HTML, CSS and JavaScript, with GSAP for motion. No build step: open `index.html` through any static web server.

## Where things live
- `index.html` – the main page
- `js/content.js` – **all editable text, links and travel photos** (change things here)
- `js/scroll.js` – builds the page from `content.js` and runs the scroll animations
- `js/maverick.js` – Maverick the Great Pyrenees (poses, walking legs, hide toggle)
- `js/map.js` + `data/world.svg` – the Travels map (Natural Earth data, public domain)
- `css/style.css` – colors, fonts and layout
- `images/` – photos (location data removed) and Maverick's artwork
- `preview.html` – the style preview used during design (not linked from the site)
- `tools/` – one-off scripts used to cut Maverick's walking legs and build the map file
