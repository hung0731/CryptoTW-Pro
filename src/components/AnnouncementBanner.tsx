'use client'

import React, { useEffect, useState } from 'react'
import { AlertTriangle, Info, X } from 'lucide-react'
import { logger } from '@/lib/logger'

export default function AnnouncementBanner() {
    const [announcement, setAnnouncement] = useState<any>(null)
    const [isVisible, setIsVisible] = useState(true)

    useEffect(() => {
        const fetchAnnouncement = async () => {
            try {
                const res = await fetch('/api/announcements')
                const data = await res.json()
                if (data.announcement) {
                    setAnnouncement(data.announcement)
                }
            } catch (e) {
                logger.error('Failed to fetch announcement', e as Error, { feature: 'announcement-banner' })
            }
        }
        void fetchAnnouncement()
    }, [])

    if (!announcement || !isVisible) return null

    const getStyles = (level: string) => {
        switch (level) {
            case 'alert': return 'bg-red-500/20 backdrop-blur-md border-b border-red-500/20 text-red-200'
            case 'warning': return 'bg-yellow-500/20 backdrop-blur-md border-b border-yellow-500/20 text-yellow-200'
            case 'info': default: return 'bg-indigo-500/20 backdrop-blur-md border-b border-indigo-500/20 text-indigo-200'
        }
    }

    return (
        <div className={`w-full px-4 py-3 flex items-center justify-between text-sm font-medium ${getStyles(announcement.level)}`}>
            <div className="flex items-center gap-2 mx-auto">
                {announcement.level === 'alert' && <AlertTriangle className="h-4 w-4" />}
                {announcement.level === 'warning' && <AlertTriangle className="h-4 w-4" />}
                {announcement.level === 'info' && <Info className="h-4 w-4" />}
                <span>{announcement.message}</span>
            </div>
            <button onClick={() => setIsVisible(false)} className="hover:opacity-80">
                <X className="h-4 w-4" />
            </button>
        </div>
    )
}
