# Assets — all local, nothing left on Manus

Verified 15 Aug 2026: 98 images across all 8 pages, zero broken, zero requests
to any Manus domain.

`public/media/` — 39 files
- `nav-logo.png`, `hero-logo.png` — the wordmark (same artwork, as Manus served it)
- `about-01.png` … `about-08.jpg` — About page photos
- `shop-white-tee-*`, `shop-black-tee-*` — 6 product photos
- Press logos, film stills, and the rest of the imagery

Note: `shop-black-tee-detail_edd246cf.webp` is a WebP that CloudFront was
serving under a `.png` name. Renamed to its real extension.

## Still external, and fine
- **Vimeo** — film players and thumbnails. Your Vimeo account, not Manus.
- **Google Fonts** — Playfair Display, Plus Jakarta Sans, DM Mono.
- **Instagram** — profile links.

If you ever want the site fully self-contained with no third-party requests at
all, the fonts are the only piece worth doing: download the woff2 files and
serve them from `public/fonts/`.
