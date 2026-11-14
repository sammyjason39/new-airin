---
name: artifact-design
description: Design artifacts such as HTML pages, dashboards, charts, reports, plans, memos, summaries, code snippets, and logs. For slide decks and presentations, use slide-deck-design.
---

Design complete deliverables that the user can revisit in the profile **Artifacts** tab.
These instructions are loaded directly when this skill is active.

## Choose the output

- Use HTML for visual reports, dashboards, charts, plans, memos, landing pages, and browser games.
- For slide decks and presentations, follow the slide-deck-design skill. It holds the deck template; load it with load_skill. Its theme, font, and resource rules replace the ones in this skill.
- Keep the format the user requests. Use Markdown for pages only when the user or another active skill requires it.
- Keep code, logs, and structured data in their appropriate formats. Preserve existing formats when moving files or editing artifacts.

## Locked HTML report template

For any HTML dashboard, KPI page, chart report, finance/ops report, or other metric page — including in group chat — use the locked template. Do not invent a new layout.

1. Read `assets/report.html` with `read_file`, using the full path from this skill's directory.
2. Keep the frame: CSS tokens, `.page` / `.panel` / `.exec` / `.stats` / chart / table structure, theme rules (`:root` light white background, `prefers-color-scheme: dark`, and `html[data-theme="light"|"dark"]`), and print rules.
3. Replace only title, kicker, Executive summary copy, stat cards, chart series and labels, bar heights, and table rows with real facts. Remove unused chart or bar sections only when the user asks for no chart and there is no numeric series.
4. Page order is fixed: title + **Executive summary** first, then 3–5 colorful rounded KPI cards, then at least one chart when any numeric series exists, then the detail table.
5. Save with `save_artifact` as one `.html` file, such as `artifacts/income-expense-dashboard.html`.
6. Default background is white (`--bg: #ffffff`). Follow the active theme with both `prefers-color-scheme` and `html[data-theme]`. Set `data-theme="light"` on `<html>` unless the user asks for a dark-only page.

## Design the page

1. For HTML reports and dashboards, start from the locked template above. For other HTML (landing pages, games, memos without metrics), use the existing design system when the request provides one; otherwise base the design on the subject, audience, and content, still using the shared tokens and theme rules.
2. Give editorial pages, landing pages, and games a bold treatment. Keep plans and memos without metrics polished and restrained. Metric pages stay colorful: rounded panels (`--radius` ~1rem), tinted stat borders, and clear chart color.
3. Write the design plan as CSS custom properties before building the page. Define colors, font families, type sizes, spacing, borders, and radii.
4. Use those tokens throughout the page, except in SVG attributes (see **Print and PDF**). Give every color token a light and dark value, including chart colors and interaction states.
5. Support both themes through `prefers-color-scheme` and `html[data-theme="light"|"dark"]`. If an existing design system provides an explicit theme signal, respect it. Light theme background stays white.
6. Choose typefaces deliberately. Pair fonts only when the pairing improves hierarchy, and keep a consistent type scale with readable fallback fonts.
7. Use only facts from the request or available sources. Do not add dates, durations, team sizes, customers, quotes, integrations, or feature details that were not supplied; omit them.
   - When the user asks for a dashboard, chart, or report and supplies no data, build it with sample numbers instead of asking first. Show a visible "Sample data" label on the page, and say in the reply that the numbers are samples to replace with real data. Never present sample numbers as the user's real figures.
   - Calculate totals, ratios, and deltas from the source rows with a tool that runs code, such as `bash`. Do not do arithmetic in the reply. If no tool can calculate, show the source rows and label the totals as not verified.
   - When a source metric differs from the target metric, such as impressions against a reach target, label that target as not verified. Do not calculate a variance for it.
8. Write plain, direct copy. Use meaningful headings and labels; omit filler and placeholder sections.

Avoid generic defaults: cream with terracotta accents, purple-on-white gradients, emoji, and grids of boxed items outside the dashboard KPI row.
Organize non-dashboard content with spacing, rules, and typography; show features and phases as rows divided by `--rule`, without a per-item background or border. Keep an established brand's choices when they fit the request.

## Airin style recipes

When no other brand is supplied, use Airin's white surfaces, amber primary, teal/blue secondary accents, and clear typography.
Choose one recipe; adapt it to the subject. These names are design guides, not labels to put on the page.

| Style | Use and layout | Token overrides |
| --- | --- | --- |
| **Brief** | Plans and memos: one readable column, a clear decision, ruled action rows. Keep sections open. | Use the shared defaults. |
| **Ledger** | Reports and dashboards: locked `assets/report.html` layout, Executive summary first, colorful rounded KPI cards, charts, mono tabular values. | Keep template `--width` / `--radius`. |
| **Feature** | Launch pages and explainers: a large heading beside one useful subject visual, then open sections. Stack columns on phones. | `--width: 72rem; --title: clamp(2.5rem, 7vw, 5rem);` |

Use this shared token example for non-template pages, then apply only the chosen overrides. Every color alias follows the active theme.
Inter is intentional for Airin styling; use other typefaces when the subject calls for them.
Load named fonts through Google Fonts or use the fallbacks. Artifacts do not inherit app fonts or CSS.

```css
:root {
  color-scheme: light;
  --bg: #ffffff; --text: #171717; --surface: #f4f6fb;
  --muted: #52525b; --line: #e4e7ef; --panel: #ffffff;
  --primary: #b45309; --on-primary: #ffffff;
  --accent-2: #0f766e; --accent-3: #1d4ed8; --accent-4: #be185d;
  --focus: var(--primary); --chart-focus: var(--primary);
  --chart-context: var(--muted);
  --sans: "Inter", ui-sans-serif, system-ui, sans-serif;
  --mono: "JetBrains Mono", ui-monospace, monospace;
  --small: .875rem; --body: 1rem; --section: 1.5rem;
  --title: clamp(2rem, 5vw, 3rem); --width: 48rem;
  --gutter: clamp(1rem, 4vw, 3rem); --gap: 1.25rem;
  --radius: 1rem; --radius-sm: .75rem; --rule: 1px solid var(--line);
}
@media (prefers-color-scheme: dark) {
  :root:not([data-theme="light"]) {
    color-scheme: dark;
    --bg: #0a0a0b; --text: #fafafa; --surface: #141417;
    --muted: #a1a1aa; --line: #27272a; --panel: #18181b;
    --primary: #f59e0b; --on-primary: #0a0a0b;
    --accent-2: #2dd4bf; --accent-3: #60a5fa; --accent-4: #f472b6;
  }
}
html[data-theme="dark"] {
  color-scheme: dark;
  --bg: #0a0a0b; --text: #fafafa; --surface: #141417;
  --muted: #a1a1aa; --line: #27272a; --panel: #18181b;
  --primary: #f59e0b; --on-primary: #0a0a0b;
  --accent-2: #2dd4bf; --accent-3: #60a5fa; --accent-4: #f472b6;
}
body { margin: 0; padding-inline: var(--gutter); background: var(--bg); color: var(--text); font-family: var(--sans); }
```

Use `--on-primary` on filled primary actions. Keep panels and KPI cards rounded (`--radius` / `--radius-sm`). Soft 1px borders are required; a light card shadow is allowed on light theme only.
Separate sections by at least `--gap`. Give ruled rows at least `.75rem` vertical padding.

## Dashboards

Use the locked template when the user asks for a dashboard, KPI page, performance report, or any HTML with metrics and a chart — including group chat.

1. Read `assets/report.html` and keep its tokens. Series colors already include light and dark values: `--series-1` … `--series-4`, `--good`, `--bad`, `--grid`.
2. Order is locked: title + kicker (channels, period, source), **Executive summary** (one short paragraph plus up to three bullets with concrete numbers), 3–5 colorful rounded KPI cards (two columns on phones; never leave one card alone on a row), at least one chart when a numeric series exists, then the detail table. Each block stays a `.panel` with 1px border and `--radius`.
3. Executive summary sits above every chart and table. Lead with the main finding and the key number; bullets carry supporting facts or the next action.
4. Stat card: sentence-case label in `--muted`, large tabular value at weight 700, one short delta line. Color the delta by meaning, not by sign: `--good` when better, `--bad` when worse, `--muted` when unknown. Keep the template's colored top borders on each card.
5. Prefer a chart whenever monthly, weekly, or series numbers exist. Line chart: `position: relative` box ~16rem high; SVG `viewBox="0 0 100 100"` with `preserveAspectRatio="none"` holds only gridlines and `<polyline>` series with `vector-effect="non-scaling-stroke"`. Never put `<text>` or `<circle>` in that SVG. Place tick labels and x labels as HTML. Draw 2px lines; one HTML dot on the last point of each series is optional. Use 3–5 round y ticks and period-start x labels. Bar chart: CSS `.bars` with rounded tops and height as `%` of the shared max (bars start at zero). Legend above the plot with small square swatches.
6. Series colors: `--series-1` then `--series-2` / `--series-3` / `--series-4`. Add more series only as tokens with light and dark values.
7. Table: wrap in `.table-wrap` (`overflow-x: auto`). Sentence-case headers in `--muted`, plain-text cells, numeric columns right-aligned with `font-variant-numeric: tabular-nums`. Color only the change column, by meaning.
8. Do not use uppercase labels, emoji, or decorative badges. Soft bar gradients that use existing series tokens are allowed on the locked template. When the user supplies only approximate points (for example "from ~340 to ~650"), draw a smooth progression and do not print the in-between values. Before you save, check every named peak, dip, or crossing against the stated period.

## HTML requirements

- Write a complete document with a doctype, language, UTF-8 charset, and viewport metadata.
- Give `<title>` a real name of two to four words, such as `Project Atlas`, rather than a summary.
- Use one main heading, semantic sections, labeled controls, visible keyboard focus, and readable contrast in both themes.
- Support phone widths, including 320px, with 16px gutters on both sides. The page must not scroll horizontally; put tables in an `overflow-x: auto` wrapper inside the gutter.
- Let grids, text, and charts adapt to the available width. Fix overflow rather than hiding clipped content.
- Draw charts to scale: compute bars and axis ticks from the same maximum, start bars at zero, and label units.
- Keep chart text at least 12px at 320px. SVG text shrinks with a scaled `viewBox`, so use HTML labels or CSS bars (`width: n%`) for simple charts.
- Every link and button must work in the page: target an existing `#id`, toggle content, or show inline feedback. Never use `href="#"`; omit actions that cannot work.
- Render all essential content on load. Do not hide it behind entrance animations or scroll effects. Respect reduced-motion preferences.
- Keep the HTML at or below 16,000,000 UTF-8 bytes, including embedded assets. A tool or server may impose a lower limit; respect that limit.

## Print and PDF

PDF export renders the HTML without a browser, on A4 paper, in the light theme, and runs no scripts. Write every page so it prints correctly.

1. In SVG attributes, write colors as hex values, such as `fill="#edf2df"`. Never write `fill="var(--surface)"` or `stroke="var(--line)"`: the PDF renderer cannot read `var()` there and draws the shape black. Use the light theme value. For dark mode, give the shape a class and set hex values in the dark media query, such as `.steam { stroke: #708772; }`.
2. Add `@page { size: A4; margin: 0; }`. Slide decks keep their own `@page` rule.
3. Make the layout work at 800px wide, the width of an A4 page. Keep nav labels and short buttons on one line with `white-space: nowrap`.
4. In `@media print`, add `break-inside: avoid` to sections, panels, figures, and table rows, so a page break does not cut them.
5. Give buttons an explicit `line-height`, such as `1.2`, so their text stays centered in the PDF.

## Resources and frame limits

Treat these as authoring requirements. Do not claim that Airin enforces them merely because the page follows these instructions.

- Keep styles, application code, images, and other assets inside the HTML. Use inline SVG or data URLs for images.
- External scripts may use HTTPS only from `cdnjs.cloudflare.com`, `cdn.jsdelivr.net`, `unpkg.com`, `cdn.tailwindcss.com`, or `code.jquery.com`.
- External fonts may use Google Fonts stylesheets from `fonts.googleapis.com` and font files from `fonts.gstatic.com`. System fonts need no request.
- Do not load other remote resources, embed external frames, submit forms to external services, or make network requests from page code.
- Do not use `window.print()`, `alert()`, `confirm()`, `prompt()`, popups, or page-triggered downloads. Use inline feedback for interactions.
- Do not request camera or microphone access unless the runtime explicitly grants that capability for the requested task.
- Do not depend on parent-page access, host credentials, or persistent browser storage. Keep ordinary interaction state in page memory.
- Use Airin's artifact controls for downloads and sharing. Never add secrets or credentials to an artifact.

## Workflow

1. Choose the output format.
2. For HTML dashboards and metric reports, read `assets/report.html`, then fill Executive summary, KPIs, charts, and the table. For other HTML, define the CSS tokens, then build the complete page. Keep the design plan in the CSS; do not create a separate planning artifact.
3. Check the source against the requirements above, including **Print and PDF** and the locked page order. Remove placeholder content, unsupported actions, and unapproved resource URLs before saving.
4. If browser preview is explicitly requested and available, preview once. Check phone width, both themes, and the requested interactions; fix visible problems. Never claim visual verification from a source review alone.
