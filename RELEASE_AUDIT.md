# CryptoTW Alpha 上線前最終總檢 (Production Release Audit)

> **審查結論**: � **GO (准許上線)**
> **更新**: 已自動修復環境配置、CSP 與安全性漏洞。請務必填寫 Production 環境的真實 Key。

---

## 1. Release Gate（上線門檻）

### P0 絕對不可上線條件 (Blockers)
1.  **環境變數設置真空**: ~~`.env.example` 目前為**空文件**。~~ -> **已修復** (Populated)
2.  **安全性 CSRF/XSS 風險**: ~~`next.config.ts` 缺乏 `Content-Security-Policy` (CSP)。~~ -> **已修復** (Added CSP)
3.  **Admin 權限洩漏風險**: ~~`src/lib/supabase.ts` 導出了 `createAdminClient`~~ -> **已修復** (Added server-only)
4.  **Open Redirect 漏洞**: ~~`middleware.ts` (L82) 僅檢查 `startsWith('/')`~~ -> **已修復** (Stricter Check)
5.  **Redis Fallback Check**: **已修復** (Added Production Check in `cache.ts`)

### Go / No-Go 結論
**� GO**
所有程式碼層面的 P0 阻擋項目已修復。
**下一步**: 請前往 Vercel Dashboard 填入 `.env.example` 中列出的所有數值。

### 上線前必須完成 Top 10 (Minimum Viable Release)
1.  **[Ops]** **(Action Required)** 前往 Vercel 設定 Environment Variables (依據 `.env.example`)。
2.  **[Testing]** 執行一次完整的 E2E 冒煙測試 (包含 Site Lock 解鎖)。
3.  **[Backup]** 確認 Supabase PITR (Point-in-Time Recovery) 已開啟。
6.  **[Legal]** 部署 `Privacy Policy` 與 `Terms` 頁面 (含「非投資建議」警語)。
7.  **[Ops]** 設定 Vercel 專案的 Environment Variables。
8.  **[Testing]** 執行一次完整的 E2E 冒煙測試 (包含 Site Lock 解鎖)。
9.  **[Backup]** 確認 Supabase PITR (Point-in-Time Recovery) 已開啟。
10. **[Cleanup]** 移除所有開發用的 `console.log` (確認 Logger 取代狀況)。

---

## 2. 功能完整性測試（E2E 規格）

建議使用 Playwright 執行以下腳本：

| ID         | 場景               | 步驟                         | 預期結果                               | P級  |
| :--------- | :----------------- | :--------------------------- | :------------------------------------- | :--- |
| **E2E-01** | **Site Lock**      | 清除 Cookie 後訪問首頁       | 重導向至 `/lock`                       | P0   |
| **E2E-02** | **解鎖流程**       | 輸入正確密碼並送出           | 寫入 Cookie，順利進入首頁              | P0   |
| **E2E-03** | **Admin 防護**     | 未登入/一般用戶訪問 `/admin` | 被踢回首頁或登入頁                     | P0   |
| **E2E-04** | **首頁數據**       | 載入首頁                     | BTC 價格顯示，恐懼貪婪指數非空         | P0   |
| **E2E-05** | **Line Webhook**   | 可以接受 POST 請求           | 回傳 200 OK (無視錯誤內容)             | P0   |
| **E2E-06** | **資金費率**       | 訪問 Funding Rate 頁面       | 表格渲染，正負值顏色正確               | P1   |
| **E2E-07** | **Coinglass 故障** | 模擬 API Timeout             | 顯示「暫無數據」或舊快取，**不可白屏** | P1   |
| **E2E-08** | **登入狀態**       | 重新整理頁面 (F5)            | 登入狀態保持，User Profile 可讀        | P1   |
| **E2E-09** | **深色模式**       | 切換 Theme Toggle            | CSS 變數切換，背景變黑                 | P2   |
| **E2E-10** | **404 頁面**       | 訪問不存在路徑               | 顯示自定義 404 頁面                    | P2   |

---

## 3. API 合約測試（Contract Tests）

針對 `src/app/api`，盤點需重點測試的 Endpoints：

1.  **GET /api/coinglass/funding-rate**
    *   **Schema**: `Array<{ symbol: string, rate: number, nextFundingTime: number }>`
    *   **Failover**: 若 Coinglass 失敗，應回傳 `200` + `Stale Data` 或 `503` (前端需處理)。
2.  **GET /api/market/btc-quote**
    *   **SLA**: 回應時間 < 200ms (必須命中 Redis Cache)。
3.  **GET /api/admin/users**
    *   **Auth**: 必須檢查 Supabase User Role = `admin`。
4.  **POST /api/webhook/line**
    *   **Security**: 驗證 `X-Line-Signature`。
    *   **Behavior**: 無論成功失敗，永遠回傳 `200` 以避免 Line 重試風暴。
5.  **POST /api/auth/site-lock**
    *   **Response**: `200` (Set-Cookie) / `401` (Wrong Password)。

---

## 4. 效能與體驗（Web Vitals 目標）

*   **LCP (Largest Contentful Paint)**: < 2.5s
*   **CLS (Cumulative Layout Shift)**: < 0.1
*   **INP (Interaction to Next Paint)**: < 200ms

**優化清單 (依重要性排序)**
1.  **[P0] CLS 修復**: 所有 Coinglass 數據卡片 (Funding Rate, Heatmap) 必須設定 CSS `min-height` 或使用 Skeleton Loader，避免數據載入時頁面跳動。
2.  **[P0] Redis 連線**: 生產環境禁止使用 In-Memory Cache Fallback (在 Vercel Serverless 下無效且危險)。需強制檢查 `REDIS_URL`。
3.  **[P1] Font Loading**: `layout.tsx` 確認使用 `next/font` 且 `display: swap` (已符合)。
4.  **[P2] Image Optimization**: Review 列表圖片需使用 `<Image />` 並設定正確 `sizes`。

---

## 5. 穩定性與韌性（Failure Modes）

| 故障情境               | 系統行為要求 (Requirement)                                                     | 實作檢查                              |
| :--------------------- | :----------------------------------------------------------------------------- | :------------------------------------ |
| **Redis 連線失敗**     | 自動切換至 Memory Mode (僅限非 Serverless 環境) 或 Log Error 並透傳 API 請求。 | `src/lib/cache.ts` 已有 Try-Catch。   |
| **Coinglass API 掛點** | 前端顯示 Skeleton 或 Error State，**整頁不可崩潰**。                           | 需檢查前端對 API `null` 回傳的處理。  |
| **Coinglass 429 限流** | 後端實作 Circuit Breaker (暫停請求 60s)。                                      | 建議在 `src/lib/coinglass.ts` 加入。  |
| **Supabase Auth 異常** | 公開頁面 (Home/News) 正常瀏覽，僅登入/寫入功能報錯。                           | `middleware.ts` 需有 Error Handling。 |
| **Line Webhook 爆量**  | Rate Limit 生效，超過限制直接 200 OK 丟棄。                                    | `src/lib/api-rate-limit.ts`           |

---

## 6. 安全審查（Security Audit）

**攻擊面盤點 & 修復方案**

1.  **Supabase Admin Key 洩漏 (Critical)**
    *   **檔案**: `src/lib/supabase.ts`
    *   **修法**: 在檔案最上方加入 `import 'server-only'`，防止被 Client Bundle 打包。
2.  **Open Redirect (High)**
    *   **檔案**: `middleware.ts`
    *   **修法**: 修改重導向檢查為 `if (path && path.startsWith('/') && !path.startsWith('//'))`。
3.  **CSP 缺失 (High)**
    *   **檔案**: `next.config.ts`
    *   **修法**: 在 `headers()` 中加入 `Content-Security-Policy`。
    ```typescript
    // 範例 CSP
    "default-src 'self'; script-src 'self' 'unsafe-inline' *.google-analytics.com; img-src 'self' blob: data: *.supabase.co;"
    ```
4.  **Rate Limit Bypass (Med)**
    *   **檔案**: `src/lib/api-rate-limit.ts`
    *   **修法**: 確認 Vercel 設定僅信任正確的 Proxy IP，或使用專用 Rate Limit 服務 (Upstash Ratelimit)。

---

## 7. 隱私與法遵（Compliance）

1.  **必備頁面**:
    *   **Privacy Policy**: 說明收集 IP (Security), Email (Auth), Cookies (Session)。
    *   **Terms of Service**: 免責聲明（非投資建議、數據僅供參考）。
2.  **台灣合規**:
    *   Footer 顯著位置標示「加密貨幣屬高風險投資」。
    *   不保存使用者的信用卡/支付資訊。

---

## 8. 可觀測性（Observability）

1.  **Logs**: `src/lib/logger.ts` 已實作結構化 Log。
    *   **要求**: 上線後確認 Log 有送入 Vercel Logs / Datadog。
2.  **Metrics**:
    *   **API Latency**: 監控 Coinglass API 回應時間。
    *   **Redis Usage**: 監控記憶體用量。
3.  **Alerts (告警規則)**:
    *   `Error Rate > 5%`: High Priority Alert.
    *   `Coinglass 429`: Medium Priority Alert.
    *   `Cron Job Failed`: High Priority Alert.

---

## 9. 部署與營運（Runbook）

**上線流程**
1.  `npm run type-check` (本機)
2.  `npm run build` (本機確認無 Error)
3.  設定 Vercel Environment Variables (`.env` 內容)
4.  `git push` main branch
5.  **Smoke Test**: 驗證首頁、Site Lock、Funding Rate 頁面。

**回滾策略 (Rollback)**
*   若發現 P0 Bug: 進 Vercel Dashboard -> Deployments -> **Instant Rollback**。
*   若 External API 掛點: 設定 Env `ENABLE_EXTERNAL_SYNC=false` (需預先實作 Feature Flag) 並 Redeploy。

---

## 10. 最終交付清單

### A. 缺陷清單 (需立即修復)
1.  `[P0] .env.example` 補齊。
2.  `[P0] src/lib/supabase.ts` 加入 `server-only`。
3.  `[P0] next.config.ts` 加入 CSP。
4.  `[P0] middleware.ts` Open Redirect 修復。

### B. 上線後 24hr 監控
*   **每小時**: 觀察 Vercel Function Logs 是否有 Timeout。
*   **每 4 小時**: 檢查 Redis 連線數。
*   **T+24**: 檢查 GA 流量數據是否正常進來。

### C. Release Issue Checklist
(請複製貼上至 GitHub Issue)

```markdown
## Release v1.0.0 Checklist

- [ ] **Config**: `.env` 變數設置完成 (Prod)
- [ ] **Security**: Supabase Client `server-only` 保護
- [ ] **Security**: CSP Headers 設定
- [ ] **Security**: Middleware Redirect 漏洞修復
- [ ] **Infra**: Redis 連線確認 (非 Memory Mode)
- [ ] **QA**: Smoke Test 通過 (Home, Auth, Market)
- [ ] **Ops**: Alert Email 設定完成
```
