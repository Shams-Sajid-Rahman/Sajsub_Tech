# Orders and payments

## Choosing a provider

SSLCommerz is the provider used for online payments. One integration covers cards, mobile wallets and internet banking, and it has a public sandbox and developer documentation.

| Provider | Covers | Reported fees | Notes |
| --- | --- | --- | --- |
| **SSLCommerz** (chosen) | Cards, bKash, Nagad, Rocket, internet banking | About 2–2.5%, wallets about 1.85–2.1% | Widely used, sandbox available |
| aamarPay | Cards, wallets | About 1.5–2.75% | Described as SME-friendly. A reasonable alternative |
| shurjoPay | Cards, wallets | No current figure found | Holds a Bangladesh Bank PSO licence |
| bKash direct | bKash only | About 1.85% | Needs its own merchant approval, and covers only one wallet |
| Nagad direct | Nagad only | About 1.15–1.3% | Covers only one wallet |

The fee figures come from comparison sites and conflict with each other, so confirm them with each provider before signing. Adding another provider later means writing one new file with the same functions as [sslcommerz.gateway.js](../backend/src/services/payments/sslcommerz.gateway.js).

## Setting up SSLCommerz

1. Register a free sandbox store at https://developer.sslcommerz.com/registration/.
2. Add the store ID and password to `backend/.env`:

   ```
   SSLCOMMERZ_STORE_ID=
   SSLCOMMERZ_STORE_PASSWORD=
   SSLCOMMERZ_SANDBOX=true
   ```

3. Restart the backend. The store sells in BDT, so SSLCommerz takes payments without conversion.
    "Pay online" becomes available at checkout.

Before going live:

- Set `SSLCOMMERZ_SANDBOX=false` with your live credentials. Only `false` takes real money.
- Set `API_PUBLIC_URL` to the API's public HTTPS address, because the provider's notifications can't reach `localhost`.
- Set `CLIENT_URL` to the storefront's public address.

In local development, notifications can't reach your computer. Payments are still verified when the browser returns, and through "I already paid: check again" on the order page.

## How an online payment works

1. The customer places an order. Its total is calculated on the server, stock is held, and the cart is emptied.
2. The server creates a payment attempt with a unique reference (`transactionRef`) and gets a payment page from SSLCommerz.
3. The customer pays on the SSLCommerz page.
4. SSLCommerz sends the browser back and notifies the server. Neither message is trusted on its own.
5. The server calls the SSLCommerz validation API and compares the reference, amount and currency with the stored payment.
6. Only then is the payment marked `PAID` and the order moved to `CONFIRMED`.

## Payment safety rules

| Rule | How it works |
| --- | --- |
| The browser can't mark a payment paid | Success needs the provider's validation API to agree |
| Wrong amount, currency or reference | Rejected and logged, and the payment stays unpaid |
| Repeated notifications | Handled once, under a lock on the order |
| Late failure notice | Can't undo a verified payment |
| Forged notifications | The signature must match. Failure redirects without one are confirmed with the provider |
| Double click on Pay | Returns the same payment page for 2 minutes |
| Paying twice | Both are recorded, and the second is flagged `needsRefund` |
| Paid after cancellation | Recorded, and flagged `needsRefund` |
| Risky payments | Marked paid but flagged as high risk, and the order waits for an admin to confirm |
| Admins | Can't mark online payments paid, or move an unpaid online order forward |
| Stored data | Card numbers aren't stored. Only the fields listed in the gateway file are kept |

## Unpaid orders

An online order left unpaid for 30 minutes is cancelled automatically, and its stock is released. The check runs every 5 minutes. The provider is asked first, so a paid order whose notification was lost is kept. If the provider can't be reached, the order is left for the next run.

## Order statuses

```
PENDING -> CONFIRMED -> PROCESSING -> SHIPPED -> DELIVERED
   |           |            |                        |
   +-----------+-- CANCELLED                      REFUNDED (through a refund)
                      |
                   REFUNDED (when money collected is returned)
```

Payment status (`PENDING`, `PAID`, `FAILED`, `PARTIALLY_REFUNDED`, `REFUNDED`) is stored separately from order status.

## Cancellation rules

| Who | When |
| --- | --- |
| Customer | While `PENDING` or `CONFIRMED` |
| Admin | While `PENDING`, `CONFIRMED` or `PROCESSING` |

Cancelling restores stock. Unpaid attempts become `FAILED`, and money already collected is flagged `needsRefund`.

## Refund rules

- A refund needs a collected payment, a reason, and an order that is `CANCELLED` or `DELIVERED`. A duplicate payment can be refunded at any time.
- Partial refunds are allowed, up to the amount remaining. A full refund moves the order to `REFUNDED`.
- Refunds are records. **They don't move money.** Issue online refunds in the SSLCommerz merchant panel first, then record them with the reference. SSLCommerz has a refund API, which could be connected later.
- Stock only goes back when the admin says the goods can be sold again.
- Revenue on the dashboard subtracts refunds, and leaves out money waiting to be refunded.
