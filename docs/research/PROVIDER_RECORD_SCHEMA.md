# Provider record schema (Agent 2 contract)

Each file `/data/providers/<category>.json` is a JSON array of provider objects.
Every public-facing number MUST carry a `source_id` that exists in `/data/sources.json`
and an `accessed_on` (ISO date). If a value cannot be verified from a primary source,
use `null` and set `confidence: "low"`, and add the gap to `OPEN_QUESTIONS.md`.
NEVER invent a number.

```jsonc
{
  "id": "cardcom",                      // slug, lowercase, hyphens
  "name": { "he": "קארדקום", "en": "Cardcom" },
  "category": "clearing",
  "website": "https://www.cardcom.co.il/",
  "legal_entity": { "he": "…", "en": "…" },   // null if unknown
  "year_founded": 2000,                        // integer or null
  "licenses": ["…"],                           // e.g. clearing licence, payment service licence
  "pricing": {
    "vat_included": false,                     // true/false/null
    "currency": "ILS",
    "pricing_model": "quote_only",             // public_tiers | quote_only | hybrid
    "plans": [
      {
        "id": "basic",
        "name": { "he": "בסיסי", "en": "Basic" },
        "price_monthly": 49,                   // number or null
        "price_annually": 490,                 // number or null
        "billing_cycle": "monthly",            // monthly|annual|one_time|usage
        "promotional": false,
        "limits": { "documents_per_month": 100, "users": 1 },
        "source_id": "src_greeninvoice_pricing",
        "accessed_on": "2026-10-16",
        "confidence": "high"
      }
    ],
    "transaction_fees": {                      // clearing only
      "percent_per_transaction": null,
      "fixed_per_transaction": null,
      "monthly_minimum": null,
      "setup_fee": null,
      "installments_surcharge": null,
      "foreign_card_surcharge": null,
      "refund_fee": null,
      "chargeback_fee": null,
      "settlement_days": null,
      "min_turnover_requirement": null
    },
    "notes_he": "…",
    "source_id": "…",
    "accessed_on": "2026-10-16",
    "confidence": "high"
  },
  "features": {
    "hebrew_support": true,
    "hebrew_ui_quality": "high",               // high|medium|low|null
    "allocation_number_integration": true,      // חשבוניות ישראל
    "api": true,
    "integrations": ["shopify", "woocommerce"],
    "app": { "ios": true, "android": true },
    "notes_he": "…"
  },
  "contract_terms": {
    "commitment": "none",                       // none|monthly|annual
    "cancellation": "monthly",
    "notes_he": "…"
  },
  "support_channels": ["email", "phone", "chat", "whatsapp"],
  "company_facts": { "notes_he": "…" },
  "informational_only": false,                  // true for pension/hishtalmut/insurance
  "last_verified": "2026-10-16",
  "confidence": "high",                          // overall record confidence
  "notes": "English working note: what was verified, what is shaky."
}
```

Rules:
- `pricing.vat_included` must be stated explicitly (many Israeli SaaS pages quote prices
  *before* VAT; state which).
- For clearing, capture the **exact fee formula** or mark `quote_only` and give a
  realistic published range with a source.
- For pension / keren hishtalmut / insurance: `informational_only: true`, management
  fees ONLY from the official government comparison source (גמל נט / פנסיה נט by רשות שוק ההון).
  Do NOT rank by returns.
- Hebrew display strings: store under `name.he` / `notes_he`, preserving the provider's
  own spelling. English keys alongside.
