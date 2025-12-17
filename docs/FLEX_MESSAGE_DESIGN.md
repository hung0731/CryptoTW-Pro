# Flex Message Design System v1.0

本文件為 CryptoTW Pro Line Bot 之**唯一設計真理 (Single Source of Truth)**。所有 Flex Message 開發與修改皆須嚴格遵循本規範。

## A. 核心設計原則 (Core Principles)

1. **Data First, Decor Second**: 數據的易讀性永遠優於裝飾。在 0.5 秒內讓用戶看到重點。
2. **Strict Hierarchy**: 資訊層級必須明確（標題 > 大數據 > 次要數據 > 輔助資訊）。禁止「平鋪直敘」的排版。
3. **Consistent Vocabulary**: 顏色、字級、間距必須統一，不得創造「特例」。

---

## B. 訊息角色分類 (Role Classification)

系統中的所有訊息必須被歸類為以下四種角色之一，並遵循該角色的專屬規範：

### 1. Snapshot (快照類)

* **定義**: 用於展示即時數據、資產價格、市場狀態。
* **範例**: `PriceCard`, `StockCard`, `CurrencyCard`, `MarketDashboard`
* **設計重點**:
  * **高頻訊息**：設計須極度精簡，減少裝飾，強化對比。
  * **核心視覺**: [Big Number] (xxl/4xl)。
* **禁止**: 冗長的文字說明、裝飾性圖片、非必要的 Emoji。

### 2. Alert (警示類)

* **定義**: 用於通知市場異動、清算發生、訊號觸發。
* **範例**: `MarketStateCard` (當狀態改變時), 價格預警。
* **設計重點**:
  * **急迫性**: 使用明確的訊號色 (Green/Red) 作為視覺主導。
  * **摘要**: 標題須直接說明「發生什麼事」(例如：🔥 資金費率飆升)。

### 3. Explanation (解釋類)

* **定義**: 用於回答問題、解釋名詞、分析原因。
* **範例**: AI 分析回應、名詞解釋。
* **設計重點**:
  * **閱讀性**: 重視文字排版、段落分明。
  * **輔助資訊**: 可包含 `separator` 與較多 `sm` 級距文字。

### 4. CTA (行動類)

* **定義**: 用於引導兩戶進行特定操作。
* **範例**: `WelcomeMessage`, `JoinMemberMessage`, `ProBenefits`.
* **設計重點**:
  * **引導性**: 按鈕層級要明確 (Primary vs Secondary)。
  * **低頻訊息**：容許較豐富的版面配置，但仍須保持專業。

---

## C. 區塊規範 (Component Blocks)

### 1. Header (頂部導航)

* **角色**: 告訴用戶「這張卡片是什麼」。
* **規範**:
  * **必填 (Mandatory)**: `Title` (lg, bold, Brand Blue), `Pro Label` (xxs, Gray).
  * **可選 (Optional)**: 無。
  * **禁止 (Prohibited)**: **數值 (Values)**、**價格**、**多餘 Emoji**、**操作按鈕**。
  * **理由**: Header 是導航，不是儀表板。數據請放 Body。

### 2. Body (內容核心)

* **角色**: 展示核心價值與數據。
* **規範**:
  * **必填**: `Big Number` (若為 Snapshot/Alert), `Content List`.
  * **佈局**: 主要數據置頂 (Top)，次要數據置中 (Middle)，輔助置底 (Bottom)。
  * **禁止**: 標題與 Header 重複、無意義的裝飾分隔線。

### 3. Footer (操作區)

* **角色**: 提供延伸閱讀或外部連結。
* **規範**:
  * **可選**: `Secondary Button` (灰色), `Primary Button` (品牌藍, 僅限重要轉化)。
  * **禁止**: 超過 2 個按鈕 (避免決策疲勞)。

---

## D. 絕對禁止事項 (Zero Tolerance)

以下情況在 Code Review 時**直接退回 (Reject)**：

1. **Header 包含價格/數據**：例如將 BTC 價格放在 Header Title 旁。
2. **非定義顏色**：出現紫色 (`#8549ba`)、橘色 (`#FF9900`) 或任何未在 Tokens 定義的 Hex Code。
3. **裝飾性 Emoji 列表**：在 Snapshot/Alert 類別中，使用 ✨, 🎉, 🔥 作為 bullet points。
4. **文字層級混亂**：主要數據小於 `xxl`，或輔助標籤大於 `sm`。
5. **資訊過載 (Mobile)**：單一 Bubble 在手機上超過 1.5 個視窗高度。

---

## E. Design Tokens (Reference)

```typescript
export const THEME = {
    colors: {
        brand: '#1F1AD9',    // 主視覺、標題
        up: '#00B900',       // 正向、做多 (Green)
        down: '#D00000',     // 負向、做空 (Red)
        text: '#111111',     // 大標題、數值
        textSub: '#555555',  // 次要資訊
        textMuted: '#888888',// 自弱標籤
        separator: '#f0f0f0' // 分隔線
    },
    sizes: {
        header: 'lg',
        bigNumber: 'xxl', // Snapshot 核心數值
        hugeNumber: '4xl', // 儀表板特大數值
        body: 'sm',
        caption: 'xs',
        label: 'xxs'
    }
}
```
