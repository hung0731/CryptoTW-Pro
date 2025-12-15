# CryptoTW Alpha - Market Review Writing SOP

This guide defines the standard for creating "S-Class" Market Review content. The goal is to transform articles from simple "reports" into "professional research tools" that offer high information density with intuitive navigation.

## 1. Core Philosophy: "Research Tool, Not Just An Article"
- **User Intent**: Users come to verify facts, check impact, and learn lessons—fast.
- **Visual Hierarchy**: 
  - **top 5 seconds**: Must convey the core conclusion.
  - **top 30 seconds**: Must show the magnitude (charts).
  - **Deep Dive**: Collapsible details for researchers.
- **Differentiation**: We don't just retell history; we provide the **toolkit** to spot it happening again.

---

## 2. Structural Template (The "S-Class" Layout)

### A. Quick Guide Card (The "Executive Summary")
*Placement: Top of page, below title.*
*   **Format**: Dark/High-contrast info card.
*   **Content**: 3 bullet points maximum.
    *   **Nature**: What actually broke? (e.g., "Not a hack, but a liquidity crisis").
    *   **Mechanism**: How did it break? (e.g., "Collateral mismatch").
    *   **Root Cause**: The one sentence takeaway.

### B. Analytical Charts (The "Evidence")
*Placement: Immediately after key context, before the full narrative.*
*   **Requirement**: Never show a chart without a "How to read" guide.
*   **Labeling**: 
    *   Title: "Price & Liquidity Dynamics".
    *   Caption: "Note how Open Interest (yellow) vanished 48h before Price (green) crashed."
*   **Data**: Always correlate **Price** with **Volume/OI/Flow** to show hidden risks.

### C. Collapsible Timeline (The "Focus")
*Placement: Middle section.*
*   **Behavior**:
    *   Show only **3-5 Critical Nodes** by default (The "Turning points").
    *   "Expand for Full Timeline" button for the daily noise.
*   **Content**: Focus on *structural breaks* (e.g., "Peg lost", "Withdrawals halted"), not just news headlines.

### D. Warning Signals Module (The "Tool")
*Placement: Bottom 1/3, replacing generic "Conclusion".*
*   **Format**: A checklist titled "If this happens again...".
*   **Content**: Observable on-chain or market signals that preceded the event.
    *   [ ] Stablecoin de-pegging > 1% for > 4h
    *   [ ] Exchange reserve outflows > 20% in 24h
    *   [ ] Funding rates purely negative despite flat price

---

## 3. Writing Style & Tone
*   **Persona**: Senior On-chain Analyst / Institutional Researcher.
*   **Tone**: Objective, precise, slightly cynical about "official statements", obsessed with "on-chain truth".
*   **Banned Words**: "Shocking", "Unbelievable", "To the moon", "Scam" (unless quoting). Use "Insolvent", "Illiquid", "Misappropriation".
*   **Language**: Traditional Chinese (Taiwan/profesional usage).
    *   Use `Volatility` -> 波動率
    *   Use `Liquidity` -> 流動性
    *   Use `Collateral` -> 抵押品
    *   Use `drawdown` -> 回撤

---

## 4. API & Data Strategy
To support this content, use the following approved data sources:

| Data Type | Source | API Endpoint | Notes |
|-----------|--------|--------------|-------|
| **Price** | Binance | `/api/v3/klines` | 1d interval for history. |
| **OI** | Coinglass | `v3/openInterest/ohlc-aggregated-history` | Use `code:0` response. Map `c` (Close) to OI. Time is in **seconds**. |
| **Liquidation** | Coinglass | `v3/liquidation/history` | If available. |
| **Flow** | Coinglass | `/api/etf/bitcoin/flow-history` | For ETF specific events. |

---

## 5. Prompts for AI Generation
When asking AI to generate review content, use this structure:

```markdown
Role: Senior Crypto Market Analyst
Task: Write a "Market Event Review" for [Event Name].
Structure:
1. **Quick Summary**: 3 bullet points on the structural failure.
2. **Chart Context**: 1 sentence explaining what the data proves (e.g., "Price lagged behind capital flight").
3. **Timeline**: Highlight 3 timestamps where the point of no return was crossed.
4. **Future Signals**: List 3 concrete, observable signals that would indicate a repeat of this event.

Constraint:
- Tone: Institutional, objective.
- Focus: Mechanics of failure (Liquidity/Leverage), not drama.
- Output: JSON compatible with our Review schema.
```
