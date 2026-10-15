# Gaurav Tours And Travels

Static website for Gaurav Tours And Travels, a 24/7 cab and travel service.
Customers can book rides through WhatsApp.

## Project structure

```
├── index.html      Page content and layout
├── styles.css      All styling
├── script.js       Booking form, reviews, WhatsApp links, menu, FAQ
├── _headers        Security headers (Netlify / Cloudflare Pages)
├── logo.jpeg       Logo and favicon
└── Images/         Car photos used in the hero and fleet sections
```

## Run locally

Open `index.html` in a browser. No install or build step is needed.

## Common edits

**WhatsApp number, business name, Google review link:** edit `CONFIG` at the top of `script.js`.
The phone number and email shown on the page are in `index.html`
(search for `8080252353` and `ps5110394@gmail.com`).

**Publishing a customer review:** reviews from the site's form arrive on WhatsApp.
To show one on the site, add it to `FEATURED_REVIEWS` in `script.js`:

```js
const FEATURED_REVIEWS = [
  { name: "Rahul", rating: 5, text: "Great car and smooth trip.", date: "02/10/2026" },
];
```

**Cars and prices:** edit the fleet cards under `<!-- FLEET -->` in `index.html`.
To add a car, copy one `fleet-card` block, put the photo in `Images/`, update the
name, specs and prices, and add the car to the "Vehicle Type" dropdown in the booking form.

**Routes:** edit the cards under `<!-- DESTINATIONS -->` in `index.html`.

## Images

File names are case-sensitive on most hosts: `Images/ertiga.jpg` and `images/Ertiga.jpg`
are different files. Use `.jpg`, `.png` or `.webp`; rename any `.jfif` files to `.jpg`.

## Deploy

Any static host works. Netlify or Cloudflare Pages is recommended because they apply
the security headers in `_headers`. GitHub Pages also works but ignores `_headers`.

## Security rules for future edits

- Never insert user input with `innerHTML`; use `textContent` as `script.js` does.
- Don't add `style="..."` attributes or `<script>` blocks to `index.html`.
  The security policy in `_headers` blocks them. Put styles in `styles.css`
  and code in `script.js`.
- If you add anything loaded from another website (fonts, maps, analytics),
  add that domain to the `Content-Security-Policy` line in `_headers`,
  or the browser will block it.
