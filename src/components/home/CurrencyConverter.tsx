'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { RefreshCw, ChevronDown, DollarSign } from 'lucide-react';
import { cn } from '@/lib/utils';
import { UniversalCard } from '@/components/ui/UniversalCard';
import { SectionHeaderCard } from '@/components/ui/SectionHeaderCard';

interface ExchangeRates {
    max: { buy: number; sell: number } | null;
    bito: { buy: number; sell: number } | null;
    hoya: { buy: number; sell: number } | null;
    btcPrice: number | null;
    ethPrice: number | null;
    usdTwd: number | null;
    updatedAt: string;
}

interface CurrencyRow {
    id: string;
    currency: string;
    value: string;
}

const AVAILABLE_CURRENCIES = [
    { key: 'BTC', label: 'BTC', icon: '₿', color: '#F7931A' },
    { key: 'ETH', label: 'ETH', icon: '⟠', color: '#627EEA' },
    { key: 'USDT', label: 'USDT', icon: '💵', color: '#26A17B' },
    { key: 'USD', label: 'USD', icon: '🇺🇸', color: '#1a5f7a' },
    { key: 'TWD', label: 'TWD', icon: '🇹🇼', color: '#de2910' },
] as const;

const DEFAULT_ROWS: CurrencyRow[] = [
    { id: '1', currency: 'TWD', value: '1000' },
    { id: '2', currency: 'USDT', value: '' },
    { id: '3', currency: 'BTC', value: '' },
    { id: '4', currency: 'USD', value: '' },
];

export function CurrencyConverter() {
    const [rows, setRows] = useState<CurrencyRow[]>(DEFAULT_ROWS);
    const [rates, setRates] = useState<ExchangeRates | null>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [activeRowId, setActiveRowId] = useState<string>('1');

    const fetchRates = async () => {
        try {
            const res = await fetch('/api/market/exchange-rates');
            if (res.ok) {
                const data = await res.json();
                setRates(data);
            }
        } catch (e) {
            console.error('Failed to fetch rates:', e);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        void fetchRates();
    }, []);

    // Convert any currency to USD as base
    const toUsd = useCallback((currency: string, value: number): number => {
        if (!rates) return 0;
        const usdtRate = rates.usdTwd || 32.5;
        const btcPrice = rates.btcPrice || 95000;
        const ethPrice = rates.ethPrice || 3300;

        switch (currency) {
            case 'USD':
            case 'USDT':
                return value;
            case 'TWD':
                return value / usdtRate;
            case 'BTC':
                return value * btcPrice;
            case 'ETH':
                return value * ethPrice;
            default:
                return value;
        }
    }, [rates]);

    // Convert USD to any currency
    const fromUsd = useCallback((currency: string, usdValue: number): number => {
        if (!rates) return 0;
        const usdtRate = rates.usdTwd || 32.5;
        const btcPrice = rates.btcPrice || 95000;
        const ethPrice = rates.ethPrice || 3300;

        switch (currency) {
            case 'USD':
            case 'USDT':
                return usdValue;
            case 'TWD':
                return usdValue * usdtRate;
            case 'BTC':
                return usdValue / btcPrice;
            case 'ETH':
                return usdValue / ethPrice;
            default:
                return usdValue;
        }
    }, [rates]);

    // Format value based on currency
    const formatValue = (currency: string, value: number): string => {
        if (isNaN(value) || value === 0) return '';
        if (currency === 'BTC') return value.toFixed(8);
        if (currency === 'ETH') return value.toFixed(6);
        if (currency === 'TWD') return value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        return value.toFixed(2);
    };

    // Handle value change - update all other rows
    const handleValueChange = (rowId: string, newValue: string) => {
        setActiveRowId(rowId);

        const row = rows.find(r => r.id === rowId);
        if (!row) return;

        // Parse the input value
        const numValue = parseFloat(newValue.replace(/,/g, '')) || 0;

        // Convert to USD as base
        const usdValue = toUsd(row.currency, numValue);

        // Update all rows
        setRows(prevRows => prevRows.map(r => {
            if (r.id === rowId) {
                return { ...r, value: newValue };
            }
            const convertedValue = fromUsd(r.currency, usdValue);
            return { ...r, value: formatValue(r.currency, convertedValue) };
        }));
    };

    // Handle currency change for a row
    const handleCurrencyChange = (rowId: string, newCurrency: string) => {
        // Find the active row's USD value
        const activeRow = rows.find(r => r.id === activeRowId);
        if (!activeRow) return;

        const activeValue = parseFloat(activeRow.value.replace(/,/g, '')) || 0;
        const usdValue = toUsd(activeRow.currency, activeValue);

        // Update the row's currency and recalculate its value
        setRows(prevRows => prevRows.map(r => {
            if (r.id === rowId) {
                const convertedValue = fromUsd(newCurrency, usdValue);
                return { ...r, currency: newCurrency, value: formatValue(newCurrency, convertedValue) };
            }
            return r;
        }));
    };

    // Recalculate when rates change
    useEffect(() => {
        if (!rates) return;

        const activeRow = rows.find(r => r.id === activeRowId);
        if (activeRow && activeRow.value) {
            handleValueChange(activeRowId, activeRow.value);
        }
    }, [rates]);

    const handleRefresh = () => {
        setRefreshing(true);
        void fetchRates();
    };

    // Find best exchange rate
    const bestRate = useMemo(() => {
        if (!rates) return null;
        const exchangeRates = [
            { name: 'MAX', buy: rates.max?.buy, sell: rates.max?.sell },
            { name: 'BitoPro', buy: rates.bito?.buy, sell: rates.bito?.sell },
            { name: 'HoyaBit', buy: rates.hoya?.buy, sell: rates.hoya?.sell }
        ].filter(e => e.buy && e.sell);

        if (exchangeRates.length === 0) return null;

        const bestBuy = exchangeRates.reduce((best, curr) =>
            (curr.buy! < best.buy!) ? curr : best
        );

        return { bestBuy, all: exchangeRates };
    }, [rates]);

    if (loading) {
        return (
            <UniversalCard variant="default" className="p-0 overflow-hidden">
                <div className="border-b border-[#1A1A1A] bg-[#0F0F10]">
                    <SectionHeaderCard title="匯率換算" icon={DollarSign} />
                </div>
                <div className="p-4 animate-pulse space-y-3">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="h-14 bg-[#1A1A1A] rounded-xl" />
                    ))}
                </div>
            </UniversalCard>
        );
    }

    return (
        <UniversalCard variant="default" className="p-0 overflow-hidden">
            {/* Header */}
            <div className="border-b border-[#1A1A1A] bg-[#0F0F10]">
                <SectionHeaderCard
                    title="匯率換算"
                    icon={DollarSign}
                    rightElement={
                        <button
                            onClick={handleRefresh}
                            disabled={refreshing}
                            className="p-1.5 rounded-lg hover:bg-[#1A1A1A] transition-colors"
                        >
                            <RefreshCw className={cn("w-4 h-4 text-[#666]", refreshing && "animate-spin")} />
                        </button>
                    }
                />
            </div>

            <div className="p-4 space-y-2">
                {/* Currency Rows */}
                {rows.map((row) => {
                    const currencyInfo = AVAILABLE_CURRENCIES.find(c => c.key === row.currency);

                    return (
                        <div
                            key={row.id}
                            className={cn(
                                "flex items-center gap-2 bg-[#0A0A0A] rounded-xl border transition-all",
                                activeRowId === row.id ? "border-blue-500/50" : "border-[#1A1A1A]"
                            )}
                        >
                            {/* Currency Selector */}
                            <div className="relative flex-shrink-0">
                                <select
                                    value={row.currency}
                                    onChange={(e) => handleCurrencyChange(row.id, e.target.value)}
                                    className="appearance-none bg-transparent pl-4 pr-8 py-4 text-white font-medium cursor-pointer focus:outline-none"
                                >
                                    {AVAILABLE_CURRENCIES.map(c => (
                                        <option key={c.key} value={c.key}>
                                            {c.icon} {c.label}
                                        </option>
                                    ))}
                                </select>
                                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-[#666] pointer-events-none" />
                            </div>

                            {/* Value Input */}
                            <input
                                type="text"
                                value={row.value}
                                onChange={(e) => handleValueChange(row.id, e.target.value)}
                                onFocus={() => setActiveRowId(row.id)}
                                placeholder="0"
                                className="flex-1 min-w-0 bg-transparent text-right px-4 py-4 text-white text-lg font-mono focus:outline-none"
                            />
                        </div>
                    );
                })}

                {/* Exchange Rate Comparison */}
                {bestRate && (
                    <div className="pt-3 border-t border-[#1A1A1A] mt-4">
                        <p className="text-xs text-[#666] mb-2">USDT / TWD 即時報價</p>
                        <div className="grid grid-cols-3 gap-2 text-center">
                            {(() => {
                                const prices = bestRate.all.map(e => e.buy!).filter(Boolean);
                                const minPrice = Math.min(...prices);
                                const maxPrice = Math.max(...prices);

                                return bestRate.all.map(exchange => {
                                    const isLowest = exchange.buy === minPrice;
                                    const isHighest = exchange.buy === maxPrice && minPrice !== maxPrice;

                                    return (
                                        <div
                                            key={exchange.name}
                                            className={cn(
                                                "rounded-lg p-2 border",
                                                isLowest ? "bg-green-500/10 border-green-500/30" :
                                                    isHighest ? "bg-red-500/10 border-red-500/30" :
                                                        "bg-[#0A0A0A] border-transparent"
                                            )}
                                        >
                                            <p className="text-[10px] text-[#888]">{exchange.name}</p>
                                            <p className={cn(
                                                "text-xs sm:text-sm font-bold font-mono truncate",
                                                isLowest ? "text-green-400" :
                                                    isHighest ? "text-red-400" :
                                                        "text-white"
                                            )}>
                                                {exchange.buy?.toFixed(2) || '--'}
                                            </p>
                                        </div>
                                    );
                                });
                            })()}
                        </div>
                        <div className="flex justify-center gap-4 mt-2 text-[10px]">
                            <span className="text-green-400">🟢 最低價</span>
                            <span className="text-red-400">🔴 最高價</span>
                        </div>
                    </div>
                )}
            </div>
        </UniversalCard>
    );
}
