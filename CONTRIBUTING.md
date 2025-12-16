# 貢獻指南 (Contributing to CryptoTW Pro)

## 🚨 產品一致性閘門 (MANDATORY)

在提交任何 Pull Request 之前，您**必須**根據 **產品一致性規則 (Product Consistency Rules)** 驗證您的變更。
違反規則的 PR 將會被拒絕。

### 1. Design Token 使用規範

- [ ] **檢查 Import**: 是否正確引入？
  - `import { CARDS, SURFACE, SPACING, COLORS } from '@/lib/design-tokens'`
- [ ] **禁止硬編碼顏色 (No Hardcoded Colors)**:
  - ❌ `bg-neutral-900`, `bg-black/50`, `text-gray-400`
  - ✅ `CARDS.primary`, `SURFACE.app`, `COLORS.textSecondary`
- [ ] **禁止硬編碼間距 (No Hardcoded Spacing)**:
  - ❌ `p-4`, `m-2`, `space-y-4`
  - ✅ `SPACING.card`, `SPACING.cardGap`

### 2. 卡片系統 (嚴格分類)

每個卡片**必須**精確屬於下列其中一類：

| 類型 (Type) | 用途 (Purpose) | Token | 背景樣式 |
| :--- | :--- | :--- | :--- |
| **Type A** | 主視覺 / 主要行動 (每頁限 1 個) | `CARDS.primary` | `bg-[#0A0A0A]` + Border |
| **Type B** | 列表項目 / 次要資訊 / 可互動 | `CARDS.secondary` | `bg-[#0A0A0A]` + Hover |
| **Type C** | 行內數據 / 統計 (Inline Data) | `CARDS.inline` | 透明背景 + 左側邊框 |
| **Type D** | 被動資訊 / 免責聲明 / 上下文 | `CARDS.passive` | `bg-[#080808]` + 虛線邊框 |

- [ ] **背景檢查**: 卡片背景是否為純色 (`#0A0A0A` 或 `#080808`)？
  - ❌ 禁止使用功能性顏色做背景 (例如：`bg-green-500/10` 是**違規**的)。
  - ✅ 功能性顏色僅能用於 **文字** 或 **標籤 (Badges)**。

### 3. Admin 儀表板規則

- [ ] **無特殊待遇**: Admin 頁面必須使用與公開頁面相同的 `design-tokens`。
- [ ] **Shadcn 限制**: 如果 Shadcn 元件與 Token 衝突 (特別是 Card)，請勿直接使用。請包裝它或直接使用 Token。

### 4. 元件結構

- [ ] **禁止「私有」樣式**: 元件不應內部定義 Padding/Margin。應由父層 Layout透過 `SPACING` tokens 控制。

---
*如有不確定，請以 `design-tokens.ts` 作為唯一真理來源 (Source of Truth)。*
