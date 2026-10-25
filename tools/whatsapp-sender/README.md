# WhatsApp personalized picture sender

Sends **one picture + a short message with the person's name** to every contact in an Excel sheet. Each person gets an individual message (not a group or broadcast list), sent from the WhatsApp Business number **+20 103 004 0179** through the official **WhatsApp Cloud API** by Meta.

> Why the official API: tools that automate WhatsApp Web (scanning a QR code) break WhatsApp's terms and commonly get business numbers **banned** when they bulk-send. The Cloud API is the supported way to do this. The first 1,000 service conversations each month are free; marketing template messages are paid per message (Egypt is low-cost — see Meta's pricing page).

---

## 1. One-time setup on Meta (about 30 minutes)

1. **Create a Meta Business account** at <https://business.facebook.com> if you don't have one.
2. Go to <https://developers.facebook.com/apps> → **Create app** → type **Business** → add the **WhatsApp** product.
3. **Add your number**: WhatsApp → *API Setup* → **Add phone number** → `+20 103 004 0179` and verify it with the SMS/voice code.
   - If this number is used in the **WhatsApp Business app** on your phone, choose the option to **connect your existing WhatsApp Business app** ("coexistence"). Then you keep using the app on your phone *and* the API sends from the same number. If that option isn't offered in your region, the number has to be moved to the API (it then stops working in the phone app). Back up your chats first.
4. Copy the **Phone number ID**. It's a long number shown under your phone number in *API Setup*, not the phone number itself.
5. **Create a permanent token**: Business Settings → *Users → System users* → Add (Admin) → **Generate token** for your app with the `whatsapp_business_messaging` and `whatsapp_business_management` permissions. Copy it (it's shown only once).
6. Add a **payment method** in WhatsApp Manager. Marketing templates won't send without one.

## 2. Create the message template (needed once)

WhatsApp only lets a business start a conversation with an **approved template**. Create it in **WhatsApp Manager → Message templates → Create template**:

| Field | Value |
|---|---|
| Category | **Marketing** (or Utility if it's a transactional notice) |
| Name | `personal_greeting` (lowercase, underscores) |
| Language | Arabic (`ar`) or English (`en`). It must match `WA_TEMPLATE_LANG` |
| Header | **Media → Image** (upload any sample image; the real picture is sent by the script) |
| Body | Must contain exactly one variable `{{1}}`, which becomes the name |
| Footer (optional) | e.g. `للإلغاء أرسل "إيقاف"` |

Example body:

```
أهلاً {{1}} 👋
يسعدنا نشاركك عرضنا الجديد — التفاصيل في الصورة. لأي استفسار رد على الرسالة دي.
```

Submit it. Approval usually takes minutes to a few hours.

## 3. Prepare your files

Put these in this folder (`tools/whatsapp-sender/`):

- **`contacts.xlsx`**: the first sheet, with a header row. Column names are detected automatically (`Name` / `الاسم` and `Phone` / `Mobile` / `الرقم` / `رقم الهاتف` ...). If there are no headers, column A is the name and column B the number. See `contacts.example.xlsx`.
  - Numbers can be in any of these forms: `01012345678`, `1012345678` (Excel dropped the 0), `+20 101 234 5678`, `00201012345678`. Duplicates and invalid numbers are skipped and listed.
- **`image.jpg`**: the picture (JPG or PNG, max 5 MB).
- **`.env`**: copy `.env.example` to `.env` and fill in `WA_TOKEN` and `WA_PHONE_NUMBER_ID`.

## 4. Run it

Requires Node.js 20.12+ (<https://nodejs.org>).

```bash
cd tools/whatsapp-sender
npm install

node send.mjs --dry-run                         # check names/numbers, sends nothing
node send.mjs --to 01030040179 --name "Test"    # send yourself one test message
node send.mjs --limit 20                        # send to the first 20 people
node send.mjs                                   # send to everyone remaining
```

- Every result is written to **`sent-log.csv`** (opens in Excel), with the time, number, name, and `sent`/`failed` plus the reason.
- **Re-running is safe**: people already marked `sent` are skipped, so a re-run only retries failures and new rows.
- Rate limits and temporary errors are retried automatically. Errors that would affect every message (bad token, wrong template) stop the run immediately.

### Session mode (no template)

If your contacts **messaged your number within the last 24 hours**, you can skip the template and send the image with a free caption. Set `MODE=session` and `CAPTION=أهلاً {name} ...` in `.env`. People outside that 24h window will fail with error `131047`.

## Sending limits and keeping the number healthy

- New numbers start at **250 business-initiated conversations per 24h**. Meta raises this automatically (1K → 10K → 100K → unlimited) as you send good-quality messages.
- **Only message people who agreed to hear from you.** If many recipients block or report you, Meta lowers your quality rating and can restrict the number.
- Start with `--limit` batches and keep `DELAY_MS` at 1000ms or more.

## Common errors

| Code | Meaning / fix |
|---|---|
| 190 | Token invalid or expired. Generate a permanent System User token |
| 131030 | App is in test mode. Add the number to allowed recipients or finish setup |
| 132001 | Template name/language not found or not approved yet |
| 132000 / 132012 | Template must have an **Image header** and exactly **one `{{1}}`** in the body |
| 131026 | That number isn't on WhatsApp |
| 131047 | Session mode, but the person hasn't messaged you in 24h. Use template mode |
| 131049 | Meta held back the marketing message to protect user experience. Try again another day |
| 133010 | Number not registered on the Cloud API yet (step 1.3) |
