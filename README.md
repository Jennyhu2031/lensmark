# Lensmark — Static Prototype

Lensmark is a lightweight, plain JavaScript static prototype focused on exploring landmark photo spots and simple camera guidance. It uses Tailwind CSS via CDN and requires no Node.js, bundler, or build step.

## Quick Start

- Open `index.html` directly in your browser
- Or serve locally:
  - macOS: `open index.html`
  - Any OS: `python3 -m http.server 8000` then visit `http://localhost:8000/`

`index.html` redirects to `pages/welcome.html`. Navigation between pages is handled with simple anchor links.

## Project Structure

```
.
├── index.html
├── pages/
│   ├── welcome.html
│   ├── explore.html
│   ├── detail.html
│   ├── gallery.html
│   └── camera.html
├── js/
│   ├── welcome.js
│   ├── explore.js
│   ├── detail.js
│   ├── gallery.js
│   └── camera.js
├── metadata.json
├── .gitignore
└── README.md
```

## Navigation Flow

- `index.html` → redirects to `pages/welcome.html`
- `pages/welcome.html` → “Get Started” → `pages/explore.html`
- `pages/explore.html` → item → `pages/detail.html`
- `pages/detail.html` → tabs: Tips (current), Gallery (`pages/gallery.html`), Info (stub)
- `pages/gallery.html` → static gallery grid and link to camera
- `pages/camera.html` → simple mode toggle (Photo, Video, Portrait)

All page-to-page links are relative within the `pages/` folder, and each page includes its corresponding script from `../js/...`.

## Technologies

- Tailwind CSS via CDN with inline `tailwind.config` setup
- Google Fonts (Plus Jakarta Sans) via CDN
- Material Symbols (Outlined) via CDN
- Plain JavaScript modules per page
- No environment variables, server-side code, or build tooling

## Deployment

Deploy on GitHub Pages:
- In your repository, go to Settings → Pages
- Select Source: `main` and Folder: `root`
- Save and wait for the site to build

Notes:
- `index.html` lives at the root and redirects to `pages/welcome.html`
- All assets are CDN-hosted, so no additional setup is required

## Editing and Customization

- Tailwind theme: Each page defines `tailwind.config` inside a `<script>` block. Update colors, fonts, or radii there to keep styles consistent.
- Icons: Material Symbols are used; switch the icon names inside `<span class="material-symbols-outlined">...</span>`.
- Images: Backgrounds and gallery items reference public CDN URLs; replace with your own assets as needed.

## License

Unlicensed prototype intended for demonstration and exploration purposes.
