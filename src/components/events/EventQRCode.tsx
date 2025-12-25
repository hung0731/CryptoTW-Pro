'use client';

import React, { useEffect, useRef } from 'react';
import { QrCode, Download } from 'lucide-react';
import { cn } from '@/lib/utils';

interface EventQRCodeProps {
    url: string;
    title: string;
    size?: number;
    className?: string;
}

export function EventQRCode({ url, title, size = 128, className }: EventQRCodeProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [qrLoaded, setQrLoaded] = React.useState(false);

    useEffect(() => {
        const loadQR = async () => {
            try {
                // Dynamically import QRCode library
                const QRCode = (await import('qrcode')).default;

                if (canvasRef.current) {
                    const fullUrl = typeof window !== 'undefined'
                        ? `${window.location.origin}${url}`
                        : url;

                    await QRCode.toCanvas(canvasRef.current, fullUrl, {
                        width: size,
                        margin: 2,
                        color: {
                            dark: '#ffffff',
                            light: '#000000',
                        },
                    });
                    setQrLoaded(true);
                }
            } catch (e) {
                console.error('QR Code generation failed:', e);
            }
        };

        void loadQR();
    }, [url, size]);

    const handleDownload = () => {
        if (canvasRef.current) {
            const link = document.createElement('a');
            link.download = `${title.replace(/\s+/g, '_')}_QR.png`;
            link.href = canvasRef.current.toDataURL('image/png');
            link.click();
        }
    };

    return (
        <div className={cn("flex flex-col items-center gap-3", className)}>
            <div className="relative">
                {!qrLoaded && (
                    <div
                        className="absolute inset-0 bg-[#1A1A1A] rounded-lg animate-pulse flex items-center justify-center"
                        style={{ width: size, height: size }}
                    >
                        <QrCode className="w-8 h-8 text-[#333]" />
                    </div>
                )}
                <canvas
                    ref={canvasRef}
                    className={cn("rounded-lg", !qrLoaded && "opacity-0")}
                />
            </div>

            {qrLoaded && (
                <button
                    onClick={handleDownload}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#1A1A1A] text-[#888] hover:text-white hover:bg-[#2A2A2A] transition-colors text-xs"
                >
                    <Download className="w-3 h-3" />
                    下載 QR Code
                </button>
            )}
        </div>
    );
}
