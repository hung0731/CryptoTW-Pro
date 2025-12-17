---
description: how to add a new indicator chart with correct semantics
---

# 新增指標圖表設計守則

## 必須回答的三個問題

新增任何指標圖表前，必須先回答：

1. **值域是什麼？**
   - 有界（0–100）→ 使用 `fixed` Y軸
   - 無界 → 使用 `auto` Y軸
   - 對稱（以 0 或 1 為中心）→ 使用 `symmetric` Y軸

2. **語意是什麼？**
   - 情緒（恐懼/貪婪）→ 僅限 FGI 類
   - 方向（流入/流出）→ ETF Flow、OI 變化
   - 擁擠（多頭/空頭擁擠）→ Funding Rate、Long/Short
   - 強度（事件密度）→ Liquidation

3. **零點在哪？**
   - 0 → Funding Rate、Premium、Basis
   - 1 → Long/Short Ratio
   - 無 → Liquidation、Stablecoin

## 實作步驟

// turbo-all

1. 在 `src/lib/chart-semantics.ts` 添加新指標的語意模型
2. 確認 `indicatorType` 正確（emotion/ratio/cumulative/spike/absolute）
3. 設定正確的 `yAxis` 配置
4. 設定正確的 `colorSemantic` 類型
5. 實作 `getTooltipExplanation` 函數
6. 在 `ReviewChart.tsx` 中使用正確的圖表類型和參考線

## 禁止事項

- ❌ 對非情緒指標使用「恐懼/貪婪」標籤
- ❌ 對非有界指標使用 0–100 固定軸
- ❌ 隨意創造「危險/安全」區間
- ❌ 複製 FGI 圖表設定到其他指標
