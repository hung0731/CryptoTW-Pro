/**
 * 客戶端數據緩存層
 * 用於減少重複 API 請求
 */

interface CacheEntry<T> {
    data: T;
    timestamp: number;
    expiresAt: number;
}

class IndicatorCache {
    private cache = new Map<string, CacheEntry<unknown>>();
    private defaultTTL = 60 * 1000; // 60 秒

    /**
     * 獲取緩存數據
     */
    get<T>(key: string): T | null {
        const entry = this.cache.get(key);
        if (!entry) return null;

        // 檢查是否過期
        if (Date.now() > entry.expiresAt) {
            this.cache.delete(key);
            return null;
        }

        return entry.data as T;
    }

    /**
     * 設置緩存數據
     */
    set<T>(key: string, data: T, ttlMs?: number): void {
        const now = Date.now();
        this.cache.set(key, {
            data,
            timestamp: now,
            expiresAt: now + (ttlMs ?? this.defaultTTL),
        });
    }

    /**
     * 檢查緩存是否有效
     */
    has(key: string): boolean {
        return this.get(key) !== null;
    }

    /**
     * 清除特定緩存
     */
    invalidate(key: string): void {
        this.cache.delete(key);
    }

    /**
     * 清除所有緩存
     */
    clear(): void {
        this.cache.clear();
    }

    /**
     * 生成緩存鍵
     */
    static generateKey(endpoint: string, params: Record<string, string>): string {
        const sortedParams = Object.entries(params)
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([k, v]) => `${k}=${v}`)
            .join('&');
        return `${endpoint}?${sortedParams}`;
    }
}

// 單例實例
export const indicatorCache = new IndicatorCache();

/**
 * 帶緩存的 fetch 函數
 */
export async function fetchWithCache<T>(
    endpoint: string,
    params: Record<string, string> = {},
    options?: { ttlMs?: number; forceRefresh?: boolean }
): Promise<T> {
    const key = IndicatorCache.generateKey(endpoint, params);

    // 如果不強制刷新且有緩存，返回緩存
    if (!options?.forceRefresh) {
        const cached = indicatorCache.get<T>(key);
        if (cached) {
            return cached;
        }
    }

    // 構建 URL
    const url = new URL(endpoint, window.location.origin);
    Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));

    // 發送請求
    const response = await fetch(url.toString());
    if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
    }

    const data = await response.json() as T;

    // 存入緩存
    indicatorCache.set(key, data, options?.ttlMs);

    return data;
}
