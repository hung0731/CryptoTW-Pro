'use client';

import React from 'react';
import { MapPin, Navigation } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface MapEmbedProps {
    latitude?: number;
    longitude?: number;
    venue_name?: string;
    address?: string;
    city?: string;
}

export function MapEmbed({ latitude, longitude, venue_name, address, city }: MapEmbedProps) {
    if (!latitude || !longitude) {
        // Fallback: show address without map
        const fullAddress = [venue_name, address, city].filter(Boolean).join(', ');
        if (!fullAddress) return null;

        return (
            <div className="rounded-xl bg-[#0A0A0A] border border-[#1A1A1A] p-4">
                <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-[#1A1A1A] flex items-center justify-center flex-shrink-0">
                        <MapPin className="w-5 h-5 text-blue-400" />
                    </div>
                    <div>
                        <h4 className="text-sm font-medium text-white mb-1">活動地點</h4>
                        <p className="text-sm text-[#888]">{fullAddress}</p>
                    </div>
                </div>
            </div>
        );
    }

    const mapUrl = `https://www.google.com/maps?q=${latitude},${longitude}`;
    const embedUrl = `https://www.google.com/maps/embed/v1/place?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ''}&q=${latitude},${longitude}&zoom=15`;

    // If no API key, show static link
    if (!process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY) {
        const fullAddress = [venue_name, address, city].filter(Boolean).join(', ');

        return (
            <div className="rounded-xl bg-[#0A0A0A] border border-[#1A1A1A] overflow-hidden">
                {/* Static Map Preview using coordinates */}
                <a
                    href={mapUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block relative h-40 bg-gradient-to-br from-[#1A1A1A] to-[#0A0A0A] group"
                >
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-center">
                            <MapPin className="w-8 h-8 text-blue-400 mx-auto mb-2" />
                            <span className="text-xs text-[#666] group-hover:text-white transition-colors">
                                點擊在 Google Maps 開啟
                            </span>
                        </div>
                    </div>
                </a>

                <div className="p-4 border-t border-[#1A1A1A]">
                    <div className="flex items-center justify-between">
                        <div>
                            {venue_name && <p className="text-sm font-medium text-white">{venue_name}</p>}
                            {(address || city) && (
                                <p className="text-xs text-[#666] mt-0.5">
                                    {[address, city].filter(Boolean).join(', ')}
                                </p>
                            )}
                        </div>
                        <a href={mapUrl} target="_blank" rel="noopener noreferrer">
                            <Button size="sm" variant="outline" className="gap-2 border-white/10 hover:bg-white/5">
                                <Navigation className="w-3.5 h-3.5" />
                                導航
                            </Button>
                        </a>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="rounded-xl bg-[#0A0A0A] border border-[#1A1A1A] overflow-hidden">
            <iframe
                src={embedUrl}
                className="w-full h-48 border-0"
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
            />
            <div className="p-4 border-t border-[#1A1A1A]">
                <div className="flex items-center justify-between">
                    <div>
                        {venue_name && <p className="text-sm font-medium text-white">{venue_name}</p>}
                        {(address || city) && (
                            <p className="text-xs text-[#666] mt-0.5">
                                {[address, city].filter(Boolean).join(', ')}
                            </p>
                        )}
                    </div>
                    <a href={mapUrl} target="_blank" rel="noopener noreferrer">
                        <Button size="sm" variant="outline" className="gap-2 border-white/10 hover:bg-white/5">
                            <Navigation className="w-3.5 h-3.5" />
                            導航
                        </Button>
                    </a>
                </div>
            </div>
        </div>
    );
}
