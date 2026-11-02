# AI shopping assistant

A chat assistant that answers questions about products, using Google's Gemini API with function calling, on its free tier.

## Setting it up

1. Open https://aistudio.google.com and sign in with a Google account aged 18 or over.
2. Create an API key. Don't turn on billing for that project, so it can never charge you.
3. Add the key to `backend/.env`:

   ```
   GEMINI_API_KEY=
   ```

4. Restart the backend. The chat button then works. Without a key, it says the assistant isn't available.

`AI_MODEL` selects the model, and defaults to `gemini-3.5-flash-lite`, which is fast and on the free tier. Models with a free tier are listed at https://aistudio.google.com/docs/pricing.

Limits are per model. `gemini-3.8-flash` reported only 5 requests a minute and 20 a day on the free tier during testing, which is about 7 to 10 customer questions a day, so it isn't the default. See your own limits in AI Studio under Rate limits.

## Before relying on the free tier

These come from Google's terms and pricing pages at the time of writing. Check them yourself before launch.

| Topic | What it means for the store |
| --- | --- |
| **Cost** | Free of charge on models marked free, with billing off |
| **Limits** | Google publishes these per account, in AI Studio under Rate limits, not as fixed numbers. Each customer message usually uses two or three requests. When the limit runs out, customers see "very busy" until it resets |
| **Your data** | Google may use free-tier chats to improve its products, and human reviewers may read them, after they're disconnected from your account |
| **Personal information** | Google says not to submit it. See below for how the store handles this |
| **Countries** | Free use isn't allowed for apps available to users in the EEA, Switzerland or the UK. Bangladesh is on Google's supported list |
| **Age** | The API may not be used in apps aimed at, or likely to be used by, people under 18 |
| **Purpose** | The terms describe the API as being for developers building for professional or business purposes |

For a large public launch, read the terms in full and consider Gemini's paid tier, which has different data terms. Switching needs only billing turned on for the project, with no code changes.

## How personal details are protected

[redact.js](../backend/src/services/ai/redact.js) removes emails and any number of ten or more digits (phone, card and ID numbers) before a message is sent or saved. The chat also tells customers not to share personal details, and the customer's name and account are never sent. The filter can't recognize everything, such as a home address typed into a message.

## How it answers

```
Customer -> POST /api/ai/messages -> personal details removed -> Gemini
                                      | asks for a tool
                                      v
                     Argument check -> Read-only tool -> PostgreSQL
                                      | result returns to Gemini
                                      v
                     Answer check -> Reply and product cards -> Customer
```

The model never touches the database. It can only ask for one of the nine tools in [tools.js](../backend/src/services/ai/tools.js), and those call the same services as the storefront, so drafts and archived products stay hidden.

| Tool | Answers |
| --- | --- |
| `searchProducts` | Word search, and products on sale |
| `getProductDetails` | One product in full |
| `getProductPrice` | Price and discount |
| `checkProductAvailability` | In stock or not |
| `getStockQuantity` | Units remaining |
| `getProductsByCategory` | Products in a category and its subcategories |
| `filterProductsByPrice` | Products in a price range |
| `compareProducts` | Two to four products side by side |
| `recommendProducts` | In-stock candidates ranked by rating |

## Safety rules

| Rule | How it works |
| --- | --- |
| Never invent prices or stock | [answerGuard.js](../backend/src/services/ai/answerGuard.js) checks every reply. A price or stock count no tool returned in this turn causes the reply to be replaced with the real product data |
| Never invent availability | A claim such as "in stock" needs an availability lookup in this turn |
| No old facts | Past turns are sent as text only and don't count as checked. Reopened chats show current prices |
| No SQL | The tools take validated values, never queries |
| No changes | Every tool only reads. A test confirms that the catalog and stock history don't change |
| No credentials | The model receives the prompt, the tools, the chat and product data. It gets no customer details, keys or database access |
| Validated arguments | Each tool's arguments are checked, and errors go back to the model |
| Limits | 30 messages per 15 minutes per visitor, 1,000 characters per message, 5 tool rounds per answer |
| API failures | The customer sees a plain message and can retry. Details go only to the server log, and nothing is saved |
| Cut-off or blocked answers | They aren't shown. The customer gets a safe message, with any real product data found |

The answer check recognizes prices written with ৳, Tk, BDT, taka, টাকা, $ or USD, and Bengali digits. It checks numbers, so it can't catch a wrong claim with no number in it, such as an invented specification. The prompt forbids that, and the chat tells customers to check the product page.

## Conversation history

- Logged-in customers own their chats through their account. Guests own theirs through a private cookie, stored only as a hash.
- Messages and the tools used are stored, with personal details removed. Chats unused for 90 days are deleted automatically, and "Start a new chat" deletes the current one.
- Nothing is stored at Google for later requests by this app (`store: false`), although the free-tier terms above still apply to what is sent.
- A guest's chat doesn't move to their account when they log in.
- Mention in your privacy policy that chat messages are sent to Google.

## Exact stock counts

The assistant can tell customers exactly how many units remain, as the requirements ask, while the website itself only shows "in stock". Competitors could read this too. To hide it, remove `getStockQuantity` from `tools.js`.
