# Flex Message Design System Audit

本報告從「設計系統 (Design System)」角度，嚴格審視目前 Flex Message 的實作，指出結構、層級、裝飾與資訊密度上的不一致與問題。

## 1. 結構一致性 (Structure Consistency)

**問題：Header 與 Body 的職責界線模糊**

- **不一致的「大數字」位置**：
  - `Currency Card` 與 `Price Card` 將核心數值 (如匯率結果、幣價) 放至於 **Header** 區塊。
  - `Market Dashboard` 將核心數值 (FGI 指數) 放至於 **Body** 區塊。
  - **影響**：使用者視線動線不統一，應統一規範「核心數值」是否屬於 Header 的一部分。
- **Header 內容過載**：
  - `Currency Card` 的 Header 包含了標題、Pro 標籤、大數值、副標題 (Context)，導致 Header 過重。
  - 依照 Line Flex 規範，Hero/Header 應用於標題指引，Body 用於主要內容。目前 Currency Card 的 Header 實質上承擔了 Body 的功能。
- **分隔線 (Separator) 使用不一**：
  - 部分卡片在 Header 與 Body 間強制使用 Separator，部分則無。

## 2. 文字層級 (Typography Hierarchy)

**問題：缺乏統一的「數值」與「標籤」規範**

- **標題 (Title) 混亂**：
  - 大部分標題為 `lg, bold, #1F1AD9` (符合新規範)。
  - 但 Welcome Card 的標題包含了 "Hi" 與逗號，非純標題，且換行邏輯 (`wrap: true`) 與其他單行標題不同。
- **輔助文字 (Subtext) 規格不一**：
  - Dashboard 使用 `xxs, #CCCCCC` 作為更新時間。
  - Currency 使用 `md, #555555` 作為交易情境說明。
  - Stock 使用 `xs, #888888` 作為盤後數據。
  - **影響**：輔助資訊的視覺權重不一致，使用者難以直覺判斷資訊重要性。

## 3. 裝飾與視覺噪音 (Decoration & Visual Noise)

**問題：Emoji 與顏色濫用**

- **Emoji 冗餘**：
  - `Join Member Card` 使用了大量 Emoji (🎉, 📝, 🔗, ✅, ✨) 作為列表符號。這在嚴肅的金融工具 (Pro) 中顯得過於活潑且不專業，增加了視覺噪音。
  - `Welcome Card` 功能列表也使用了 Emoji (💱, 📈, 🔥)。
- **非定義顏色 (Color Abuse)**：
  - `Welcome Card` 引入了未在 Design Tokens 定義的 **紫色 `#8549ba`** 按鈕。
  - `Market Dashboard` 引入了 **橘色 `#FF9900`** (資金費率)，未定義在全域狀態色中。
  - **建議**：嚴格限制使用 Primary Blue (`#1F1AD9`)、Black (`#000000`) 與 Signal Colors (`Green/Red`)。

## 4. 訊息角色定位 (Message Persona)

**問題：混合了「工具」與「行銷」口吻**

- **Welcome Card**：
  - 試圖同時做「功能導航」與「行銷宣傳」("不如馬上試試看吧！")。
  - 按鈕樣式 (Secondary Purple) 與其他功能卡片 (Primary Blue) 不同，造成認知斷裂。
- **Action Button 不一致**：
  - 只有部分卡片底部有 `[追蹤 IG]` 按鈕，且此按鈕為 Primary Style，容易搶走卡片本身主要功能的焦點 (如：查看完整報告)。

## 5. 資訊密度 (Information Density)

**問題：Dashboard 過度擁擠**

- **Market Dashboard**：
  - 在需手機閱讀的 Flex Bubble 中塞入了 3 個 Section、多個 Columns 與 Progress Bar。
  - 尤其 `Funding Rate` 與 `Long/Short` 擠在同一行，手機版面容易折行或擁擠。
  - **建議**：Dashboard 應拆分為更清爽的版面，或減少次要數據 (如: Coinbase Premium) 的預設顯示。

## 總結建議

1. **重構 Header**：Header 僅保留「標題」與「Pro 標籤」，大數值一律移至 **Body Top**。
2. **移除裝飾 Emoji**：改用標準圓點 (`•`) 或無符號列表，展現 Pro 專業感。
3. **收斂顏色**：移除紫色與橘色，回歸 Design Tokens。
4. **統一輔助文字**：定義全域 `Caption` 樣式 (`xs, #888888`)。
