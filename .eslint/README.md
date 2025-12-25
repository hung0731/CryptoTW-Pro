# ESLint Card System Rules

Custom ESLint rules to enforce CryptoTW Card System v3.0 compliance.

## Installation

These rules are locally defined in `.eslint/` and automatically loaded via `.eslintrc.js`.

## Rules

### 1. `enforce-variant-size-matrix` (error)

Enforces the Variant × Size matrix from Card System v3.0 Chapter 17.1.

**Forbidden combinations:**
- `highlight` + `S` (only M or L allowed)
- `clickable` + `M` or `L` (only S allowed)
- `danger` + `S` or `L` (only M allowed)
- `success` + `S` or `L` (only M allowed)

**Example:**
```tsx
// ❌ BAD
<UniversalCard variant="highlight" size="S" />

// ✅ GOOD
<UniversalCard variant="highlight" size="M" />
```

**Auto-fix:** Yes (suggests correct size)

---

### 2. `no-nested-cards` (error)

Prevents nested `UniversalCard` components (Hard Rule 16.1).

**Example:**
```tsx
// ❌ BAD
<UniversalCard>
  <UniversalCard /> {/* Nested! */}
</UniversalCard>

// ✅ GOOD
<UniversalCard>
  <div className="divide-y divide-[#1A1A1A]">
    {/* Use dividers instead */}
  </div>
</UniversalCard>
```

**Auto-fix:** No

---

### 3. `require-standard-gaps` (warn)

Enforces standard gap values: `gap-3`, `gap-4`, `gap-6` (Hard Rule 16.5).

**Example:**
```tsx
// ❌ BAD
<div className="flex gap-2">
<div className="flex gap-5">

// ✅ GOOD
<div className="flex gap-3">
<div className="flex gap-4">
<div className="flex gap-6">
```

**Auto-fix:** Yes (suggests closest standard gap)

---

## Usage

Rules are automatically enforced when running:
```bash
npm run lint
```

## Testing Rules

To test a specific rule:
```bash
npx eslint src/components/ui/UniversalCard.tsx --rule '@cryptotw/card-system/enforce-variant-size-matrix: error'
```

## Disabling Rules

If you need to disable a rule for a specific line (use sparingly!):
```tsx
// eslint-disable-next-line @cryptotw/card-system/no-nested-cards
<UniversalCard>...</UniversalCard>
```

---

**More info:** See `card-system-spec.md` Chapter 16 (Hard Rules)
