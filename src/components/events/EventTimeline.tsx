'use client';

import React from 'react';
import { Clock, MapPin, User } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface TimelineItem {
    time: string;          // "14:00" or "14:00-15:00"
    title: string;
    description?: string;
    speaker?: string;
    location?: string;
    type?: 'talk' | 'break' | 'networking' | 'workshop' | 'other';
}

interface EventTimelineProps {
    items: TimelineItem[];
    date?: string;          // Optional date header "2024/12/28"
}

const TYPE_STYLES: Record<string, { bg: string; border: string; dot: string }> = {
    talk: { bg: 'bg-blue-500/10', border: 'border-blue-500/30', dot: 'bg-blue-500' },
    workshop: { bg: 'bg-purple-500/10', border: 'border-purple-500/30', dot: 'bg-purple-500' },
    networking: { bg: 'bg-green-500/10', border: 'border-green-500/30', dot: 'bg-green-500' },
    break: { bg: 'bg-orange-500/10', border: 'border-orange-500/30', dot: 'bg-orange-500' },
    other: { bg: 'bg-neutral-500/10', border: 'border-neutral-500/30', dot: 'bg-neutral-500' }
};

export function EventTimeline({ items, date }: EventTimelineProps) {
    if (!items || items.length === 0) return null;

    return (
        <div className="relative">
            {/* Date Header */}
            {date && (
                <div className="flex items-center gap-2 mb-4">
                    <Clock className="w-4 h-4 text-blue-400" />
                    <span className="text-sm font-medium text-white">{date}</span>
                </div>
            )}

            {/* Timeline */}
            <div className="relative pl-6">
                {/* Vertical Line */}
                <div className="absolute left-[7px] top-2 bottom-2 w-px bg-[#2A2A2A]" />

                {/* Timeline Items */}
                <div className="space-y-4">
                    {items.map((item, index) => {
                        const styles = TYPE_STYLES[item.type || 'other'];

                        return (
                            <div key={index} className="relative group">
                                {/* Dot */}
                                <div className={cn(
                                    "absolute -left-6 top-3 w-3.5 h-3.5 rounded-full border-2 border-black z-10 transition-all",
                                    styles.dot,
                                    "group-hover:scale-125"
                                )} />

                                {/* Content Card */}
                                <div className={cn(
                                    "rounded-lg border p-3 transition-all",
                                    styles.bg,
                                    styles.border,
                                    "hover:bg-opacity-20"
                                )}>
                                    {/* Time */}
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="text-xs font-mono text-blue-400 font-medium">
                                            {item.time}
                                        </span>
                                        {item.type && item.type !== 'other' && (
                                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/5 text-[#888] capitalize">
                                                {item.type}
                                            </span>
                                        )}
                                    </div>

                                    {/* Title */}
                                    <h4 className="text-sm font-medium text-white mb-1">
                                        {item.title}
                                    </h4>

                                    {/* Description */}
                                    {item.description && (
                                        <p className="text-xs text-[#888] mb-2 line-clamp-2">
                                            {item.description}
                                        </p>
                                    )}

                                    {/* Meta */}
                                    <div className="flex items-center gap-3 text-[10px] text-[#666]">
                                        {item.speaker && (
                                            <span className="flex items-center gap-1">
                                                <User className="w-3 h-3" />
                                                {item.speaker}
                                            </span>
                                        )}
                                        {item.location && (
                                            <span className="flex items-center gap-1">
                                                <MapPin className="w-3 h-3" />
                                                {item.location}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
