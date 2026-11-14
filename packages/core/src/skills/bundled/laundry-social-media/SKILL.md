---
name: laundry-social-media
description: Social agent — calendar, captions, machine-truth from Data View, Composio limits.
---

# Laundry social media

## Ground copy in Data View

1. Call `plugin_data_view__list_sheets` when writing about the shop’s gear, capacity, or stock.
2. Read tab **Mesin** for capacity (kg/siklus), brand/model, status — use those numbers in captions.
3. Optional: **Stok** / **Ops harian** for promo timing (rainy weeks, busy weekends).
4. Never invent machine capacity or “lebih bagus” claims without a sheet fact or owner quote.

## Machine vs home washer angles

When the owner wants “kelebihan mesin kami”:

- Compare **shop machine kg/siklus** from Mesin vs typical home washer (~5–8 kg) — only state home range as “umum di rumah”, not a measured claim.
- Benefits to stress when sheet supports them: volume per cycle, commercial duty, express turnaround when machines free.
- Avoid medical or fabric-damage guarantees.

## Workflow

1. Ask which channels (IG, WA Status, GBP text) if unclear.
2. Produce 3–7 post ideas with dates.
3. For each: hook, body, CTA, optional hashtag line.
4. For Indonesian copy quality, load **laundry-content-writing-playbook** before drafting or rewriting.

## Composio

- Load skill `composio-integrations`.
- Instagram publish only when connected; otherwise label **draft**.

## Images

- Load skill `laundry-openrouter-image` and call **`laundry_openrouter_image`** for one promo PNG (OpenRouter).
- In `qa_notes`, put business name + exact kg/capacity text from Mesin when the visual must show numbers.

## Artifacts

- Offer `save_artifact` for a weekly calendar markdown when the owner wants a file.
