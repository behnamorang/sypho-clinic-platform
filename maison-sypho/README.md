# Maison Sypho — Static marketing & booking prototype

Luxury medical clinic static site with a unified **Sypho Design System** (pure CSS, no Tailwind CDN).

## Files

| File | Purpose |
|------|---------|
| `sypho-design-system.css` | Design tokens (colors, fonts, spacing) and semantic UI classes |
| `js/booking-engine.js` | Multi-step booking wizard (location → treatment → schedule → patient → confirm) |
| `index.html` | Home |
| `book.html` | Online booking (loads booking engine) |
| `services.html` | Treatments catalogue |
| `locations.html` | Brussels locations |
| `practitioners.html` | Team |
| `contact.html` | Contact & enquiry form |

## Preview locally

```bash
cd maison-sypho
python3 -m http.server 8080
# Open http://localhost:8080
```

## Design notes

- No inline `tailwind.config` scripts — all styling via `sypho-design-system.css`
- Responsive from mobile through desktop (sticky header, collapsible nav, fluid grids)
- GDPR consent step in the booking flow

## Integrating with Sypho.io

Serve this folder from `public/maison-sypho/` or deploy as a static subdomain. Wire `booking-engine.js` to Sypho booking APIs when moving from prototype to production.
