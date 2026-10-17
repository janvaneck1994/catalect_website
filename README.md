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

- **Contact form** — posts to [FormSubmit](https://formsubmit.co), which relays it to
  `jan@catalect.bio`. GitHub Pages serves static files only, so the form needs a handler
  like this one; no account is required.

  **Activate it once**: submit the form on the live site, then open the confirmation email
  FormSubmit sends to `jan@catalect.bio` and click the link. Submissions arrive from then on.

  Two things worth doing afterwards:

  - The address sits in the form's `action`, where scrapers can read it. After activating,
    FormSubmit gives you a random endpoint (`https://formsubmit.co/<hash>`) that hides it —
    swap it into `contact.html`.
  - To move to another handler (Formspree, your own API), change that one `action`; the
    hidden `_subject` / `_next` / `_honey` fields are FormSubmit's and can go with it.
- **Team roles** — both members are listed as "Co-founder" as a placeholder; change the
  role lines in the `#team` section of `index.html` to the actual titles.
- **Fonts** — Figtree is loaded from Google Fonts. Self-host it if you'd rather not depend
  on a third party.

## Deploying

Any static host works. For GitHub Pages: push to `main`, then Settings → Pages → deploy
from branch `main`, folder `/ (root)`.
