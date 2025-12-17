# Supabase 管理員權限設定指南 (Admin Guide)

由於我們已經將管理員驗證機制遷移至 Supabase 角色驗證 (Role-Based Access Control)，現在新增或移除管理員不再需要修改環境變數 (`ADMIN_EMAILS`)，而是直接在資料庫中設定用戶的 `role`。

## 基本概念

- **Admin**: 擁有後台登入與 API (如 `/api/admin/*`) 的存取權限。
- **Role 欄位**: 位於 `auth.users` 表中的 `raw_app_meta_data` JSON 欄位。
- **權限值**:
  - `admin`: 一般管理員
  - `super_admin`: 超級管理員 (目前權限相同，預留未來擴充)

## 如何新增管理員 (Add Admin)

最安全且推薦的方式是使用 Supabase 的 SQL Editor 執行指令。

### 1. 登入 Supabase Dashboard

進入專案的 **SQL Editor**。

### 2. 執行更新指令

將下方 SQL 中的 `target@email.com` 替換成您要設為管理員的 Email。

```sql
UPDATE auth.users
SET raw_app_meta_data = 
  CASE 
    WHEN raw_app_meta_data IS NULL THEN '{"role": "admin"}'::jsonb
    ELSE raw_app_meta_data || '{"role": "admin"}'::jsonb
  END
WHERE email = 'target@email.com';
```

### 3. (選用) 移除管理員權限

若要移除權限，將 `role` 設為 `user` 或移除該 key。

```sql
UPDATE auth.users
SET raw_app_meta_data = raw_app_meta_data - 'role'
WHERE email = 'target@email.com';
```

## 驗證方式

設定完成後，請該用戶：

1. 登出並重新登入網站。
2. 訪問 `/admin` 頁面，應該能順利進入。
