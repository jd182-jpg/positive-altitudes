# Positive Altitudes

Website for **Positive Altitudes**, a Milwaukee, WI 501(c)(3) nonprofit that gives kids from underrepresented communities access to downhill skiing — covering rental equipment, winter gear, dinner, and lessons.

Static single-page site (HTML + CSS, no build step). Deployed via GitHub Pages.

## Structure
- `index.html` — the full site (hero, impact, mission, benefits, season highlight videos, gallery, testimonials, press, sponsors, partners, founders, donate, contact)
- `styles.css` — alpine palette (glacier blue + snow + alpenglow ember), light & dark themes, responsive
- `assets/img/` — logo, photos, and sponsor logos

## Notes
- **Season highlight videos** stream directly from the organization's existing Wix media CDN (`video.wixstatic.com`). They support range requests + CORS, so they play inline.
- **Donate** button links to the org's Square page.
- All content and imagery sourced from the original positivealtitudes.org.

## Local preview
```
python3 -m http.server 8000
# open http://localhost:8000
```
