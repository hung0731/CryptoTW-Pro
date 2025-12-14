'use client'

import { useState, useEffect } from 'react'
import { RefreshCw, Trash2, Bot, Newspaper, TrendingUp, CheckCircle, AlertCircle, Loader2 } from 'lucide-react'

interface CacheStatus {
    caches: {
        market_context: {
            exists: boolean
            data: any
            description: string
        }
        ai_decision: {
            exists: boolean
            data: any
            description: string
        }
        coinglass_news: {
            exists: boolean
            itemCount: number
            description: string
        }
    }
    lastChecked: string
}

export default function AdminAIPage() {
    const [status, setStatus] = useState<CacheStatus | null>(null)
    const [loading, setLoading] = useState(true)
    const [actionLoading, setActionLoading] = useState<string | null>(null)
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

    const fetchStatus = async () => {
        try {
            const res = await fetch('/api/admin/ai')
            const json = await res.json()
            setStatus(json)
        } catch (e) {
            console.error('Fetch error:', e)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchStatus()
    }, [])

    const handleAction = async (action: 'regenerate' | 'clear', type: string) => {
        setActionLoading(`${action}-${type}`)
        setMessage(null)

        try {
            const res = await fetch('/api/admin/ai', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action, type })
            })
            const json = await res.json()

            if (json.success) {
                setMessage({ type: 'success', text: json.message })
                fetchStatus() // Refresh status
            } else {
                setMessage({ type: 'error', text: json.error || '操作失敗' })
            }
        } catch (e: any) {
            setMessage({ type: 'error', text: e.message })
        } finally {
            setActionLoading(null)
        }
    }

    const cards = [
        {
            id: 'market_context',
            title: 'AI 新聞懶人包',
            description: '快訊頁面的 10 則排序新聞',
            icon: Newspaper,
            color: 'blue',
            data: status?.caches.market_context
        },
        {
            id: 'ai_decision',
            title: 'AI 市場決策',
            description: '首頁的市場判讀結論',
            icon: TrendingUp,
            color: 'purple',
            data: status?.caches.ai_decision
        }
    ]

    return (
        <div className="p-6 max-w-4xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <Bot className="w-6 h-6 text-blue-400" />
                    <h1 className="text-xl font-bold text-white">AI 內容管理</h1>
                </div>
                <button
                    onClick={() => handleAction('regenerate', 'all')}
                    disabled={actionLoading !== null}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white text-sm font-medium disabled:opacity-50"
                >
                    {actionLoading === 'regenerate-all' ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                        <RefreshCw className="w-4 h-4" />
                    )}
                    重新生成全部
                </button>
            </div>

            {/* Message */}
            {message && (
                <div className={`mb-4 p-3 rounded-lg flex items-center gap-2 ${message.type === 'success' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                    }`}>
                    {message.type === 'success' ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                    <span className="text-sm">{message.text}</span>
                </div>
            )}

            {/* Cards */}
            <div className="grid gap-4">
                {cards.map(card => (
                    <div
                        key={card.id}
                        className="bg-neutral-900/50 border border-white/10 rounded-xl p-5"
                    >
                        <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <div className={`p-2 rounded-lg bg-${card.color}-500/20`}>
                                    <card.icon className={`w-5 h-5 text-${card.color}-400`} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-white">{card.title}</h3>
                                    <p className="text-xs text-neutral-500">{card.description}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                {card.data?.exists ? (
                                    <span className="px-2 py-0.5 bg-green-500/20 text-green-400 text-xs rounded">已快取</span>
                                ) : (
                                    <span className="px-2 py-0.5 bg-neutral-700 text-neutral-400 text-xs rounded">無快取</span>
                                )}
                            </div>
                        </div>

                        {/* Preview */}
                        {card.data?.exists && card.data?.data && (
                            <div className="bg-neutral-800/50 rounded-lg p-3 mb-4 max-h-40 overflow-auto">
                                {card.id === 'market_context' && (
                                    <div>
                                        <p className="text-sm text-white mb-2">{card.data.data.summary}</p>
                                        <p className="text-xs text-neutral-500">
                                            {card.data.data.highlights?.length || 0} 則新聞
                                        </p>
                                    </div>
                                )}
                                {card.id === 'ai_decision' && (
                                    <div>
                                        <p className="text-sm text-white mb-1">{card.data.data.conclusion}</p>
                                        <p className="text-xs text-neutral-400">{card.data.data.action}</p>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Actions */}
                        <div className="flex gap-2">
                            <button
                                onClick={() => handleAction('regenerate', card.id)}
                                disabled={actionLoading !== null}
                                className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 rounded-lg text-sm font-medium disabled:opacity-50"
                            >
                                {actionLoading === `regenerate-${card.id}` ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                    <RefreshCw className="w-4 h-4" />
                                )}
                                重新生成
                            </button>
                            <button
                                onClick={() => handleAction('clear', card.id)}
                                disabled={actionLoading !== null}
                                className="px-3 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-lg text-sm disabled:opacity-50"
                            >
                                {actionLoading === `clear-${card.id}` ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                    <Trash2 className="w-4 h-4" />
                                )}
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Footer */}
            <div className="mt-6 text-center text-xs text-neutral-500">
                快取為記憶體快取，伺服器重啟後會清除
            </div>
        </div>
    )
}
