# CryptoTW Pro — Design System v2.0

> **Status**: MANDATORY SPECIFICATION
> **Philosophy**: Minimal. Professional. Analytical.
> **Target**: Bloomberg / TradingView (not consumer SaaS)

---

## HARD CONSTRAINTS (Non-Negotiable)

| Rule | Enforcement |
|------|-------------|
| Card types | **EXACTLY 4** (A/B/C/D) — no variants |
| Surface colors | **ONLY from design-tokens.ts** |
| Border radius | **ONLY from design-tokens.ts** |
| Animations | **NONE** — no transition, no duration |
| UI Colors | **Black/White/Gray ONLY** |
| Functional Colors | **Data layer ONLY** |
| Comparison Colors | **Blue/Amber in comparison mode ONLY** |
| Chart Watermark | **MANDATORY** |

---

## 0. Animation Policy

### Definition

| Term | Allowed |
|------|---------|
| State Change (instant) | ✅ Yes |
| Time-based Transition | ❌ No |

### Prohibited Classes

- `transition-all`, `transition-*`
- `duration-*` (except `duration-0`)
- `ease-*`
- `animate-*`

### Live Indicator Exception

Pulsing dots (≤ 4px) for real-time data indicators are allowed:

```html
<span class="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
```

---

## 1. Card System (4 Types Only)

### Type A: Primary Focus Card

```typescript
CARDS.primary = 'bg-[#0A0A0A] border border-[#1A1A1A] rounded-xl'
```

| Property | Value |
|----------|-------|
| Background | `#0A0A0A` |
| Border | 1px solid `#1A1A1A` |
| Radius | 12px (`rounded-xl`) |
| Padding | `p-5` (default), `p-4` (compact) |
| Hover | None |

**Use for**: Hero content, decisions, key actions, event headers

**Never use for**: Lists, scrollable items, inline stats

---

### Type B: Secondary List Card

```typescript
CARDS.secondary = 'bg-[#0A0A0A] hover:bg-[#0E0E0F] hover:border hover:border-[#1A1A1A] rounded-lg'
```

| Property | Value |
|----------|-------|
| Background | `#0A0A0A` |
| Border | None (appears on hover) |
| Radius | 8px (`rounded-lg`) |
| Padding | `p-3` (default), `p-2` (tight) |
| Hover | Instant: bg → `#0E0E0F`, border appears |

**Use for**: Review cards, history lists, comparison items, calendar events

**Never use for**: Hero content, standalone metrics

---

### Type C: Inline Data Block

```typescript
CARDS.inline = 'bg-transparent border-l-2 border-[#1A1A1A] pl-3'
```

| Property | Value |
|----------|-------|
| Background | Transparent |
| Border | Left only, 2px |
| Radius | None |
| Padding | `pl-3` only |
| Hover | None |

**Use for**: Stats (Win Rate, Avg Return), KPIs, tabular data

**Never use for**: Standalone containers, clickable items

---

### Type D: Passive Info Card

```typescript
CARDS.passive = 'bg-[#080808] border border-dashed border-[#1A1A1A] rounded-xl'
```

| Property | Value |
|----------|-------|
| Background | `#080808` |
| Border | Dashed, 1px |
| Radius | 12px (`rounded-xl`) |
| Padding | `p-4` |
| Hover | None |

**Use for**: Educational content, explanations, empty states, disclaimers

**Never use for**: Interactive content, data displays

---

### Card Summary

| Type | Background | Border | Radius | Hover |
|------|------------|--------|--------|-------|
| A (Primary) | `#0A0A0A` | solid | 12px | None |
| B (Secondary) | `#0A0A0A` | on hover | 8px | Instant |
| C (Inline) | transparent | left-2px | none | None |
| D (Passive) | `#080808` | dashed | 12px | None |

---

## 2. Surface Hierarchy

| Level | Hex | Token | Usage |
|-------|-----|-------|-------|
| 0 | `#050505` | `SURFACE.app` | Page background |
| 1 | `#0A0A0A` | `SURFACE.cardPrimary` | Primary/Secondary cards |
| 2 | `#080808` | `SURFACE.cardPassive` | Passive cards |
| 3 | `#0E0E0F` | `SURFACE.elevated` | Hover states |
| 4 | `#1A1A1A` | `SURFACE.highlight` | Selected states |

---

## 3. Color System

### UI Colors (Layout)

| Purpose | Hex | Token |
|---------|-----|-------|
| Primary Text | `#FFFFFF` | `COLORS.textPrimary` |
| Secondary Text | `#A0A0A0` | `COLORS.textSecondary` |
| Tertiary Text | `#666666` | `COLORS.textTertiary` |
| Muted Text | `#525252` | `COLORS.textMuted` |
| Border | `#1A1A1A` | `BORDER.primary` |

### Functional Colors (Data Layer Only)

| Purpose | Hex | Token | Allowed Context |
|---------|-----|-------|-----------------|
| Positive | `#22C55E` | `COLORS.positive` | Chart bars, metrics |
| Negative | `#EF4444` | `COLORS.negative` | Chart bars, metrics |
| Neutral | `#808080` | `COLORS.neutral` | Unchanged values |

### Comparison Colors (Comparison Mode Only)

| Purpose | Hex | Token | Allowed Context |
|---------|-----|-------|-----------------|
| Base | `#3B82F6` | `COLORS.compareBase` | Left panel, first series |
| Compare | `#F59E0B` | `COLORS.compareAlt` | Right panel, overlay |

**Rule**: Blue/Amber ONLY appear when comparison mode is active.

---

## 4. Typography

| Role | Classes | Size |
|------|---------|------|
| Page Title | `TYPOGRAPHY.pageTitle` | 24px bold |
| Section Title | `TYPOGRAPHY.sectionTitle` | 16px bold |
| Section Label | `TYPOGRAPHY.sectionLabel` | 12px semibold uppercase |
| Card Title | `TYPOGRAPHY.cardTitle` | 14px bold |
| Card Subtitle | `TYPOGRAPHY.cardSubtitle` | 12px medium |
| Body Large | `TYPOGRAPHY.bodyLarge` | 14px |
| Body Default | `TYPOGRAPHY.bodyDefault` | 12px |
| Caption | `TYPOGRAPHY.caption` | 10px |
| Mono XL | `TYPOGRAPHY.monoXL` | 24px mono bold |
| Mono Medium | `TYPOGRAPHY.monoMedium` | 14px mono medium |

**Rule**: All numbers/prices/percentages use `font-mono`.

---

## 5. Chart Visual Language

### Line Hierarchy

| Role | Width | Color | Opacity |
|------|-------|-------|---------|
| Primary | 2px | `#E0E0E0` | 100% |
| Secondary | 1.5px | `#A0A0A0` | 80% |
| Historical | 1px | `#666666` | 60% |
| Average | 1px dashed | `#808080` | 50% |

### Comparison Mode Lines

| Role | Color |
|------|-------|
| Base | `#3B82F6` (Blue) |
| Compare | `#F59E0B` (Amber) |

### Grid & Axes

| Element | Visibility |
|---------|------------|
| Grid Lines | Horizontal only, `#111111` dashed |
| Axis Lines | Hidden |
| Tick Lines | Hidden |
| Axis Labels | Visible, 10px, `#525252` |

### Reference Markers

| Type | Color | Style |
|------|-------|-------|
| D0 (Reaction) | `#EF4444` | Dashed |
| Time Bounds | `#FFFFFF` at 10% | Solid |
| Event Date | `#FFFFFF` at 40% | Dashed |

**Maximum**: 3 reference lines per chart.

### Tooltip (Unified)

```typescript
CHART.tooltip = {
    container: 'bg-[#0A0A0A]/95 border border-[#1A1A1A] rounded-lg shadow-xl p-2',
    date: 'text-[10px] text-[#666666] mb-1',
    value: 'text-xs font-mono font-bold text-white',
    label: 'text-[10px] text-[#808080]',
}
```

**Tooltips must NOT include**: Icons, emojis, multiple series, decorations.

### Watermark (MANDATORY)

```tsx
<div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-0 opacity-[0.03]">
    <img src="/logo.svg" className="w-48 h-48 grayscale" />
</div>
```

| Property | Value |
|----------|-------|
| Position | Center |
| Opacity | 3% (2-4% range) |
| Size | 25% of container, max 192px |
| Filter | Grayscale |

**Every chart MUST have watermark. No exceptions.**

---

## 6. Button Hierarchy

| Type | Token | Limit |
|------|-------|-------|
| Primary | `BUTTONS.primary` | Max 1 per screen |
| Secondary | `BUTTONS.secondary` | Unlimited |
| Ghost | `BUTTONS.ghost` | Unlimited |
| Icon | `BUTTONS.icon` | Unlimited |

---

## 7. Spacing Scale

| Token | Value | Usage |
|-------|-------|-------|
| `SPACING.cardLarge` | 20px | Primary card default |
| `SPACING.card` | 16px | Primary card compact |
| `SPACING.cardCompact` | 12px | Secondary card default |
| `SPACING.cardTight` | 8px | Secondary card tight |
| `SPACING.sectionGap` | 24px | Between sections |
| `SPACING.cardGap` | 16px | Between cards |

---

## 8. Do & Don't

### DO

- ✅ Use ONLY `CARDS.primary/secondary/inline/passive`
- ✅ Use tokens for ALL colors
- ✅ Use tokens for ALL radii
- ✅ Add watermark to ALL charts
- ✅ Use `font-mono` for numbers
- ✅ Use instant hover states

### DON'T

- ❌ Create new card variants
- ❌ Use inline hex colors
- ❌ Use inline `rounded-*` values
- ❌ Use `transition-*` or `duration-*`
- ❌ Use Blue/Amber outside comparison mode
- ❌ Omit chart watermarks
- ❌ Add more than 3 reference lines

---

## 9. Engineering Checklist

### Per Component

- [ ] Uses exactly one of: `CARDS.primary/secondary/inline/passive`
- [ ] No inline `bg-*` colors
- [ ] No inline `rounded-*` values
- [ ] No `transition-*` classes
- [ ] Hover is instant (if any)

### Per Chart

- [ ] Primary line is 2px, `#E0E0E0`
- [ ] Watermark present and centered
- [ ] Watermark opacity is 3%
- [ ] Tooltip uses `CHART.tooltip`
- [ ] Max 3 reference lines
- [ ] Grid horizontal only

### Per Page

- [ ] Max 1 primary button
- [ ] Colors are Black/White/Gray only
- [ ] Blue/Amber only in comparison mode

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| v1.0 | 2024-12-16 | Initial extraction |
| v1.1 | 2024-12-16 | Animation policy, color exceptions |
| v2.0 | 2024-12-16 | Complete unification: 4 card types, chart tokens, mandatory constraints |
