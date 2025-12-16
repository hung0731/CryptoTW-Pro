# Security Guidelines

> 「auth admin 操作保留 service role，其餘使用 RLS 將資料存取權限下放到資料庫層，並搭配事件白名單、輸入驗證與限流，降低 service role 暴露面。」

---

## adminClient (Service Role) 使用原則

### ✅ 允許使用的情境

1. **必須操作 `auth.admin.*`**
   - 例如：`createUser()`、`linkIdentity()`

2. **必須做「跨使用者」寫入／修正，且有明確 server-side 驗證**
   - Webhook 驗證簽章
   - 已登入的 Supabase auth + server-side RBAC

### ❌ 其他情境

優先改成 **RLS + anon/auth client**

---

## API 安全 Checklist

### 必做項目

| 項目 | 說明 |
|------|------|
| **Rate Limiting** | 所有公開 API 都必須有限流 |
| **Input Validation** | 使用 zod/valibot 驗證 schema |
| **Payload Size Limit** | JSON payload 最大 4-8KB |
| **String Length Limit** | 欄位字串長度上限 |
| **Event Whitelist** | analytics 事件名稱必須在白名單內 |

### OAuth 驗證 (LINE/Google 等)

| 項目 | 說明 |
|------|------|
| **State/Nonce** | 防止 CSRF 和重放攻擊 |
| **簽章驗證** | 確保請求來自正確來源 |
| **一次性使用** | 用過的 state/nonce 立即失效 |

---

## RLS 政策範本

### 使用者只能存取自己的資料

```sql
-- SELECT: 只能查詢自己的資料
CREATE POLICY "Users can view own data"
ON table_name FOR SELECT
USING (user_id = auth.uid());

-- INSERT: 只能為自己新增資料
CREATE POLICY "Users can insert own data"
ON table_name FOR INSERT
WITH CHECK (user_id = auth.uid());

-- UPDATE: 只能更新自己的資料
CREATE POLICY "Users can update own data"
ON table_name FOR UPDATE
USING (user_id = auth.uid());
```

### 公開讀取，限制寫入

```sql
-- 任何人都可以讀取
CREATE POLICY "Public read access"
ON table_name FOR SELECT
USING (true);

-- 只有認證使用者可以寫入
CREATE POLICY "Authenticated insert"
ON table_name FOR INSERT
WITH CHECK (auth.role() = 'authenticated');
```

---

## API 風險評級

| API 路徑 | 風險等級 | 目前狀態 | 建議 |
|----------|----------|----------|------|
| `/api/admin/*` | 🔴 高 | ✅ 已加認證 | 維持 adminClient |
| `/api/auth/line` | 🟡 中 | ⚠️ 待加固 | 加 state/nonce |
| `/api/binding` | 🟡 中 | ✅ 有 rate limit | 可改用 RLS |
| `/api/user/bindings` | 🟡 中 | ⚠️ 待修改 | 必須改用 RLS |
| `/api/analytics/track` | 🟢 低 | ⚠️ 待修改 | 改用 RLS + 白名單 |
| `/api/alerts` | 🟢 低 | ✅ 已修正 | 已用 anon client |
