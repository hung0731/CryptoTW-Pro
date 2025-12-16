import React from 'react';

export default function GlobalLoader() {
    return (
        <div className="fixed inset-0 z-[100] bg-black flex items-center justify-center">
            <div className="relative flex flex-col items-center">
                {/* Minimalist Logo with Breathing Effect */}
                <img
                    src="/logo.svg"
                    alt="CryptoTW"
                    className="w-16 h-16 opacity-90"
                />
            </div>
        </div>
    )
}
