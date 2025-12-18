/**
 * API 使用量追蹤
 * 
 * 使用內存計數器追蹤 API 調用次數
 * 重啟後會重置（生產環境可改用 Redis）
 */

interface ApiCallRecord {
    count: number;
    lastCalled: Date;
    history: { timestamp: Date; count: number }[];
}

interface ApiUsageStats {
    [endpoint: string]: ApiCallRecord;
}

// 內存儲存（重啟後重置）
let apiUsageStats: ApiUsageStats = {};

// 追蹤窗口：保留最近 24 小時的記錄
const HISTORY_WINDOW_HOURS = 24;
const CLEANUP_INTERVAL_MS = 60 * 60 * 1000; // 每小時清理一次

/**
 * 記錄 API 調用
 */
export function trackApiCall(endpoint: string): void {
    const now = new Date();

    if (!apiUsageStats[endpoint]) {
        apiUsageStats[endpoint] = {
            count: 0,
            lastCalled: now,
            history: [],
        };
    }

    const record = apiUsageStats[endpoint];
    record.count += 1;
    record.lastCalled = now;

    // 添加到歷史記錄（每分鐘一個點）
    const currentMinute = Math.floor(now.getTime() / 60000);
    const lastHistory = record.history[record.history.length - 1];

    if (lastHistory && Math.floor(lastHistory.timestamp.getTime() / 60000) === currentMinute) {
        lastHistory.count += 1;
    } else {
        record.history.push({ timestamp: now, count: 1 });
    }

    // 清理超過 24 小時的記錄
    const cutoff = new Date(now.getTime() - HISTORY_WINDOW_HOURS * 60 * 60 * 1000);
    record.history = record.history.filter(h => h.timestamp > cutoff);
}

/**
 * 獲取所有 API 使用統計
 */
export function getApiUsageStats(): {
    endpoints: {
        endpoint: string;
        totalCalls: number;
        lastCalled: string;
        callsPerHour: number;
    }[];
    totalCalls: number;
} {
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);

    const endpoints = Object.entries(apiUsageStats).map(([endpoint, record]) => {
        // 計算過去一小時的調用次數
        const recentCalls = record.history
            .filter(h => h.timestamp > oneHourAgo)
            .reduce((sum, h) => sum + h.count, 0);

        return {
            endpoint,
            totalCalls: record.count,
            lastCalled: record.lastCalled.toISOString(),
            callsPerHour: recentCalls,
        };
    }).sort((a, b) => b.totalCalls - a.totalCalls);

    const totalCalls = endpoints.reduce((sum, e) => sum + e.totalCalls, 0);

    return { endpoints, totalCalls };
}

/**
 * 重置統計
 */
export function resetApiUsageStats(): void {
    apiUsageStats = {};
}

/**
 * 獲取特定端點的使用統計
 */
export function getEndpointStats(endpoint: string): ApiCallRecord | null {
    return apiUsageStats[endpoint] || null;
}
