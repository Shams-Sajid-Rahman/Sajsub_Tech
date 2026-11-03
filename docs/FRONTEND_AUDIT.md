# Frontend audit (premium redesign, Phase A)

Audit date: 3 November 2026, starting from commit `bb28e81`.

## Summary

The frontend's foundations are sound and are being kept: routing, authentication, API access and shared store state all work, and no backend rebuild is needed. The weakness is presentation. The site was static, styles were scattered, and shared parts lived in the wrong place.

## Current structure

| Area | Finding | Decision |
| --- | --- | --- |
| Stack | React 19, Vite 6, Tailwind 4, React Router 7, Recharts, Lucide | Keep; Motion added for animation |
| Routing | 18 public and 13 admin pages, loaded on demand | Keep |
| Authentication | Cookie sessions through `AuthContext`, protected routes | Keep unchanged |
| API access | `services/api.js` handles CSRF, session refresh and shared requests | Keep unchanged |
| Store state | `StoreContext` holds site content, cart and wishlist | Keep; add return values for Phase B button feedback |
| Forms | `useForm`, `FormField`, `FormMessage`, `SubmitButton` | Keep; restyled |

## Problems found

| Priority | Problem | Status |
| --- | --- | --- |
| High | One failed page download or page crash blanked the whole site | Fixed in Phase A |
| High | No visible keyboard focus style in any component | Fixed in Phase A |
| High | Modal: no focus trap, Escape closed every open dialog, and focus could jump while a form was in use | Fixed in Phase A |
| Medium | The header could disappear while a page loaded | Fixed in Phase A |
| Medium | 26 hard-coded colours, some nearly identical | Common ones replaced; 28 uses remain in 6 files for Phases B and H |
| Medium | Shared parts were in `components/admin/` although the store uses them | Moved to `components/ui/` |
| Medium | Phone text fields under 16px make iPhones zoom the page | Fixed in Phase A for fields using `FormField` |
| Medium | Brand blue is 4.49:1 on the page background, under the 4.5:1 guideline for small text | `primary-dark` added for small text |
| Medium | Struck-through prices were 3.62:1 on white | `faint` colour added |
| Medium | Images are low resolution and have no responsive sizes (no `srcset` anywhere) | Needs real image files |
| Low | No page description or theme colour | Fixed in Phase A |

## Image quality

Every storefront image is a crop of the design reference screenshot, not an original photo.

| Image | Size in pixels |
| --- | --- |
| Hero | 613×321 |
| Category tiles | 220–328 wide, 200 high |
| Products | 160–304 wide, 148–200 high |
| Logo | 328×108 |

These work at the small sizes in the reference. They will look soft in quick view, on product detail pages and on high-resolution screens. Meeting the "high-quality images" requirement needs real product photos and an original logo file.

## Static or unfinished sections

| Section | Today | Phase |
| --- | --- | --- |
| Top bar | Done: messages rotate when there are more than fit | B |
| Header | Done: sticky, with a shadow after scrolling | B |
| Search | Done: live suggestions and keyboard use | B |
| Categories menu | Done: mega menu | B |
| Hero | Done: previous and next controls, pauses on hover | B |
| Product cards | Done: quick view, stock status, animations | B |
| Page sections | Done on the homepage and About page | B |
| Filters on phones | Done: filter drawer | D |
| Product gallery | Done: zoom, thumbnails, tabs, Buy Now | E |
| Order tracking | Animated timeline inside order details; no separate page | G |
| Admin sidebar | Done: collapsible, and it remembers the choice | H |
| About | Done: redesigned | B |
| Blog | Empty state only; the backend has no articles | Decision needed |

## What the backend can already supply

| Requested feature | Available today | Gap |
| --- | --- | --- |
| Live search suggestions | `GET /products?search=` and `GET /categories` | None |
| New Arrivals | `sort=newest` | None |
| Flash Deals | `onSale=true`, plus the promotion end date | None |
| Featured Brands | `GET /brands` | Brands need logos |
| Recently Viewed, recent searches | Can be kept in the browser | None |
| Recommended Products | `GET /products/:slug/related` on product pages | No personal recommendations |
| Top rated | `sort=rating` | None |
| Rating filter | Ratings exist, but not as a filter | Done: `minRating` |
| Best Sellers | `GET /products/best-sellers` | Empty until there are confirmed orders |
| Customer Reviews on the homepage | `GET /reviews` | Empty until there are reviews |
| Newsletter | `POST /newsletter` | Stores addresses only; no email is sent yet, and there is no admin page for the list |
| Trending | No view history | Replaced by Top Rated |
| Popular searches | The `popular_searches` admin setting | Hidden until set |

## Responsive status

The 57-check browser audit covers public pages at 360, 390, 430, 768, 820, 1024, 1100, 1280, 1366, 1536 and 1920 px, with no sideways scrolling or off-screen controls. Layouts are usable, but tablet and phone were adapted from desktop rather than designed for those sizes. Phases B to J address this.
