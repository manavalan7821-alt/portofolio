# Semantic Portfolio Starter

A small multi-page portfolio starter built with semantic HTML5, accessible navigation, responsive CSS, SEO metadata, and a keyboard-friendly contact form.

## Files

- `index.html` — homepage
- `projects.html` — project listing
- `contact.html` — contact form
- `assets/styles.css` — responsive styles and visible keyboard focus
- `assets/main.js` — tiny progressive enhancement

## Run locally

Open `index.html` in a browser, or use VS Code's Live Server extension.

## Before publishing

1. Replace “Your Name” and all placeholder project descriptions.
2. Replace `https://example.com/` canonical URLs with your real public URLs.
3. Replace `hello@example.com` in `contact.html`. The `mailto:` action opens the visitor's email client and is not a server-backed form processor. For a production site, use a secure form endpoint and server-side validation.
4. Add a real Open Graph image if you want rich social previews.
5. Test all pages using keyboard-only navigation, a screen reader, mobile viewport, and Lighthouse.

## Accessibility notes

- Each page has a unique title and description, a single primary `h1`, a skip link, landmarks, and descriptive navigation.
- Form controls have explicit labels, native validation, and help text associated with `aria-describedby`.
- Focus is visible; reduced-motion preferences are respected; color contrast is designed to be strong.

**Important:** Lighthouse scores cannot be guaranteed from source code alone. They depend on the final deployment, URL/canonical correctness, browser conditions, third-party resources, and audit version. Validate the deployed site and fix any findings before claiming a 100 score.
