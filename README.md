# catalect website

Marketing site for catalect — industrial enzymes, designed from the start.

Static HTML, CSS and vanilla JS. No build step, no dependencies: open `index.html`
in a browser, or serve the folder.

```bash
python3 -m http.server 8000
```

## Pages

| File | What it is |
| --- | --- |
| `index.html` | Home — hero, Our approach (`#approach`), Team (`#team`), CTA band and footer |
| `contact.html` | Contact page with the enquiry form |

## Assets

| Path | Notes |
| --- | --- |
| `assets/css/site.css` | All styling. Design tokens (colours, fonts, spacing) live in `:root` at the top |
| `assets/js/hero.js` | Generative hero artwork — layered contour lines drawn on canvas around the catalytic site. Deterministic: the same figure renders every visit |
| `assets/js/site.js` | Sticky-header state and scroll reveals |
| `assets/img/waves.svg` | Line artwork behind the dark CTA band |
| `assets/img/hero-lines.svg` | Faint contour wash behind the hero |
| `assets/img/favicon.svg` | Tab icon |
| `assets/img/team-*.webp` | Team portraits (800 × 800, shown in a 190 px circle) |

The header and footer markup is duplicated in both pages — edit both when changing navigation.

## Before going live

- **Email address** — the form composes a message to `hello@catalect.bio`; change it in
  the form script in `contact.html` if that is not the right inbox.
- **Contact form** — with no `action` on the `<form>`, submitting composes the message in
  the visitor's own mail client. For a real backend, set `action` (and `method="POST"`) on
  the form in `contact.html` to a hosted handler (Formspree, Netlify Forms, your own API);
  the script then steps aside automatically.
- **Team roles** — both members are listed as "Co-founder" as a placeholder; change the
  role lines in the `#team` section of `index.html` to the actual titles.
- **Fonts** — Figtree is loaded from Google Fonts. Self-host it if you'd rather not depend
  on a third party.

## Deploying

Any static host works. For GitHub Pages: push to `main`, then Settings → Pages → deploy
from branch `main`, folder `/ (root)`.
