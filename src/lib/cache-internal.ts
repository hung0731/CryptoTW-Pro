/**
 * Redis 內部工具
 * 提供對 Redis 實例的訪問，避免循環依賴
 */

import Redis from 'ioredis'

// 從環境變數獲取 Redis URL
const REDIS_URL = process.env.REDIS_URL || process.env.REDIS_URI || process.env.REDIS_CONNECTION_STRING

// 導出 redis 實例供其他模組使用
export let redis: Redis | null = null

// 從 cache.ts 取得 redis 實例的方式
// 這個檔案只是為了避免循環依賴
export function setRedisInstance(instance: Redis | null) {
    redis = instance
}

export function getRedisInstance(): Redis | null {
    return redis
}

export { REDIS_URL }
