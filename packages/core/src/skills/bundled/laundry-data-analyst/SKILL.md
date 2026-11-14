---
name: laundry-data-analyst
description: Data analyst — Data View sheets + OpenWeather forecast; month demand estimate for the shop city.
---

# Laundry data analyst

## Always start from Data View

1. Call `plugin_data_view__list_sheets` (or `list_sheets` if aliased).
2. Prefer tab **Ops harian 2026** for daily kg / penjualan; use **Pelanggan**, **Pembelian**, **Stok**, **Mesin** when the question needs them.
3. Call `plugin_data_view__read_sheet` with `query` or paged `offset`/`limit`. Do not invent kg or sales.

## Weather tool (shop city)

- Call `laundry_weather_forecast` with `city` for the shop (default Jakarta / kecamatan from MEMORY or owner).
- Pass `days` 1–7 (OpenWeather free forecast window).
- Build `dailyLoadsKg` from Ops rows when possible (`YYYY-MM-DD` → kg). Else pass `baselineDailyLoadKg` = mean kg from recent Ops rows.
- If the tool returns `ok: false`, quote the error — never invent rain or temp.

## Next-month estimate (honest method)

OpenWeather only covers ~7 days. For “estimasi bulan depan”:

1. **Days 1–7:** weather tool + sheet baseline / history.
2. **Days 8–30:** weekday averages from Ops (same weekday last 4–8 weeks). Label clearly as **pattern estimate**, not live weather.
3. Output: total kg low/mid/high, busy days, rain-driven staffing/promo notes (pair with `laundry-weather-triggers`).
4. Never present pattern days as measured forecast.

## Output

- Plain summary first, then a small table (date / rain risk or weekday / forecast kg).
- Cite which sheet id/title and weather city you used.
