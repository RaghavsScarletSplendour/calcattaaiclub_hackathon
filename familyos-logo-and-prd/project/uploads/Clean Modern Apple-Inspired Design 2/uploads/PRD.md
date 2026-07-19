# Family OS — Hackathon PRD (final, v2)

> 3-hour hackathon MVP. Stack: Next.js + Supabase + **OpenAI API**.
> This doc is the spec for Claude Code / your IDE. Read §4 (scope), §7 (schema), §9 (extraction) before coding.

---

## 0. What changed from v1
- Renamed **Home Vault → Family OS**.
- Switched Claude API → **OpenAI API** (Responses API + Structured Outputs).
- Folded in all three members' modules; overlaps resolved (see §2).
- **People became a first-class entity** (Member 3's "family COO" idea) — this is the biggest structural change.
- **Schema correction:** reminders no longer *require* an asset (a passport expiry or insurance renewal hangs off a person/document, not an appliance). See §7.

---

## 1. Product in one sentence
Family OS is a **COO for your household**: upload any document or asset, it files itself and creates the action, and the home screen shows what matters most — and for whom.

---

## 2. The unifying concept (this is how the overlaps resolve)
Everything is **one linked graph**:

`People ↔ Assets ↔ Documents ↔ Contacts ↔ Expenses ↔ Reminders`

- The **"COO"** is the layer that reads the graph and surfaces prioritized actions ("relevant on top"). It's not a table — it's a computed feed + an OpenAI summary.
- **Vehicle management** appeared in Member 1 and Member 2 → one **Assets** module.
- **Health / identity docs** (Member 3) = **documents linked to a person**, plus per-person facts.
- **"Link AC + maintenance"** (Member 3) = **expenses with an asset FK**.
- **POCs** (Member 2) = **contacts linked to assets/people**.

---

## 3. Module map (every idea, tagged)

| Module | Owner | What | Tier |
|---|---|---|---|
| COO action feed (home) | Core + M3 | Prioritized actions, relevant on top, per-person filter | **P0** |
| Document upload + AI read + auto-deadline | M2 + Core | Snap → extract → file → create reminder | **P0** |
| Assets (appliances + vehicles) | M1 | Unified asset registry | **P0** |
| People + per-person view | M3 | Health/allergies/insurance/identity segregated per member | **P0** |
| Reminders | Core | Due-date engine feeding the action feed | **P0** |
| Contacts / POC | M2 | Doctor, plumber, workshop, cleaner — linked to assets/people | P1 |
| Expense linking | M3 | AC + its ₹ maintenance, linked | P1 |
| COO AI summary | M3 | "Here's your household this week" | P1 |
| Subscriptions, food, small expenses, staff salaries | M1 | — | V2 |
| Deep health records, full relationship graph | M3 | — | V2 |

---

## 4. Hackathon scope (what to actually build in 3h)

**Spine (interlocks, demo-winning) — build these:**
- Document upload + OpenAI extraction + auto-deadline
- People + per-person profile view
- COO action feed (reminders, relevant on top)
- Assets (created mostly *via* extraction, plus a grid)

**Add if on track:** Contacts, Expense-linking, COO AI summary.

**Explicitly OUT:** everything V2, real WhatsApp/Meta, RC/VAHAN API, real notification delivery, auth + RLS.

**If behind at 1:45** → cut Assets-as-separate-CRUD and Expenses. Extraction already creates assets; keep the spine to **Documents + People + COO feed**. A tight 3-module demo beats a broken 6.

---

## 5. Team split (parallelize — agree §7 schema first)
- **Member 1:** assets schema + seed data + asset grid/detail.
- **Member 2:** upload flow + OpenAI extraction pipeline + contacts.
- **Member 3:** people + per-person profile + COO action feed + expense linking.
- **Shared:** one Supabase project, schema from §7 locked before anyone writes queries.

---

## 6. Hero flow (the ~90-second demo)
1. COO home is full of a real-looking household; top card glows: **"Ma's health insurance renews in 12 days."**
2. Upload a health-insurance policy PDF → "Reading document…" → it auto-files **under the right person**, tags `insurance`, extracts the renewal date → the action jumps to the top of the feed.
3. Open **Ma's profile** → allergies + insurance + identity docs, all segregated in one place.
4. Upload a **Voltas AC invoice** → asset created, warranty reminder auto-added.
5. Link a **₹8,000 service expense** to that AC → asset detail shows purchase + running maintenance cost.
6. Point at the COO summary: "Family OS already knows what's next."

---

## 7. Data model (final schema — the hand-off)

**people**
| col | type | notes |
|---|---|---|
| id | uuid PK | |
| name | text | |
| initial | text | avatar chip |
| color | text | avatar color |
| dob | date | nullable |
| role | text | e.g. "parent", "staff" — nullable |

**person_facts** — flexible per-person health/insurance (avoids over-modelling)
| col | type | notes |
|---|---|---|
| id | uuid PK | |
| person_id | uuid FK → people | |
| kind | enum | `allergy \| condition \| blood_group \| insurance \| note` |
| value | text | |
| document_id | uuid FK → documents | nullable — links the proof |

**assets**
| col | type | notes |
|---|---|---|
| id | uuid PK | |
| type | enum | `appliance \| vehicle` |
| name, brand, model, serial_or_rc | text | |
| room_or_unit | text | |
| purchase_date | date | |
| price | numeric | ₹ |
| dealer | text | |
| icon | text | |
| owner_id | uuid FK → people | **nullable = shared** |

**documents**
| col | type | notes |
|---|---|---|
| id | uuid PK | |
| asset_id | uuid FK → assets | nullable |
| owner_id | uuid FK → people | **nullable = shared** |
| doc_type | enum | `invoice \| warranty \| amc \| insurance \| rc \| puc \| identity \| property \| other` |
| file_url | text | Supabase Storage |
| issue_date, expiry_date | date | |
| amount | numeric | nullable |
| extracted_json | jsonb | raw AI output |

**contacts** (POC)
| col | type | notes |
|---|---|---|
| id | uuid PK | |
| name | text | |
| role | enum | `doctor \| plumber \| electrician \| ac_tech \| car_workshop \| car_cleaner \| other` |
| phone | text | |
| notes | text | nullable |
| linked_asset_id | uuid FK → assets | nullable (keep it simple; skip a join table for MVP) |
| linked_person_id | uuid FK → people | nullable |

**expenses**
| col | type | notes |
|---|---|---|
| id | uuid PK | |
| name | text | |
| amount | numeric | ₹ |
| date | date | |
| category | text | |
| asset_id | uuid FK → assets | nullable — **this is the "AC + maintenance" link** |
| person_id | uuid FK → people | nullable |
| document_id | uuid FK → documents | nullable |

**reminders**
| col | type | notes |
|---|---|---|
| id | uuid PK | |
| asset_id | uuid FK → assets | **nullable now** |
| person_id | uuid FK → people | nullable |
| document_id | uuid FK → documents | nullable |
| name | text | |
| type | enum | `warranty \| insurance \| amc \| puc \| emi \| service \| identity` |
| due_date | date | |
| amount | numeric | nullable |
| status | enum | `upcoming \| paid \| dismissed` |
| recurrence | text | nullable — unused in MVP |

### Rules for Claude Code
- `owner_id = null` means **shared/household**. Do not force an owner.
- **`reminders` must reference at least one of (asset_id, person_id, document_id)** — add a CHECK constraint. This replaces v1's "asset required" rule, because doc/person-centric reminders now exist.
- `owner_id` and `person_id` are **display/filter labels only — no access control** (no RLS in MVP).
- **One transaction per ingest:** creating from a document inserts the `documents` row, any `assets` row, matched `owner_id`, and the derived `reminders` row(s) together.
- **Person routing:** if extraction returns a `person_hint` that matches a `people.name`, auto-set `owner_id`; else leave null and let the user pick on the confirm screen.
- **Urgency/priority is NOT stored** — the COO feed computes it on read (nearest due_date, then amount, then per-person weighting). Red <7 days, amber <30.

---

## 8. Stack & concrete choices
- **Frontend:** Next.js App Router + Tailwind + **shadcn/ui** (instant polish — don't hand-roll).
- **Data:** Supabase — Postgres + Storage bucket `docs`. **Skip auth** (single household) or a fake user-switcher chip. No RLS.
- **AI:** OpenAI **Responses API** + **Structured Outputs (strict `json_schema`)**. JSON Mode (`type: json_object`) is legacy — do NOT use it; it only guarantees valid JSON, not your schema.
- **Model:** **`gpt-5.6-terra`** (balanced; vision + structured outputs) for extraction *and* the COO summary. Use **`gpt-5.6-luna`** if you want cheaper high-volume extraction. All current OpenAI models support image input + structured outputs.
- **Deploy:** Vercel + Supabase cloud, live by **hour 1** — don't debug prod at the buzzer.
- **Skip:** any queue, cron, vector DB, BSP. For chat/COO over ~10–20 records, stuff them all into context — no RAG infra.

---

## 9. Extraction contract (OpenAI Structured Outputs — give this verbatim)
Strict `json_schema`, every field required, optionals as null-unions. Handle the `refusal` object before parsing.

```json
{
  "entity": "asset | document_only",
  "type": "appliance | vehicle | null",
  "doc_type": "invoice | warranty | amc | insurance | rc | puc | identity | property | other",
  "name": "string",
  "brand": "string | null",
  "model": "string | null",
  "serial_or_rc": "string | null",
  "purchase_date": "YYYY-MM-DD | null",
  "price": "number | null",
  "dealer": "string | null",
  "warranty_months": "number | null",
  "expiry_date": "YYYY-MM-DD | null",
  "amount": "number | null",
  "person_hint": "string | null"
}
```
- `person_hint` = any name found on the doc, used to match a `people` row for auto-routing.
- Derive reminders: `warranty` → purchase_date + warranty_months; `insurance/puc/amc/identity` → on `expiry_date`.
- Never block on partial extraction — pre-fill what parsed, let the user fix the rest.

---

## 10. Screens (4 — resist adding more)
1. **COO home** — action feed, relevant on top, per-person filter chips.
2. **Add via photo** — upload → extraction → confirm form (with person routing).
3. **Person profile** — allergies / insurance / identity docs segregated per member.
4. **Asset detail** — purchase info + linked expenses + linked contact + reminders.

---

## 11. Polish checklist (what makes it look shipped)
- Seed **people** with colored avatar chips; assign owners so cards read "Ma's insurance," "Dad's car"; appliances stay shared.
- Seed 8–10 **assets** (real brands: Voltas/Blue Star AC, Samsung fridge, Sony/LG TV, Bosch oven, a lift AMC, two cars).
- Seed a few **documents** with real expiries and **one linked expense** (AC + ₹8,000 service).
- The **"relevant on top" sort must look visibly smart** (nearest deadline + amount + person) — this sells the "COO" claim.
- Great **loading state** on extraction ("Reading document…"); graceful empty + failure states.
- ₹ currency, DD/MM/YYYY, urgency colors.
- **Pre-load sample images** on the demo device + keep a **backup screen-recording**.

---

## 12. Time budget (3 hours)
| Time | Task |
|---|---|
| 0:00–0:20 | Scaffold: Next + Supabase + shadcn, deploy skeleton, insert seed (people/assets/docs) |
| 0:20–1:10 | **Extraction pipeline** (upload → OpenAI structured output → person routing → transaction) — spend the most here |
| 1:10–1:45 | COO action feed (sorted, per-person filter) |
| 1:45–2:15 | Person profile view + document→person linking |
| 2:15–2:35 | Asset grid/detail + one linked expense (if on track); else polish |
| 2:35–3:00 | Freeze scope, rehearse demo twice, record backup video |

**If behind at 1:45:** drop assets-CRUD + expenses; extraction already creates assets. Ship Documents + People + COO feed.

---

## 13. Traps to avoid (each can eat your 3 hours)
- **Don't build any V2** (subscriptions, food, salaries, deep health).
- **Don't touch WhatsApp / RC-VAHAN / real notifications / auth** — all measured in days or add zero demo value.
- **Don't use JSON Mode** — strict Structured Outputs, or extraction drifts and the demo breaks.
- **Enforce the reminders CHECK constraint** (≥1 of asset/person/document) — or you'll get orphan actions with nothing to open.
- **One Supabase project, §7 schema locked first** — don't let three members build three DBs.
- **Freeze scope at 2:35.** A rehearsed 90-second hero flow wins.
