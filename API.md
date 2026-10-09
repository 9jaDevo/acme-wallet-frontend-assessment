# Mock API

The API is served by this Next.js app under `/api`. It behaves like a real backend: response times vary,
search requests can take longer, and about 3% of requests fail with HTTP 500. Rates never fail at random.

The mock lives in `app/api/**` and `lib/mock/**`. **Treat it as a third-party service: don't change it,
and don't import from `lib/mock` in app code.** If you think the contract is wrong, say so in your PR.

## Conventions

- **Money values are integers in minor units** (kobo for NGN, cents for USD, pesewas for GHS).
  `150050` with currency `NGN` means ₦1,500.50.
- Timestamps are ISO 8601 in UTC.
- Success: `{ "data": ..., "meta"?: ... }` with a 2xx status.
- Error: `{ "error": { "code": string, "message": string } }` with a 4xx/5xx status.
- Currencies: `NGN`, `USD`, `GHS`.

## Testing edge cases

Add `__scenario` to an individual API request to test edge cases. Browser requests can also pick it up
from **the page URL** (for example `http://localhost:3000/transactions?__scenario=error`).

| Value   | Effect                           |
| ------- | -------------------------------- |
| `slow`  | 3 s latency                      |
| `error` | HTTP 500                         |
| `empty` | Empty list (list endpoints only) |

To turn random failures off, create `.env.local` with `MOCK_FAILURE_RATE=0`.

---

## `GET /api/me`

The current user and their wallets.

```json
{
  "data": {
    "id": "usr_7f3k2",
    "firstName": "Amara",
    "lastName": "Test",
    "email": "amara@example.com",
    "avatarUrl": "/avatar.svg",
    "tier": "verified",
    "wallets": [{ "currency": "NGN", "balance": 124583050 }]
  }
}
```

## `GET /api/rates?from=USD&to=NGN`

How many units of `to` you get for 1 unit of `from`. Slower and less predictable (200–2500 ms). Never fails at random; use `__scenario=error` to test failures.

```json
{ "data": { "from": "USD", "to": "NGN", "rate": 1530.25, "updatedAt": "2026-10-08T12:00:00.000Z" } }
```

## `POST /api/convert`

```json
{ "from": "USD", "to": "NGN", "amount": 1999 }
```

`amount` must be a positive **integer in minor units** of `from`. A 1.5% fee is charged on top, in `from`. On
success the wallets are updated and a `conversion` transaction is added to the history; `id` is that
transaction's id.

Errors: `400 INVALID_BODY`, `400 INVALID_CURRENCY`, `400 INVALID_AMOUNT` (including amounts too small to
convert), `422 INSUFFICIENT_FUNDS`.

```json
{
  "data": {
    "id": "txn_cnv1",
    "from": "USD",
    "to": "NGN",
    "amount": 1999,
    "fee": 30,
    "rate": 1530.25,
    "received": 3058969,
    "status": "successful"
  }
}
```

## `GET /api/transactions`

Paginated history, newest first.

| Param      | Type                                  | Default | Notes                                       |
| ---------- | ------------------------------------- | ------- | ------------------------------------------- |
| `page`     | integer ≥ 1                           | 1       |                                             |
| `limit`    | integer 1–100                         | 20      |                                             |
| `type`     | see below                             | –       |                                             |
| `status`   | `successful` \| `pending` \| `failed` | –       |                                             |
| `currency` | `NGN` \| `USD` \| `GHS`               | –       |                                             |
| `q`        | string                                | –       | Searches reference, narration, counterparty |
| `from`     | `YYYY-MM-DD`                          | –       | Inclusive, UTC                              |
| `to`       | `YYYY-MM-DD`                          | –       | Inclusive, UTC                              |

`type` is one of `deposit`, `withdrawal`, `transfer_in`, `transfer_out`, `conversion`, `card_payment`,
`bill_payment`.

```json
{
  "data": [
    {
      "id": "txn_255s",
      "reference": "ACM-48213377",
      "type": "card_payment",
      "status": "successful",
      "currency": "USD",
      "amount": 4599,
      "fee": 0,
      "narration": "Card payment - Netflix",
      "counterparty": null,
      "createdAt": "2026-09-30T14:22:00.000Z"
    }
  ],
  "meta": { "page": 1, "limit": 20, "total": 237, "totalPages": 12 }
}
```

> ⚠️ `narration` comes from upstream providers and is **not sanitised**.

`fee` is charged on top of `amount`, in the transaction's `currency`.

Errors: `400 INVALID_PAGINATION`, `400 INVALID_DATE`.

## `GET /api/transactions/:id`

A single transaction, same shape as above. `404 NOT_FOUND` if it doesn't exist.
