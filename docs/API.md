# API reference

Base URL in development: `http://localhost:5000/api`

## Response format

Success:

```json
{ "success": true, "data": {}, "meta": {} }
```

`meta` appears on paginated lists, and an optional `message` may also be included.

Error:

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [{ "location": "query", "field": "limit", "message": "Too big" }]
}
```

`errors` only appears on validation failures.

## Status codes

| Code | Meaning |
| --- | --- |
| 200 | Success |
| 201 | Created |
| 400 | Invalid input or malformed JSON |
| 401 | Not logged in, session expired, or wrong credentials |
| 403 | Logged in without permission, or a missing or invalid CSRF token |
| 404 | Route or record not found |
| 409 | Conflict: duplicate value, or the record is linked to other data |
| 413 | Request body over 1 MB |
| 429 | Rate limit exceeded |
| 500 | Unexpected server error. Details are logged, never returned |
| 501 | Route group not implemented yet |
| 503 | Database unavailable |

## Rate limits

Per IP address, per 15 minutes: 300 requests across the API, 10 failed attempts on login and change-password, and 20 requests on register, forgot-password and reset-password. Health checks are exempt. Behind a reverse proxy, set `TRUST_PROXY` to the number of proxies so client IPs are read correctly.

## Pagination

List endpoints accept `page` (default 1) and `limit` (default 20, maximum 100), and return:

```json
{ "page": 1, "limit": 20, "total": 6, "totalPages": 1, "hasNextPage": false, "hasPreviousPage": false }
```

## Authentication

Login sets two HTTP-only cookies: `access_token` (a JWT lasting 15 minutes) and `refresh_token` (single use, rotated by `/auth/refresh`). Sessions end after 7 days for customers and 24 hours for admins, and each request is checked against the session in the database.

### CSRF

Every `POST`, `PATCH`, `PUT` and `DELETE` needs a token. Call `GET /auth/csrf-token`, keep the returned cookie, and send the `csrfToken` value in an `X-CSRF-Token` header. In Postman, enable cookies and add that header.

### Customer endpoints

| Method | Path | Access | Description |
| --- | --- | --- | --- |
| GET | `/auth/csrf-token` | Public | Get a CSRF token |
| POST | `/auth/register` | Public | Body: `email`, `password`, `firstName`, `lastName`, optional `phone`. Always creates a `CUSTOMER`. Unknown fields such as `role` return 400 |
| POST | `/auth/login` | Public | Body: `email`, `password`. Customer accounts only |
| POST | `/auth/refresh` | Refresh cookie | Rotate the refresh token and issue a new access token |
| POST | `/auth/logout` | Public | Revoke the current session and clear cookies |
| POST | `/auth/forgot-password` | Public | Body: `email`. Same response whether or not the account exists |
| POST | `/auth/reset-password` | Public | Body: `token`, `password`. The token works once, lasts 1 hour, and all sessions are signed out |
| GET | `/auth/me` | Logged in | Current user |
| PATCH | `/auth/me` | Logged in | Body: any of `firstName`, `lastName`, `phone` |
| POST | `/auth/change-password` | Logged in | Body: `currentPassword`, `newPassword`. Signs out other devices |

### Admin endpoints

There is no admin registration endpoint. Admins are created by `npm run admin:create`.

| Method | Path | Access | Description |
| --- | --- | --- | --- |
| POST | `/admin/auth/login` | Public | Body: `email`, `password`. Admin accounts only |
| POST | `/admin/auth/logout` | Public | Revoke the current session and clear cookies |
| GET | `/admin/profile` | Admin | Admin profile |
| PATCH | `/admin/profile` | Admin | Body: any of `firstName`, `lastName`, `phone` |
| POST | `/admin/profile/change-password` | Admin | Body: `currentPassword`, `newPassword` |

### Admin management endpoints

All require an admin session: anonymous requests get 401 and customers get 403. Lists accept `page`, `limit`, and `search` where shown. Every change is recorded in the activity log.

| Method | Path | Description |
| --- | --- | --- |
| GET | `/admin/stats` | Dashboard totals, 30 days of daily revenue, orders by status, recent orders |
| GET | `/admin/notifications` | Pending order count, and out-of-stock and low-stock products |
| GET | `/admin/users` | Filters: `search`, `role`, `status` |
| PATCH | `/admin/users/:id/status` | `ACTIVE` or `SUSPENDED`. Customers only. Suspending ends their sessions |
| GET, POST | `/admin/products` | Filters: `search`, `status`, `categoryId`, `brandId`, `stock` (`in`, `low`, `out`) |
| GET, PATCH | `/admin/products/:id` | Stock can't be set here |
| DELETE | `/admin/products/:id` | Archives the product |
| GET, POST | `/admin/categories`, `/admin/brands` | Filters: `search`, `isActive` |
| PATCH | `/admin/categories/:id`, `/admin/brands/:id` | Update |
| DELETE | `/admin/categories/:id`, `/admin/brands/:id` | Archives the record |
| GET | `/admin/inventory` | Stock history. Filters: `productId`, `type` |
| POST | `/admin/inventory/adjust` | Body: `productId`, `quantityChange`, `type` (`RESTOCK` or `ADJUSTMENT`), `note` |
| GET | `/admin/orders` | Filters: `search`, `status`, `paymentStatus`. Rows include `allowedStatuses` |
| GET | `/admin/orders/:id` | Order with items and payments |
| PATCH | `/admin/orders/:id/status` | Only allowed changes, otherwise 409. Cancelling or returning restores stock |
| GET | `/admin/payments` | Filters: `search`, `status`, `method`. Rows include `allowedStatuses` |
| PATCH | `/admin/payments/:id/status` | Records a status and updates the order. Doesn't contact a payment provider |
| GET, POST | `/admin/banners` | Filters: `search`, `placement`, `isActive` |
| PATCH, DELETE | `/admin/banners/:id` | Update or permanently delete |
| GET | `/admin/settings` | Filter: `search` |
| PUT, DELETE | `/admin/settings/:key` | Create, update or permanently delete. Body: `value`, optional `description`, `isPublic` |
| GET | `/admin/logs/activity` | Filters: `search` (action), `entityType` |
| GET | `/admin/logs/logins` | Filters: `search` (email), `success` |

Total revenue counts orders with `paymentStatus = PAID` that aren't cancelled or returned. Partially refunded orders are excluded, because refund amounts aren't stored yet.

## Public endpoints

These are read-only and need no login.

### Health

| Method | Path | Description |
| --- | --- | --- |
| GET | `/health` | API status |
| GET | `/health/db` | Database connectivity. Returns 503 when unavailable |

### Products

| Method | Path | Description |
| --- | --- | --- |
| GET | `/products` | Published products, paginated |
| GET | `/products/:slug` | One published product, with images and specifications |

Query parameters for `GET /products`:

| Parameter | Description |
| --- | --- |
| `page`, `limit` | Pagination |
| `search` | Matches name, short description or brand, ignoring case |
| `category` | Category slug. A parent also includes its subcategories |
| `brand` | Brand slug |
| `featured` | `true` or `false` |
| `minPrice`, `maxPrice` | Filter on the price the customer pays |
| `sort` | `newest` (default), `price_asc`, `price_desc`, `name`, `rating` |

Money values are strings such as `"999.00"`, which avoids rounding errors. `effectivePrice` is the price the customer pays. Exact stock counts stay private, and customers see `inStock` instead.

### Categories

| Method | Path | Description |
| --- | --- | --- |
| GET | `/categories` | Active categories, paginated. Filters: `menu` (sidebar), `featured` (Shop by Category), both `true` or `false` |
| GET | `/categories/:slug` | One active category, with its active subcategories |

### Brands

| Method | Path | Description |
| --- | --- | --- |
| GET | `/brands` | Active brands, paginated |
| GET | `/brands/:slug` | One active brand |

## Planned route groups

These are mounted and return `501` for every request.

`/users`, `/inventory`, `/cart`, `/wishlist`, `/orders`, `/payments`, `/ai`

Create, update and delete endpoints for products, categories and brands are also planned, because they need admin authentication.
