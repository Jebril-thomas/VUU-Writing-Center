# VUU Writing Center — Website

A complete, responsive multi-page website for the **Virginia Union University Writing Center**. Built with plain HTML, CSS, and vanilla JavaScript — no frameworks, no build tools, no dependencies. Open any `.html` file in a browser and it works.

---

## 📁 File Structure

```
vuu-writing-center/
│
├── index.html          — Homepage
├── appointments.html   — 4-step booking form
├── submit-draft.html   — Async draft submission
├── resources.html      — Writing guides, MLA/APA reference, downloads
├── about.html          — Mission, history, team, values
├── contact.html        — Contact form, hours, location
├── photo-admin.html    — Site owner photo management tool (not student-facing)
│
├── styles.css          — All styles for every page
├── shared.js           — Navbar, footer, scroll reveal, counters (auto-injected)
│
└── README.md           — This file
```

---

## 🚀 Getting Started

### View locally
Just open any `.html` file in your browser — no server needed.

```bash
open index.html
# or double-click the file in Finder / File Explorer
```

### Deploy to a web host
Upload **all files** to your hosting provider (cPanel, FTP, etc.) into the same folder. Keep the file structure flat — everything in one directory.

Recommended free/low-cost hosts:
- **Netlify** — drag-and-drop the folder at netlify.com/drop
- **GitHub Pages** — push to a repo, enable Pages in Settings
- **Vercel** — connect a GitHub repo or drag-and-drop

---

## 📄 Pages

### `index.html` — Homepage
The main landing page. Sections:
- **Hero** — Headline, two CTA buttons (Book / Submit Draft)
- **Welcome** — About the center, pull quote
- **Services** — 4 service cards (Tutoring, Draft Review, Resources, Workshops)
- **Tutoring Photos** — Photo grid (6 slots — see Photo Admin below)
- **Workshops** — Featured workshop + scrollable workshop list
- **Resources Preview** — Quick-access resource links
- **CTA** — Final call to action

### `appointments.html` — Book an Appointment
A fully interactive 4-step booking form:
1. Choose session format + writing topic
2. Pick date (interactive calendar) + time slot + tutor
3. Enter student info
4. Review + confirm → confirmation screen with reference number

> **To connect to a real backend**, find the `submitBooking()` function and replace the comment block with a `fetch()` call. Three options are documented there: Formspree, a custom API, or EmailJS.

### `submit-draft.html` — Submit a Draft
Upload-style form for async draft review. Students fill out details and attach their paper.

### `resources.html` — Writing Resources
Full resource hub with anchor navigation. Sections:
- **Downloadable Guides** — 6 PDF cards (MLA, APA, Grammar, Revision Checklist, Thesis Builder, Research Planner)
- **MLA Formatting Guide** — Page setup, in-text citations, Works Cited examples
- **APA Quick Reference** — Paper setup, citations, reference list
- **Grammar Mistakes** — 6 common errors with wrong/right examples
- **Essay Structure** — 3-step flow + thesis statement comparison
- **Tutor Tips** — Quick tips from writing consultants

### `about.html` — About
Mission statement, history, values grid, team cards, and a join-the-team section.

### `contact.html` — Contact
Contact form, office hours, address, map placeholder, and FAQ accordion.

### `photo-admin.html` — Photo Manager *(Site Owner Only)*
A private tool for managing all photos on the site. **Do not link to this page publicly.**

---

## 🖼️ Adding & Changing Photos

Open `photo-admin.html` in your browser. This tool lets you:

1. **Upload a photo** from your computer, or **paste a URL** for a hosted image
2. **Edit the caption tag** (e.g. "One-on-One") and description for each slot
3. Click **Generate Code** to get the HTML block
4. **Copy and paste** that block into `index.html`, replacing the content between the `TUTORING PHOTOS` comments

### Photo slots managed by the tool:
| Slot ID | Location | Size |
|---|---|---|
| `hp-main` | Homepage — large feature photo | ~420px tall |
| `hp-stack1` | Homepage — right column, top | ~240px tall |
| `hp-stack2` | Homepage — right column, bottom | ~240px tall |
| `hp-row1` | Homepage — bottom row, photo 1 | 180px tall |
| `hp-row2` | Homepage — bottom row, photo 2 | 180px tall |
| `hp-row3` | Homepage — bottom row, photo 3 | 180px tall |
| `wc-main` | Welcome section feature photo | ~300px tall |

### Recommended image specs:
- **Format:** JPG or WebP (smaller file size)
- **Width:** 800–1200px (the browser scales them down)
- **Aspect ratio:** 4:3 or 3:2 works well for most slots
- **File size:** Under 500KB per image for fast loading

### For hosted images (recommended for live sites):
Upload photos to a service like [Cloudinary](https://cloudinary.com) (free tier), [Imgur](https://imgur.com), or your own server. Copy the direct image URL and use "Link URL" in the Photo Admin tool.

---

## 🎨 Design System

### Colors
| Token | Value | Use |
|---|---|---|
| `--navy` | `#071A35` | Primary brand, navbar, footer |
| `--navy-2` | `#0D2548` | Hover states, dark sections |
| `--gold` | `#C8922A` | Accents, CTAs, highlights |
| `--gold-pale` | `#FBF3E0` | Light gold backgrounds |
| `--gold-faint` | `#FDF8EE` | Hover states on light backgrounds |

### Typography
| Role | Font | Where |
|---|---|---|
| Display headings | Cormorant Garamond (serif) | h1, h2, h3 |
| UI / body | Outfit (sans-serif) | Navigation, labels, paragraphs |
| Body text | Lora (serif) | Long-form paragraph text |

Fonts load via Google Fonts — internet connection required.

### Buttons
```html
<!-- Gold fill (primary CTA) -->
<a href="#" class="btn btn-gold btn-lg">Make an Appointment</a>

<!-- Navy fill -->
<a href="#" class="btn btn-navy">Learn More</a>

<!-- Ghost (on dark backgrounds) -->
<a href="#" class="btn btn-ghost-light">Submit a Draft</a>

<!-- Outline (on light backgrounds) -->
<a href="#" class="btn btn-outline">Learn About Us</a>

<!-- Sizes: btn-sm · btn-lg · btn-xl (default is medium) -->
```

### Scroll Reveal
Add `class="reveal"` to any element to fade it in as the user scrolls:
```html
<div class="reveal">
  This content fades in when scrolled into view.
</div>
```
Sibling `.reveal` elements stagger automatically (80ms apart).

---

## ⚙️ Shared Components (`shared.js`)

The navbar and footer are **automatically injected** on every page by `shared.js`. You do not need to write them in each HTML file.

To update the nav links, tutor list, or footer content, edit `shared.js` — changes apply to all pages instantly.

### What `shared.js` injects:
- **Top bar** — "Virginia Union University · Richmond, VA" strip
- **Sticky navbar** — Logo, desktop nav links, mobile hamburger drawer
- **Footer** — Brand, nav links, services, contact info, hours

### Mobile drawer
On screens under 768px, the navbar switches to a slide-in drawer with:
- All navigation links
- "Make an Appointment" and "Submit a Draft" CTA buttons
- Hours summary
- Focus trap and keyboard (Escape) support

---

## 📱 Responsive Breakpoints

| Breakpoint | What changes |
|---|---|
| `≤ 1280px` | Hero padding adjusts |
| `≤ 1100px` | Hero goes single-column, 4-col grids become 2-col, footer becomes 2-col |
| `≤ 900px` | Welcome/resource grids stack, gallery becomes 2-col, process steps stack |
| `≤ 768px` | Mobile nav drawer, hero stacks, all grids go 1-col, footer stacks |
| `≤ 480px` | Smaller font sizes, gallery goes 1-col, tightest spacing |

---

## 🗓️ Booking Form — Going Live

The booking form in `appointments.html` is fully functional on the frontend. To actually receive bookings, connect it to a backend in the `submitBooking()` function:

### Option A — Formspree (easiest, no backend needed)
1. Create a free account at [formspree.io](https://formspree.io)
2. Create a form and get your form ID
3. In `appointments.html`, replace the comment in `submitBooking()` with:
```javascript
fetch('https://formspree.io/f/YOUR_FORM_ID', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: S.firstName + ' ' + S.lastName,
    email: S.email,
    studentId: S.studentId,
    format: S.format,
    date: S.dateStr,
    time: S.time,
    tutor: S.tutorName,
    topic: S.type,
    course: S.course,
    notes: S.notes,
    ref: ref
  })
});
```

### Option B — EmailJS (sends email directly from browser)
1. Sign up at [emailjs.com](https://www.emailjs.com)
2. Add the EmailJS SDK to `appointments.html`
3. Replace the comment with:
```javascript
emailjs.send('YOUR_SERVICE_ID', 'YOUR_TEMPLATE_ID', { ...S, ref });
```

### Option C — Your own server
Replace the comment with a `fetch()` POST to your own API endpoint.

---

## 📦 Updating Content

### Change tutors
In `appointments.html`, find the `TUTORS` array near the top of the `<script>` block:
```javascript
const TUTORS = [
  { id:'t1', init:'AJ', name:'Amara Johnson', spec:'Humanities, Research Writing', avail:'5 slots open' },
  // Add or edit tutors here
];
```

### Change workshop schedule
In `index.html`, find the `workshops-section` and edit the `.workshop-row` blocks directly.

In `appointments.html`, there is no separate workshop section — workshops link to the homepage.

### Change hours
Hours appear in two places:
1. **Footer** — edit the `HOURS` section in `shared.js`
2. **Contact page** — edit the `.hours-table` in `contact.html`

### Change the office address
Search for `1500 N Lombardy` across all files — it appears in `shared.js` (footer), `contact.html`, and the navbar drawer.

---

## ✅ Checklist Before Going Live

- [ ] Replace all photo placeholders using the Photo Admin tool
- [ ] Connect the booking form to Formspree or your backend
- [ ] Update tutor names and availability in `appointments.html`
- [ ] Verify office hours are correct in `shared.js` and `contact.html`
- [ ] Replace placeholder PDF download links in `resources.html` with real files
- [ ] Update the contact email (`writingcenter@vuu.edu`) if it differs
- [ ] Test on mobile (iOS Safari + Android Chrome)
- [ ] Remove or password-protect `photo-admin.html` on the live server

---

## 🔒 Security Note

`photo-admin.html` has **no login protection** — it relies on obscurity (students won't find it unless you share the link). For a production site, either:
- Remove it from the public server after you've set your photos, or
- Add HTTP Basic Auth via your hosting provider (cPanel → Password Protect Directories)

---

*Built for Virginia Union University Writing Center · Richmond, VA · Est. 1865*
