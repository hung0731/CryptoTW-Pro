# CryptoTW Pro — Design System Specification v1.1

> **Extracted From**: Existing `/`, `/news`, `/calendar`, `/prediction`, `/reviews/*`, `/profile` pages.
> **Philosophy**: Minimal. Professional. Analytical. Closer to Bloomberg/TradingView than consumer apps.
> **Core Principle**: Monochrome UI surfaces. Functional colors only in data layers.

---

## 0. Animation Policy (Critical)

### Definition

| Term | Meaning | Allowed |
|------|---------|---------|
| **State Change** | Instant visual feedback (no duration/easing) | ✅ Yes |
| **Animation** | Time-based transition (duration > 0, easing) | ❌ No |

### Hard Rules

- ❌ **No `transition-all`** — Use `transition-none` or instant state changes
- ❌ **No `duration-*`** classes (except `duration-0`)
- ❌ **No `ease-*`** classes
- ❌ **No `animate-*`** classes (shimmer, pulse, spin, etc.)
- ✅ **Allowed**: `hover:bg-*` (instant), `data-[state=active]:*` (instant)

### Rationale

> Financial terminals do not animate. State changes are immediate and deterministic.

### Live Indicator Exception

Small pulsing dots (≤ 4px) used to indicate "live" or "real-time" data streams are **allowed**:

```html
<span class="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
```

**Allowed contexts:**

- ✅ Live data feed indicators
- ✅ WebSocket connection status
- ✅ Real-time price updates

**Not allowed:**

- ❌ Loading skeletons
- ❌ Button hover effects
- ❌ Card transitions

---

## 1. Typography System

All typography uses `Noto Sans` (system sans-serif fallback). Headings use `font-bold tracking-tight`.

| Role | Tailwind Classes | Size | Weight | Color | Usage |
|------|------------------|------|--------|-------|-------|
| **Page Title (H1)** | `text-2xl font-bold tracking-tight` | 24px | Bold | `text-white` | Page headers |
| **Section Title (H2)** | `text-base font-bold tracking-tight` | 16px | Bold | `text-white` | Primary section headers |
| **Section Label** | `text-xs font-semibold text-neutral-400 uppercase tracking-wider` | 12px | Semibold | `text-neutral-400` | Subsection headers |
| **Card Title** | `text-sm font-bold` | 14px | Bold | `text-white` | Card headers |
| **Card Subtitle** | `text-xs font-medium` | 12px | Medium | `text-neutral-400` | Secondary info |
| **Body Large** | `text-sm leading-relaxed` | 14px | Normal | `text-neutral-300` | Primary body |
| **Body Default** | `text-xs leading-relaxed` | 12px | Normal | `text-neutral-400` | Secondary body |
| **Body Small** | `text-[11px] leading-relaxed` | 11px | Normal | `text-neutral-500` | Tertiary info |
| **Caption** | `text-[10px]` | 10px | Normal | `text-neutral-500` | Timestamps |
| **Micro** | `text-[9px]` | 9px | Normal | `text-neutral-600` | Badges |
| **Mono XL** | `text-2xl font-mono font-bold` | 24px | Bold | `text-white` | Hero metrics |
| **Mono Large** | `text-lg font-mono font-bold` | 18px | Bold | `text-white` | Large numbers |
| **Mono Medium** | `text-sm font-mono font-medium` | 14px | Medium | `text-white` | Standard metrics |
| **Mono Small** | `text-xs font-mono` | 12px | Normal | `text-neutral-300` | Data labels |
| **Mono Micro** | `text-[10px] font-mono` | 10px | Normal | `text-neutral-500` | Chart axis |

### Typography Rules

1. **Numeric Emphasis**: All percentages, prices, metrics **must** use `font-mono`.
2. **Color Hierarchy**:
   - `text-white` → Primary focus
   - `text-neutral-300/400` → Secondary
   - `text-neutral-500/600` → Tertiary
3. **Never** use decorative fonts.

---

## 2. Color System

### Surface Hierarchy (Backgrounds)

| Level | Token | OKLCH | Hex | Usage |
|-------|-------|-------|-----|-------|
| 1 (Deepest) | `--background` | `oklch(0 0 0)` | `#000000` | App background |
| 2 (Card) | `--card` | `oklch(0.12 0 0)` | `#0E0E0F` | Card backgrounds |
| 3 (Elevated) | `--highlight` | `oklch(0.18 0 0)` | `#1A1A1A` | Hover states |
| 4 (Border) | `--border` | `oklch(0.18 0 0)` | `#2A2A2A` | Dividers |

### Text Colors

| Token | Usage |
|-------|-------|
| `text-white` | Primary text, numbers |
| `text-[#A0A0A0]` | Secondary text |
| `text-[#666666]` | Tertiary, disabled |

### Functional Color Exception Clause

> **Monochrome applies to UI surfaces & layout.**
> **Functional colors are allowed ONLY in data layers, with strict scope.**

| Purpose | Class | Allowed Context |
|---------|-------|-----------------|
| Positive | `text-[#4ADE80]` | Chart data, metrics, badges |
| Negative | `text-[#F87171]` | Chart data, metrics, badges |
| Neutral | `text-[#A0A0A0]` | Chart data, metrics |

### Functional Colors: Hard Restriction

Functional colors (Green, Red, Amber, Blue, Purple, Yellow) are **ONLY** allowed in:

- ✅ Chart primitives (lines, bars, areas)
- ✅ Inline metric values (e.g., "+5.2%")
- ✅ Status badges

Functional colors are **NEVER** allowed in:

- ❌ Card backgrounds
- ❌ Layout containers
- ❌ Buttons (except badges)
- ❌ Borders (except chart markers)

---

## 3. Comparison Colors (Blue / Amber)

### Definition

Blue and Amber are **comparison-only semantic colors**, used exclusively for:

> **"Same data, different samples"** visual contrast.

### Semantic Meaning

| Color | Semantic | Usage |
|-------|----------|-------|
| **Blue** (`#3B82F6`) | Base / Primary reference | Left panel, first dataset |
| **Amber** (`#F59E0B`) | Compare / Secondary reference | Right panel, overlay dataset |

### Allowed Contexts (Exhaustive)

- ✅ Comparison mode (Base vs Compare)
- ✅ Historical event A vs B
- ✅ Stacked overlay charts (current vs average)
- ✅ Comparison badges (e.g., "基準", "對照")

### Explicitly Forbidden

Blue / Amber are **NOT**:

- ❌ Brand colors
- ❌ Card backgrounds
- ❌ Button colors
- ❌ Layout highlights
- ❌ Success / Warning / Error states

### Visibility Rule

> **If comparison mode is inactive, Blue / Amber must not appear anywhere on screen.**

---

## 4. Badge System

### Status Badges

| Type | Classes | Allowed Usage |
|------|---------|---------------|
| Neutral | `bg-neutral-800 text-neutral-300 border-neutral-700` | Default state |
| Success | `bg-green-500/10 text-green-400 border-green-500/20` | Metrics only |
| Warning | `bg-yellow-500/10 text-yellow-400 border-yellow-500/20` | Alerts only |
| Danger | `bg-red-500/10 text-red-400 border-red-500/20` | Errors only |
| Info | `bg-blue-500/10 text-blue-400 border-blue-500/20` | **Links/info only** |

### Comparison Badges (Exception)

| Type | Classes | Context |
|------|---------|---------|
| Base | `bg-blue-500/20 text-blue-400` | Comparison mode only |
| Compare | `bg-amber-500/20 text-amber-400` | Comparison mode only |

### Badge Color Rule

> Blue / Amber / Yellow may only appear in **Badges** and **Chart Data Layer**.
> Never in layout, cards, or backgrounds.

---

## 5. Card System

### Type A: Hero / Focus Card

```
bg-[#0E0E0F] border border-[#2A2A2A] rounded-xl
```

- **Padding**: `p-4` or `p-5`
- **Usage**: Primary content, feature cards

### Type B: Comparison / History Card

```
bg-[#0E0E0F] hover:bg-[#1A1A1A] rounded-lg
```

- **Padding**: `p-3`
- **Hover**: Instant background change (no transition)
- **Usage**: Scrollable lists, historical items

### Type C: Info Block

```
bg-transparent border-l border-[#2A2A2A] pl-4
```

- **Usage**: Inline stats, secondary info

### Card Rules

- No colored backgrounds
- No gradients
- No shadows (except `shadow-sm` on overlays)

---

## 6. Chart Styling Rules

### Line & Area Charts

| Element | Value |
|---------|-------|
| Primary Line | `2px`, `#EDEDED` |
| Secondary Line | `1.5px` |
| OI Line | `#eab308` (Amber) |
| FGI Line | `#8b5cf6` (Purple) |
| Grid | `#111111`, horizontal only |
| Axis Text | `10px`, `#525252` |

### Area Gradient Rule

> Area gradients must be **data-encoding only**, not decorative.

```
Opacity: 20% at top → 0% at bottom
```

- ✅ Used to show magnitude/volume
- ❌ Never for visual appeal or branding

### Reference Lines

| Type | Color | Style |
|------|-------|-------|
| D0 (Reaction) | `#ef4444` | Dashed |
| D-30/D+30 | `#ffffff` at 10% | Solid |
| News Date | `#ffffff` at 40% | Dashed |

### Flow Bars

- Positive: `#22c55e`
- Negative: `#ef4444`

### Watermark

- Position: Center
- Opacity: `3%`
- Image: `/logo.svg` grayscale

### What Charts Should NEVER Include

- ❌ 3D effects
- ❌ Drop shadows
- ❌ Multiple gradients
- ❌ Legend boxes (use inline labels)
- ❌ Decorative icons
- ❌ Price predictions

---

## 7. Layout & Spacing

### Spacing Scale

| Token | Value | Usage |
|-------|-------|-------|
| `space-y-2` | 8px | Tight lists |
| `space-y-3` | 12px | Compact cards |
| `space-y-4` | 16px | Standard gaps |
| `space-y-6` | 24px | Section separation |
| `space-y-8` | 32px | Major breaks |

### Page Layout

| Element | Value | Note |
|---------|-------|------|
| Horizontal Padding | `px-4` | All pages |
| Bottom Padding | `pb-24` | **Only pages with BottomNav** |
| Desktop | No forced `pb-24` | BottomNav may not exist |

### Density

| Context | Density |
|---------|---------|
| Dashboard | Compact (`p-3`, `space-y-3`) |
| Detail/Reading | Relaxed (`p-5`, `space-y-6`) |
| Data Tables | Tight (`p-2`, `space-y-2`) |

---

## 8. Interaction & Controls

### Button Hierarchy

| Type | Classes | Usage Limit |
|------|---------|-------------|
| **Primary** | `bg-white text-black` | **Max 1 per screen** |
| **Secondary** | `bg-neutral-800 text-white border-white/10` | Unlimited |
| **Ghost** | `text-neutral-400 hover:bg-white/5` | Unlimited |
| **Icon** | `w-9 h-9 bg-neutral-900 border-white/5` | Unlimited |

### Primary Button Rule

> Primary buttons should be used **sparingly** — maximum 1 per screen.
> Overuse dilutes CTA hierarchy and makes the interface feel like a consumer app.

### Tab Navigation

**Correct (v1.1):**

```
Active:   bg-neutral-800 text-white
Inactive: text-neutral-500
```

**Forbidden:**

- ❌ `bg-gradient-to-r`
- ❌ Multi-color gradients
- ❌ Shadow effects

> Bloomberg / TradingView do not use gradients for state. Use solid colors or underlines.

### Filter Chips / Toggles

**Active:**

```
bg-white text-black border-white
```

**Inactive:**

```
bg-neutral-900 text-neutral-500 border-white/10
```

### Filter Control Rules

1. Filters are **view-only**, not analysis logic
2. Active state uses **contrast**, not color
3. No icons inside filter chips
4. Max **5 options** per filter group
5. Must reflect state textually (e.g., "顯示: 1Y")

### Disabled States

- Opacity: `opacity-50`
- Pointer: `pointer-events-none`
- Never change color — use opacity only

---

## 9. Empty / Loading States

### Empty State Rules

| Rule | Specification |
|------|---------------|
| Style | Text-first, no illustrations |
| Icon Size | ≤ 16px (if any) |
| Message | ≤ 1 sentence |
| Color | `text-neutral-500` |
| Layout | **Never center vertically** (keep analytical layout) |

**Example:**

```html
<div class="text-center py-8">
  <p class="text-sm text-neutral-500">暫無數據</p>
</div>
```

### Loading State Rules

| Rule | Specification |
|------|---------------|
| Preferred | Static placeholders |
| Forbidden | Animated skeletons, spinners |
| Timeout | If loading > 500ms, show placeholder text only |
| Text | `text-neutral-600`, e.g., "載入中..." |

**Hard Rule:**

> No `animate-pulse`, `animate-spin`, or shimmer effects.
> Loading states must be static.

---

## 10. Content Tone Rules

### Writing Style

- **Audience**: Senior crypto traders
- **Tone**: Objective, precise, data-driven
- **Never**: Sensational, emotional, speculative

### Length Limits

| Element | Max |
|---------|-----|
| Decision Card Line | 1 sentence |
| Card Subtitle | 10 words |
| Body Paragraph | 2-3 sentences |

### Allowed Language

- ✅ "流動性下降", "槓桿清算"
- ✅ "價格創新高", "波動率上升"

### Forbidden Language

- ❌ "震驚", "瘋狂" → Use "超出預期"
- ❌ Price targets
- ❌ Investment advice
- ❌ Bracketed English: "(Volatility)"

---

## 11. Do & Don't List

### DO

- ✅ Use `font-mono` for all numbers
- ✅ Use strict grayscale for UI surfaces
- ✅ Use Blue/Amber **only** in comparison mode
- ✅ Limit Primary button to 1 per screen
- ✅ Use instant state changes (no duration)
- ✅ Show data source attribution

### DON'T

- ❌ Use `transition-all` or `duration-*`
- ❌ Use gradients for tabs or navigation
- ❌ Use colored backgrounds on cards
- ❌ Use animated loading states
- ❌ Use Blue/Amber outside comparison mode
- ❌ Use more than 1 Primary button per screen
- ❌ Use emojis in data-heavy sections
- ❌ Center empty states vertically

---

## 12. Code Token Reference

```typescript
// Typography
TYPOGRAPHY.pageTitle        // text-2xl font-bold tracking-tight
TYPOGRAPHY.sectionTitle     // text-base font-bold tracking-tight
TYPOGRAPHY.monoXL           // text-2xl font-mono font-bold

// Surfaces
SURFACE.app                 // bg-[#050505]
SURFACE.card                // bg-[#0E0E0F]
SURFACE.highlight           // bg-[#1A1A1A]

// Colors
COLORS.textPrimary          // text-white
COLORS.positive             // text-[#4ADE80]
COLORS.negative             // text-[#F87171]

// Cards
CARDS.typeA                 // Hero cards (border)
CARDS.typeB                 // Comparison cards (no border)
CARDS.typeC                 // Info blocks (left border)

// Buttons
BUTTONS.primary             // bg-white text-black (max 1/screen)
BUTTONS.secondary           // bg-neutral-800
BUTTONS.ghost               // transparent
```

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| v1.0 | 2024-12-16 | Initial extraction |
| v1.1 | 2024-12-16 | Added: Animation Policy, Functional Color Exception, Comparison Color Rules, Empty/Loading States, Filter Rules. Fixed: Tab gradient → solid, Primary button limit, pb-24 scope, Area gradient clarification. |

---

## Usage Guidelines

### For PR Reviews

> UI PR must comply with this specification. Reject if non-compliant. Do not debate aesthetics — check compliance only.

### For AI Generation

Prefix prompts with:

```
Must comply with CryptoTW Pro Design System v1.1 (strict).
```

### For Engineering

Extract and use these sections directly:

1. Typography Tokens
2. Surface Tokens
3. Chart Rules
4. Animation Policy
