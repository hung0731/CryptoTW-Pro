'use client'

import React, { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Loader2, RefreshCw, AlertCircle, CheckCircle, Info, ShieldAlert, Terminal } from 'lucide-react'

interface SystemLog {
    id: string
    level: 'info' | 'warning' | 'error' | 'success'
    module: string
    message: string
    metadata: any
    created_at: string
}

export default function SystemLogsPage() {
    const [logs, setLogs] = useState<SystemLog[]>([])
    const [loading, setLoading] = useState(true)
    const [filterLevel, setFilterLevel] = useState('all')

    const fetchLogs = async () => {
        setLoading(true)
        try {
            const url = filterLevel === 'all'
                ? '/api/admin/logs'
                : `/api/admin/logs?level=${filterLevel}`

            const res = await fetch(url)
            const data = await res.json()
            if (data.logs) {
                setLogs(data.logs)
            }
        } catch (e) {
            console.error(e)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchLogs()
    }, [filterLevel])

    const getLevelIcon = (level: string) => {
        switch (level) {
            case 'error': return <ShieldAlert className="h-4 w-4 text-red-500" />
            case 'warning': return <AlertCircle className="h-4 w-4 text-yellow-500" />
            case 'success': return <CheckCircle className="h-4 w-4 text-green-500" />
            default: return <Info className="h-4 w-4 text-blue-500" />
        }
    }

    const getLevelBadge = (level: string) => {
        switch (level) {
            case 'error': return 'bg-red-500/10 text-red-500 border-red-500/20'
            case 'warning': return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
            case 'success': return 'bg-green-500/10 text-green-500 border-green-500/20'
            default: return 'bg-blue-500/10 text-blue-500 border-blue-500/20'
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-2">
                        <Terminal className="h-8 w-8 text-neutral-400" />
                        系統日誌
                    </h1>
                    <p className="text-neutral-400 mt-1">追蹤系統運行狀態與錯誤記錄</p>
                </div>
                <div className="flex items-center gap-2">
                    <Select value={filterLevel} onValueChange={setFilterLevel}>
                        <SelectTrigger className="w-[120px] bg-neutral-900 border-white/10 text-white">
                            <SelectValue placeholder="All Levels" />
                        </SelectTrigger>
                        <SelectContent className="bg-neutral-900 border-white/10">
                            <SelectItem value="all">所有層級</SelectItem>
                            <SelectItem value="error">Error</SelectItem>
                            <SelectItem value="warning">Warning</SelectItem>
                            <SelectItem value="info">Info</SelectItem>
                            <SelectItem value="success">Success</SelectItem>
                        </SelectContent>
                    </Select>
                    <Button variant="ghost" size="icon" onClick={fetchLogs} className="text-neutral-400 hover:text-white">
                        <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                    </Button>
                </div>
            </div>

            <Card className="bg-neutral-900/50 border-white/5">
                <CardHeader>
                    <CardTitle className="text-white">最新日誌 (Live Logs)</CardTitle>
                    <CardDescription className="text-neutral-400">顯示最近 50 筆活動記錄</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                    <ScrollArea className="h-[600px]">
                        <div className="divide-y divide-white/5">
                            {loading ? (
                                <div className="flex items-center justify-center py-12 text-neutral-500">
                                    <Loader2 className="h-6 w-6 animate-spin mr-2" />
                                    Loading logs...
                                </div>
                            ) : logs.length === 0 ? (
                                <div className="text-center py-12 text-neutral-500">
                                    尚無日誌記錄
                                </div>
                            ) : (
                                logs.map(log => (
                                    <div key={log.id} className="p-4 hover:bg-white/5 transition-colors font-mono text-sm">
                                        <div className="flex items-start gap-3">
                                            <div className="mt-0.5">{getLevelIcon(log.level)}</div>
                                            <div className="flex-1 space-y-1">
                                                <div className="flex items-center gap-2">
                                                    <Badge variant="outline" className={`uppercase text-[10px] ${getLevelBadge(log.level)}`}>
                                                        {log.level}
                                                    </Badge>
                                                    <span className="text-neutral-500 text-xs">
                                                        [{log.module}]
                                                    </span>
                                                    <span className="text-neutral-500 text-xs ml-auto">
                                                        {new Date(log.created_at).toLocaleString('zh-TW')}
                                                    </span>
                                                </div>
                                                <p className="text-neutral-300 break-all">{log.message}</p>
                                                {log.metadata && Object.keys(log.metadata).length > 0 && (
                                                    <pre className="text-[10px] text-neutral-500 mt-2 bg-black/30 p-2 rounded overflow-x-auto">
                                                        {JSON.stringify(log.metadata, null, 2)}
                                                    </pre>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </ScrollArea>
                </CardContent>
            </Card>
        </div>
    )
}
