# Baserow Integration

## Status: Tables Created, 5/6 Imported

### Already Imported
- `services` — 72 rows (41 originales Soul:23 + 31 nuevos servicios MXN)
- `discount_options` — 5 rows
- `agent_profiles` — 1 row (Marco Gallegos)
- `clients` — 1 row (Empresa Demo)
- `quotes` — 1 row (S23-2026-0716-001)

### Needs Fix
- `quotes_lines` — Has wrong fields (Name/Notes/Active). Needs to be recreated.

---

## Fix quotes_lines Table

In Baserow UI:
1. Open `quotes_lines` table
2. Delete fields: `Name`, `Notes`, `Active`
3. Add these fields:
   - `quote_id` → Text (Single-line)
   - `service_id` → Text (Single-line)
   - `quantity` → Number (Integer)
   - `unit_price_usd` → Number (Decimal, 2 decimals)
4. Import `quotes_lines_fixed.json`

---

## Files to Import

| File | Table | Rows |
|------|-------|------|
| `services.json` | services | 72 |
| `discount_options.json` | discount_options | 5 |
| `agent_profiles.json` | agent_profiles | 1 |
| `clients.json` | clients | 1 |
| `quotes.json` | quotes | 1 |
| `quotes_lines_fixed.json` | quotes_lines | 2 |

---

## Baserow IDs (after import)
- Database ID: `496279`
- services: `1083064`
- discount_options: `1083065`
- agent_profiles: `1083066`
- clients: `1083067`
- quotes: `1083068`
- quotes_lines: `1083069`

---

## Important Notes

### quote_lines references
The `quotes_lines_fixed.json` uses Baserow row IDs:
- `quote_id: "2"` → references the quote row in Baserow
- `service_id: "42"` → Starter service
- `service_id: "52"` → Landing Page service

If you re-import quotes or services, these IDs will change. Update the JSON accordingly.

### Field types
Currently all fields are `text` type. For production, consider changing:
- `price`, `exchange_rate`, `total_usd`, `unit_price_usd` → Number
- `recommended`, `is_custom`, `referral`, `stackable` → Boolean
- `created_at` → Date
- `category`, `billing`, `currency`, `status` → Single Select

---

## API Token
Go to Baserow → Profile → Settings → API Tokens → Generate token
