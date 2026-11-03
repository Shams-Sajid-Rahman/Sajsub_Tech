# Sajsub Tech design system

Tokens live in `frontend/src/index.css` and become Tailwind classes. Shared components live in `frontend/src/components/ui/`. Use these before writing a new style or component.

**Brand:** Sajsub Tech. **Tagline:** Code • Innovate • Grow.

## Colours

| Token | Value | Use |
| --- | --- | --- |
| `primary` | `#0866FF` | Buttons, active states, icons, large text |
| `primary-dark` | `#0550CC` | Hover, and small links on any light background |
| `primary-soft` | `#E7F0FF` | Tinted backgrounds, soft buttons |
| `navy` | `#071A3D` | Headings, body text on white, dark sections |
| `navy-light` | `#0F2A5F` | Hover on dark surfaces |
| `accent` | `#22D3EE` | Decoration, and text on navy only |
| `accent-dark` | `#0E7490` | Cyan text on light backgrounds |
| `page` | `#F4F7FC` | Secondary background |
| `line` | `#E3E9F4` | Borders and dividers |
| `muted` | `#56627A` | Secondary text |
| `faint` | `#66718A` | Captions, struck-through prices |
| `sale` | `#D61F2C` | Discounts, count badges |
| `rating` | `#F59E0B` | Stars only; never for text |
| `success`, `warning`, `danger` | `#15803D`, `#B45309`, `#DC2626` | Status |

White (`#FFFFFF`) is the main background.

### Contrast rules

Measured ratios; small text needs at least 4.5:1.

| Pair | Ratio | Rule |
| --- | --- | --- |
| White on `primary` | 4.82 | Allowed |
| `primary` on white | 4.82 | Allowed |
| `primary` on `page` | 4.49 | Large text only; use `primary-dark` for small text |
| `primary-dark` on white | 6.94 | Allowed |
| `navy` on `page` | 15.98 | Allowed |
| `accent` on white | 2.43 (`#06B6D4` tested) | Never use cyan for text on light backgrounds |
| `accent` on `navy` | 9.49 | Allowed |
| `accent-dark` on white | 5.36 | Allowed |
| White on `sale` | 5.13 | Allowed |

## Typography

Inter, with Noto Sans Bengali for ৳ and Bangla text. Weights: 400 (`font-normal`), 500 (`font-medium`), 600 (`font-semibold`), 700 (`font-bold`).

| Class | Size | Use |
| --- | --- | --- |
| `text-display` | 30–44 px, fluid | Hero headings |
| `text-title` | 24–28 px, fluid | Page titles |
| `text-heading` | 20–22 px, fluid | Section headings |
| `text-subheading` | 17 px | Card and dialog titles |
| `text-base`, `text-sm` | 16, 14 px | Body text |
| `text-xs`, `text-caption` | 12, 11 px | Labels and captions |

## Spacing and layout

- **Base unit:** Tailwind's 4 px scale.
- **Page width:** `container-page` gives 1272 px maximum, with 16 px side gutters below `xl`.
- **Sections:** `py-section` or `mt-section`, 56 px.

| Breakpoint | Starts at | Layout |
| --- | --- | --- |
| Base | 0 | Phone |
| `sm` | 640 px | Large phone |
| `md` | 768 px | Tablet |
| `lg` | 1024 px | Small laptop; the sidebar and full navigation start here |
| `xl` | 1280 px | Desktop |
| `2xl` | 1536 px | Reference design width |

## Shape and depth

| Token | Value | Use |
| --- | --- | --- |
| `rounded-control` | 8 px | Buttons, fields |
| `rounded-card` | 12 px | Cards |
| `rounded-panel` | 16 px | Dialogs, hero |
| `rounded-full` | Full | Pills, badges, icon buttons |
| `shadow-card` | Subtle | Resting cards |
| `shadow-raised` | Medium | Hovered cards, toasts |
| `shadow-overlay` | Strong | Dialogs, menus |
| `shadow-glow` | Blue | Primary button hover |

Ready-made styles: `card` for cards and `input-field` for text fields.

## Motion

Values are in `frontend/src/utils/motion.js`, and the easing is `ease-standard`.

| Duration | Time | Use |
| --- | --- | --- |
| Fast | 150 ms | Hover, press, exits |
| Base | 250 ms | Dialogs, toasts, reveals |
| Slow | 400 ms | Large section changes |

Rules:

- Animate only `opacity` and `transform`, so animation stays smooth on phones.
- No bouncing, and no looping motion except loading indicators.
- Import `m` from `motion/react-m`, not `motion`. `MotionProvider` applies the visitor's reduced-motion setting everywhere.
- Set `behavior: 'smooth'` only after checking `useReducedMotion`, as `BackToTop` does.

## Components in `components/ui/`

| Component | Purpose | Main props |
| --- | --- | --- |
| `Button` | All buttons and button-style links | `variant` (primary, dark, outline, soft, ghost, danger), `size` (sm, md, lg), `to`, `icon`, `loading`, `pill`, `fullWidth` |
| `AnimatedButton` | Actions with visible feedback | `onClick` returns `true` to show `successLabel`; anything else returns to normal |
| `Modal` | Dialogs and bottom sheets on phones | `title`, `onClose`, `size` (md, lg, xl) |
| `ToastNotification` | Rendered by `ToastProvider` | Use `useToast()`: `success`, `error`, `info` |
| `LoadingSkeleton`, `PageSkeleton` | Loading placeholders | `className` |
| `EmptyState` | Nothing to show | `icon`, `title`, `message`, `action`, `compact` |
| `ErrorState` | A request failed | `message`, `onRetry` |
| `ErrorBoundary` | A page crashed or failed to download | `resetKey` |
| `Pagination` | Page controls | `meta`, `onPageChange` |
| `Breadcrumb` | Page location | `items`: `[{ label, to }]` |
| `BackToTop` | Appears after scrolling | None |
| `Drawer` | Slide-in panel, such as the phone menu | `label`, `onClose`; `children` is a function given `close` |
| `Reveal` | Fades a section in when it scrolls into view | `as`, `className` |
| `Countdown` | Time left until a date; hides when it has passed | `endsAt`, `label`, `unitClass` |
| `MotionProvider` | Animation setup, used once in `App.jsx` | None |

## Store components in `components/store/`

| Component | Purpose |
| --- | --- |
| `AnnouncementBar` | Top bar with rotating messages, countdown and close button |
| `Header` | Sticky header, navigation, account menu, live counts, phone menu |
| `SearchBar`, `SearchAutocomplete` | Live suggestions, recent and popular searches, keyboard use |
| `MegaMenu` | Categories, featured categories and top rated products |
| `HeroSlider` | Rotating banner from the Banners admin page |
| `CategoryCard`, `CategoryTiles` | Shop by Category |
| `ProductCard`, `ProductQuickView`, `ProductCarousel` | Product display |
| `StockStatus`, `QuantitySelector`, `WishlistButton` | Shared product controls |
| `HomeSections` | The rows below Featured Products |
| `Footer` | Site footer with the tagline |

`AIChatWidget` replaces `ChatAssistant` in Phase I.

## Homepage rows and real data

Rows never show invented data, and each stays hidden until it has something real to show.

| Row | Appears when | Data |
| --- | --- | --- |
| Promotions | A Promotion banner with an image exists | Banners admin page |
| Flash Deals, New Arrivals, Best Sellers, Top Rated | At least 4 products not already on the page | Products API |
| Best Sellers | Also needs real sales | Confirmed orders only |
| Featured Brands | At least 4 brands have logos | Brands admin page |
| Recently Viewed | The visitor has viewed at least 2 products | This browser only |
| What Customers Say | At least 3 reviews rated 4 or 5 with a comment | Customer reviews |
| Newsletter | Always | Stored in `newsletter_subscribers` |

**Popular searches:** add a public setting named `popular_searches` on the Settings admin page, with a value such as `["Wireless headphones", "Gaming"]`. Nothing shows until it exists.
