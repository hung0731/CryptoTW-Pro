'use client';

import React, { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { UploadCloud, X, Loader2, Image as ImageIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import Image from 'next/image';

interface ImageUploaderProps {
    value?: string;
    onChange: (url: string) => void;
    placeholder?: string;
    className?: string;
    aspectRatio?: 'video' | 'square' | 'wide';
}

export function ImageUploader({
    value,
    onChange,
    placeholder = "點擊或拖曳上傳圖片",
    className,
    aspectRatio = 'video'
}: ImageUploaderProps) {
    const [uploading, setUploading] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('bucket', 'images'); // Default bucket

            const res = await fetch('/api/upload', {
                method: 'POST',
                body: formData
            });

            if (!res.ok) {
                const error = await res.json();
                throw new Error(error.error || 'Upload failed');
            }

            const data = await res.json();
            onChange(data.url);
        } catch (error) {
            console.error(error);
            alert('上傳失敗，請重試 (確認圖片小於 10MB)');
        } finally {
            setUploading(false);
            // Reset input
            if (inputRef.current) inputRef.current.value = '';
        }
    };

    const handleDrop = async (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();

        const file = e.dataTransfer.files?.[0];
        if (!file) return;

        // Reuse upload logic (duplicate for now for simplicity or extract)
        setUploading(true);
        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('bucket', 'images');

            const res = await fetch('/api/upload', {
                method: 'POST',
                body: formData
            });

            if (!res.ok) throw new Error('Upload failed');
            const data = await res.json();
            onChange(data.url);
        } catch (error) {
            alert('上傳失敗');
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className={cn("space-y-2", className)}>
            {value ? (
                <div className={cn(
                    "relative rounded-xl overflow-hidden border border-white/10 bg-neutral-900 group",
                    aspectRatio === 'video' ? 'aspect-video' : aspectRatio === 'square' ? 'aspect-square' : 'aspect-[21/9]'
                )}>
                    <Image
                        src={value}
                        alt="Uploaded content"
                        fill
                        className="object-cover"
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            className="bg-red-500/80 hover:bg-red-600"
                            onClick={() => onChange('')}
                        >
                            <X className="w-4 h-4" />
                        </Button>
                    </div>
                </div>
            ) : (
                <div
                    onClick={() => inputRef.current?.click()}
                    onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
                    onDrop={handleDrop}
                    className={cn(
                        "relative flex flex-col items-center justify-center border-2 border-dashed border-white/10 rounded-xl bg-white/5 hover:bg-white/10 hover:border-white/20 transition-all cursor-pointer group",
                        aspectRatio === 'video' ? 'aspect-video' : aspectRatio === 'square' ? 'aspect-square' : 'aspect-[21/9]'
                    )}
                >
                    <input
                        ref={inputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleFileChange}
                    />

                    {uploading ? (
                        <div className="flex flex-col items-center gap-2 text-neutral-400">
                            <Loader2 className="w-8 h-8 animate-spin" />
                            <span className="text-xs">上傳中...</span>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center gap-2 text-neutral-400 group-hover:text-white transition-colors">
                            <div className="p-3 rounded-full bg-white/5 group-hover:bg-white/10">
                                <UploadCloud className="w-6 h-6" />
                            </div>
                            <span className="text-xs font-medium">{placeholder}</span>
                            <span className="text-[10px] text-neutral-600">支援 JPG, PNG, WEBP (Max 10MB)</span>
                        </div>
                    )}
                </div>
            )}

            {/* Fallback URL input */}
            {!value && (
                <div className="flex gap-2">
                    {/* Optional: Add URL input toggle if users prefer pasting links */}
                </div>
            )}
        </div>
    );
}
