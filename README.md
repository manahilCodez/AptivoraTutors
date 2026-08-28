# Aptivora Academy — Website

A responsive, single-page marketing website for **Aptivora Academy**, a one-to-one online tutoring academy offering ACCA, IELTS, O/A Levels, Foundation Years (KG–Grade 8), University subjects, and short skill-based add-on courses.

Built with plain **HTML, CSS, and JavaScript** — no framework, no build step, no dependencies to install. Just open `index.html` in a browser or deploy the three files as-is.

## ✨ Features

- **Light / dark theme toggle** with saved preference (persists across visits via `localStorage`)
- **Animated hero section** with a live-class card, progress ring, and rating badge
- **Full course catalog** — Foundation Years, ACCA, IELTS, O/A Levels, and University subjects
- **Skill Courses section** — short add-on courses (Business, Finance, AI Chatbots, English, MS Office, Programming, QuickBooks, IELTS, Summer/Weekend batches)
- **Admin panel** (passcode-protected) to add or remove skill courses directly from the browser, no code changes needed for quick edits
- **Entry popup** promoting free tutor matching, with a direct WhatsApp CTA
- **Tutor profiles, student results, testimonials, FAQ accordion, and a demo-request form**
- Fully responsive — tested down to mobile widths
- Accessible markup (skip link, ARIA attributes, keyboard-friendly menus and popup)

## 🛠 Tech Stack

- HTML5
- CSS3 (custom properties for theming, no frameworks)
- Vanilla JavaScript (ES5-friendly, no build tools)
- [Google Fonts](https://fonts.google.com/): Playfair Display + Poppins

## 📁 File Structure

```
├── index.html   # Markup and content for all sections
├── style.css    # Theming, layout, and responsive styles
└── script.js    # Theme toggle, popup, FAQ accordion, admin panel, form handling
```

Just three files — no `node_modules`, no build pipeline.

## 🚀 Getting Started

Clone the repo and open `index.html` directly in a browser:

```bash
git clone https://github.com/<your-username>/<your-repo>.git
cd <your-repo>
open index.html   # or just double-click the file
```

### Deploying

Since it's a static site, you can host it anywhere for free:

- **GitHub Pages**: Settings → Pages → deploy from the `main` branch (root)
- **Netlify / Vercel**: drag-and-drop the three files or connect the repo
- Any static host / web server — just upload the files as-is

## ⚙️ Customization

A few things you'll likely want to personalize before going live, all inside `script.js` and `index.html`:

| What | Where |
|---|---|
| WhatsApp / phone number | Search for `923079483445` in `index.html` (footer, floating button, popup CTA) |
| Skill courses list (default set) | `defaultCustomCourses` array near the top of `script.js` |
| Admin panel passcode | `ADMIN_PASSCODE` constant in `script.js` |
| Colors, fonts | CSS custom properties at the top of `style.css` (`:root`, `[data-theme="dark"]`, `[data-theme="light"]`) |

> **Note:** Additions/removals made through the on-page admin panel are saved to the visitor's own browser (`localStorage`) only — they don't sync to other visitors. To change the course list site-wide, edit `defaultCustomCourses` in `script.js` and redeploy.

## 📄 License

No license specified — add one (e.g. MIT) if you plan to make this repo public and want to define reuse terms.
