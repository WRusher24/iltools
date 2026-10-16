# ON-PAGE RULES — IL-Tools (Agent 5)

**Consumer:** Agent 6 (rendering) + editorial. **Applied to:** the frontmatter of all 127 route files (titles, descriptions, canonical, OG, robots, schema) — verified ≤ limits.

---

## 1. Title

**Formula per page type** (stored in frontmatter `title`, without the brand suffix):

| Page type | Formula | Example |
|---|---|---|
| compare | `<brandA> או <brandB>: <benefit/question>` | `חשבונית ירוקה או מורנינג: מה ההבדל…` |
| best | `<category> הכי מתאים ל<segment>: <criterion>` | `סליקה לעסק קטן: איך בוחרים…` |
| category | `<category> — השוואה ומדריך בחירה` | `תוכנות חשבוניות בישראל — השוואה…` |
| review | `<brand> (<English>): סקירה ומחירים` | `iCount: סקירה, מסלולים ומחירים` |
| guide | `<imperative how-to>` | `פתיחת תיק עוסק פטור — מדריך…` |
| article | `<topic>: <angle>` | `מדרגות מס הכנסה 2026: איך הן עובדות` |
| calculator | `מחשבון <thing>: <outcome>` | `מחשבון נטו לעצמאי: …` |

- **Hard limit: `title` ≤ 60 chars.** Verified clean for every file.
- **Brand suffix ` | IL-Tools`** is appended by the template **only when it keeps the rendered `<title>` ≤ 60 chars**; otherwise the title renders brand-less (Google truncates anyway). `og:title` always uses `title + " | IL-Tools"` (no truncation concern on OG).
- Primary keyword appears **early** and **exactly once naturally**; no repetition, no stuffing.

## 2. Meta description

- **Hard limit: ≤ 155 chars.** Verified clean for every file.
- Contains a benefit or an explicit scope, and a soft next step where natural ("…ואיך משווים מול…"). No clickbait, no guarantees.
- One description per page; **duplicates are a lint failure**.

## 3. Headings & structure

- **Exactly one `<h1>`** per page (rendered from `h1`, which mirrors `title` intent). Lint fails on 0 or >1 H1.
- H2/H3 hierarchy is logical; every content piece opens with a **`תשובה קצרה`** answer box (40–60 words) — the featured-snippet / AI-answer target.
- Guides are numbered step-by-step; articles have an H2 every 150–250 words.

## 4. Answer box, tables, FAQ, alt text

- **`תשובה קצרה`**: a 40–60 word direct answer immediately after the H1. Every page template that has one must render it in a `<div class="answer-box">` and it is the source for the FAQ/snippet markup where applicable.
- **Tables:** comparison tables use real `<table>` markup with a `<caption>` and `<th scope="col">/`<th scope="row">`, horizontally scrollable on mobile with a sticky first column (right edge in RTL). Never an image of a table.
- **FAQ:** 5–8 Q&A on compare/best, 6 on calculators, 3–5 on articles. Rendering them enables `FAQPage` markup.
- **Image alt text (Hebrew):** descriptive, ≤ 125 chars, describes the image, no "תמונה של". Decorative images get `alt=""`. Charts get an alt describing the data.

## 5. Metadata head

| Tag | Value |
|---|---|
| `<html>` | `lang="he"` `dir="rtl"` |
| `<meta charset>` | `utf-8` |
| `<title>` | title (+ brand suffix per §1) |
| `<meta name="description">` | description (≤ 155) |
| `<link rel="canonical">` | absolute `https://il-tools.co.il{canonical}` |
| `<meta name="robots">` | `index, follow` (from frontmatter `robots`); `noindex` for deferred/facet/calc-state |
| OG | `og:title` (`title + " | IL-Tools"`), `og:description`, `og:type` (article on editorial, else website), `og:locale`=`he_IL`, `og:image`, `og:url` |
| Twitter | `twitter:card`=`summary_large_image`, `twitter:title`, `twitter:description`, `twitter:image` |
| hreflang | `he-IL` self-reference; **`x-default` only if an English version exists** (currently none → omit) |

**Dynamic OG images** (`/api/og?type=…&slug=…`): generated for every page and, critically, for **calculator results** — the result value rendered in the image. The OG generator **must embed a Hebrew-capable font (Heebo subset) and set RTL direction** so the Hebrew text shapes correctly; verify no reversed/broken glyphs before launch.

## 6. Frontmatter contract (all route files)

Required keys (all present and validated): `title`, `description`, `slug`, `type`, `category`, `primary_keyword`, `secondary_keywords[]`, `search_intent`, `related[]`, `sources[]`, `updated`, `author`, `monetization_slots[]`, `regulated`, `word_count`, `reading_time`, `canonical`, plus the Agent-5 additions `og_title`, `og_description`, `og_type`, `og_image`, `schema_types[]`, `robots`.
- `related[]` slugs are validated against the canonical slug set (lint).
- `author` is always `il-tools-editorial` (team persona). **No `reviewer_role`** — no credentialed reviewer exists yet.

## 7. What was changed / what was NOT changed

- **Changed:** category `canonical` prefix (`/categories/` → `/category/`); broken `{{link:}}` targets fixed (`clearing-fees-calculator` → `clearing-fees`, `invoicing-cost-calculator` → `invoicing-cost`, in body and `related:`); added OG/robots/schema frontmatter.
- **NOT changed:** body meaning; all `{{slot:*}}`, `{{aff:…}}`, `{{sponsored:…}}`, `{{chart:…}}`, `{{calc:…}}`, `{{sources:[…]}}`, `{{updated:…}}` tokens; `<!-- DISC-PENSION -->` and `<!-- LEGAL-REVIEW: … -->` markers. Zero tokens were removed.

## 8. Lint enforcement

`scripts/seo-lint.mjs` checks: title length, description length, exactly one H1, canonical presence, duplicate titles/descriptions, `{{link:}}` targets against the canonical slug set, orphan pages, and schema JSON validity. Exits non-zero on failure.
