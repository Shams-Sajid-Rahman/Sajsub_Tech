# Sajsub Tech audit report (Phase 11)

Audit date: 3 November 2026. Code audited: the Phase 10 commit `ed5fcb3` plus the Phase 11 fixes.

**Result:** no critical issues remain in the code. All high-priority problems found were fixed. The store is not ready to go live until the items under "Must be done before going live" are finished.

## 1. Testing report

| Test run | Result |
| --- | --- |
| Backend automated tests (`npm test`, real PostgreSQL) | 195 of 195 pass |
| Browser audit (Microsoft Edge engine, real API and database) | 55 of 55 pass |
| Production-mode checks (API started with `NODE_ENV=production`) | 16 of 16 pass |
| Frontend production build | Passes |

Fake services stood in for the payment provider, Gemini and Cloudinary in these runs, so real money, quota and files were never used. The real Gemini service was checked during Phase 10 and was not repeated here. See "Not tested" below.

### Backend

| Area | Tests | Covers |
| --- | --- | --- |
| Registration, login, logout, sessions | 20 | Separate customer and admin logins, forged tokens, password change and reset, rate limits |
| Admin and user management | 16 | Roles, users, products, publishing, audit logs |
| Products, categories, brands, public API | 13 | Listing, filters, validation, standard responses |
| Images | 11 | Admin-only access, file content checks, size and count limits, replacing and deleting |
| Inventory and database rules | 11 | Stock ledger, constraints, indexes |
| Cart, wishlist, checkout | 27 | `cart-checkout` and `store` tests: stock limits, overselling, repeat submissions, changed totals |
| Orders and payments | 33 | Forged callbacks, wrong amounts, expiry, refunds, signature checks |
| AI tools and assistant | 42 | Read-only tools, invented prices, personal details, cut-off answers, Gemini errors, message limits |
| Security audit | 19 | See section 2 |
| Health | 3 | Health endpoint and database status |

The security tests read the real route tables, so any admin route added later is covered automatically.

### Frontend

| Area | Result |
| --- | --- |
| Navigation, homepage, search, filters, product details | Pass |
| Login, registration, contact form | Pass, including error messages |
| Cart, wishlist, checkout (cash and online) | Pass |
| Admin dashboard and every admin page | Pass |
| AI chatbot | Pass |
| JavaScript errors in the browser sessions | None |

### Responsive

| Pages | Widths checked |
| --- | --- |
| Public pages | 360, 390, 768, 820, 1024, 1100, 1280, 1366, 1536, 1920 |
| Customer and admin pages | 390, 820, 1100, 1536 |

The checks cover sideways scrolling and off-screen controls. Homepage screenshots at the main widths were also reviewed by eye.

### Visual comparison with the reference at 1536×1024

Figures are the mean pixel difference from `docs/design/homepage-reference.png`; lower is closer.

| Region | Before | After |
| --- | --- | --- |
| Whole page | 4.4% | 3.8% |
| Top bar | 7.0% | 7.0% |
| Header | 3.6% | 3.0% |
| Sidebar | 6.7% | 5.1% |
| Hero | 3.9% | 3.6% |
| Service strip | 4.9% | 3.7% |
| Category tiles | 4.4% | 6.1% |
| Products | 7.2% | 5.9% |

Category tiles scored worse even though their positions now match the reference. Their images are scaled slightly differently, so pixels no longer line up. By eye, the tiles look right. The remaining differences are listed under known issues.

### Problems found and fixed

| Priority | Problem | Fix |
| --- | --- | --- |
| High | Wishlist and Cart were off-screen at 1024–1271 px, so small-laptop users could not reach the cart | Header layout corrected |
| High | Bangla product, category or brand names produced empty or clashing addresses, so saving failed | Addresses now always unique and valid |
| High | Private responses had no cache rule, so account data could be stored by a browser or proxy | All API responses are `no-store` unless public |
| Medium | A malformed URL returned a 500 server error | Now a 400 with a clear message |
| Medium | Expired sessions and password reset tokens were never removed | Removed by the daily cleanup |
| Medium | The limit of 300 requests per 15 minutes could block many customers sharing one mobile IP | Raised to 1000 |
| Medium | The countdown covered the announcement, and hero text covered the artwork, at 1024–1100 px | Layouts corrected |
| Medium | Failed security test runs left test records in the database, and they appeared in the store | Records removed; test cleanup fixed |
| Low | A cart line could grow past 99 by adding repeatedly | Capped at 99 |
| Low | Missing favicon, faint box behind the logo, misaligned sidebar arrow, stray top bar divider on phones, hard artwork edge on tablets and phones, uneven Add to Cart buttons | All corrected |

## 2. Security report

No critical or high-priority security weakness remains in the code.

| Area | Result | Evidence |
| --- | --- | --- |
| Unauthorized API access | Pass | Every admin and customer route returns 401 without a login |
| Customers on admin routes | Pass | Every admin route returns 403; each login only accepts its own account type |
| Password storage | Pass | bcrypt hashes; hashes never appear in any response |
| Session tokens | Pass | Refresh and reset tokens are stored hashed; sessions are checked in the database on each request |
| Cookie security | Pass | In production, auth cookies are `HttpOnly`, `Secure` and `SameSite=Lax`; the CSRF cookie is `Secure` and `SameSite=Lax` |
| CSRF | Pass | Every state-changing route refuses a missing or wrong token. Payment callbacks are exempt and verified with the provider instead |
| XSS | Pass | A script payload saved in product data never ran in the browser; no `dangerouslySetInnerHTML` or `eval`; script URLs refused |
| Input validation | Pass | Zod schemas; injection text is stored as plain text; query operators ignored; extra fields such as a role are refused |
| Rate limiting | Pass | General, login, account and AI limits return 429 |
| Image uploads | Pass | Admin only; real file bytes checked (JPEG, PNG, WebP); 5 MB and count limits. SVG and renamed files are refused |
| Payment verification | Pass | Orders are marked paid only after the provider's validation API confirms them; forged callbacks and wrong amounts are refused |
| AI tools | Pass | Read-only tools only; no SQL or database access for the model; unverified prices and stock are replaced; personal details are removed |
| Sensitive information | Pass | No secrets in tracked files or the frontend bundle; `.env` files ignored by git; production errors reveal nothing internal |
| Security headers and CORS | Pass | HSTS and content security policy present, no `x-powered-by`; only the store's address is allowed |

### Security items that remain

- **Secrets shown in earlier screenshots:** rotate the Gemini key, JWT and CSRF secrets, admin password and database password before going live.
- **Dependency warnings:** `npm audit` reports 3 high warnings in the backend, through `prisma → @prisma/config → deepmerge-ts`. The fix needs a newer Node version. The frontend has none.
- **Login limit:** it counts by IP only, so there is no per-account lockout. An attacker using many IPs is not slowed down.
- **Frontend security headers:** the API's headers do not cover the frontend's files, so the hosting service must add its own.

This was an application audit by automated tests and code review, not an independent penetration test.

## 3. Known issues

### Must be done before going live

1. Test real payments with SSLCommerz sandbox credentials. So far only a fake provider has been used.
2. Add Cloudinary keys and test a real upload.
3. Configure SMTP. Without it, the contact form and password reset fail in production.
4. Replace the six `DEV-` sample products, and the images and logo cropped from the design, with real ones.
5. Rotate all secrets (see section 2).
6. Set `CLIENT_URL`, `API_PUBLIC_URL`, `TRUST_PROXY` and `NODE_ENV=production`, and serve everything over HTTPS.

### Medium

- Upgrade Node, then Vite and Prisma, to clear the dependency warnings.
- Refunds are records only. The money must still be returned in the SSLCommerz panel.
- One IP can use up much of the free Gemini quota. Check the current limit in AI Studio. The free tier's terms also matter: human review, and not for EEA, UK or Swiss users or under-18s.
- The assistant shows exact stock counts, which you may prefer to hide.
- The assistant's refusal wording is inaccurate in one case, and it shows an extra product card for "under ৳100,000".
- Viewing an order asks the payment provider for updates, limited only by the general rate limit.
- The expiry job can't confirm unpaid online orders if the gateway is later unconfigured.

### Low

- Price sorting runs in memory and search has no trigram index. Both are fine for a small catalog; review them at a few thousand products.
- Admin modals have no focus trap, and nested modals both close on Escape.
- No ESLint configuration exists, so code style is not checked automatically.
- API compression is left to the hosting service or CDN.

### Visual differences left on purpose

- The top bar and service strip use line icons, while the reference uses colored artwork.
- Prices show ৳ instead of the reference's $, so some text widths differ.
- Category tiles have a flatter background than the reference.
- The reference shows a cart count of 2; a real empty cart shows 0.

### Not tested

- Real SSLCommerz, Cloudinary and SMTP services.
- Firefox, Safari and physical phones; only the Edge engine at set window sizes.
- Load testing, or speed on a real hosted server.

## 4. Performance improvement report

| Measure | Before | After |
| --- | --- | --- |
| JavaScript loaded by customers | 820 KB (242 KB compressed) | 328 KB (103 KB compressed) |
| Admin chart code | Loaded by everyone | 395 KB, loaded only on the admin dashboard |
| Storefront images | 1,241 KB | 295 KB |

| Area | Change |
| --- | --- |
| Loading speed | Every page except the homepage loads on demand; the hero image loads first, and others load as needed |
| API calls | Identical requests in progress are shared, so the header and sidebar make one category call. Guests no longer make a refresh call that always failed. The homepage makes 5 calls |
| Caching | Categories, brands and site settings cached for 60 seconds; private data never cached |
| Database | 6 indexes added: `User.createdAt`, `LoginLog.createdAt`, `Order.placedAt`, `Payment.createdAt`, `AuditLog.createdAt`, `AIConversation.updatedAt` |
| Pagination | Reviewed; list endpoints are already paginated |
| React rendering | Route splitting and shared requests. The countdown's updates stay inside its own component. No profiler was run |

Sizes were measured from the production build. Page load times were not measured, because they depend on the final hosting.

## 5. Completed features

**Customer store**
- Homepage matching the design reference, responsive from 360 px to 1920 px
- Search, category and brand pages, filters, sorting, pagination
- Product details with images, stock and reviews
- Registration, login, logout, password reset, profile
- Cart, wishlist, checkout with cash on delivery and SSLCommerz
- Order history and order details
- About, blog and contact pages
- AI shopping assistant using real product data

**Admin panel**
- Separate admin login, with no public admin registration
- Dashboard with charts
- User, product, category and brand management
- Image upload, replacement and deletion
- Inventory with a full stock ledger
- Order and payment management, refund records
- Banners, site settings, login logs and audit logs

**Backend and security**
- REST API with standard responses and central error handling
- PostgreSQL with Prisma migrations
- JWT in HTTP-only cookies, rotating refresh sessions, CSRF protection
- Validation, rate limits, security headers
- Payment verification through the provider, with protection against repeat orders
- Automatic cleanup of expired sessions, reset tokens, old chats and unpaid online orders
- 195 automated backend tests, and documentation in `docs/`
