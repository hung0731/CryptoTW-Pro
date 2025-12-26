'use client';

import React, { useState, useEffect } from 'react';
import { logger } from '@/lib/logger';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Plus, Search, Edit, Trash2, Calendar, Filter, Upload, FileUp, Loader2, Gift, ExternalLink, Bot, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { ImageUploader } from '@/components/ui/ImageUploader';
import Link from 'next/link';

interface RewardItem {
    id: string;
    title: string;
    slug: string;
    description: string;
    reward_type: string;
    source: string;
    source_name: string;
    source_logo_url: string;
    start_date: string;
    end_date: string;
    is_ongoing: boolean;
    reward_value: string;
    requirements: string;
    difficulty: string;
    action_url: string;
    action_label: string;
    is_featured: boolean;
    is_published: boolean;
    view_count: number;
    claim_count: number;
}

export function RewardsTab() {
    const [rewards, setRewards] = useState<RewardItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        title: '',
        slug: '',
        description: '',
        reward_type: 'exchange_promo',
        source: 'exchange',
        source_name: '',
        source_logo_url: '',
        start_date: '',
        end_date: '',
        is_ongoing: false,
        reward_value: '',
        requirements: '',
        difficulty: 'easy',
        action_url: '',
        action_label: '立即參加',
        is_featured: false,
        is_published: false
    });
    const [saving, setSaving] = useState(false);
    const { toast } = useToast();

    const fetchRewards = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/admin/rewards');
            if (res.ok) {
                const data = await res.json();
                setRewards(data.rewards || []);
            }
        } catch (e) {
            console.error(e);
            toast({ title: '無法載入福利列表', variant: 'destructive' });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        void fetchRewards();
    }, []);

    const resetForm = () => {
        setFormData({
            title: '',
            slug: '',
            description: '',
            reward_type: 'exchange_promo',
            source: 'exchange',
            source_name: '',
            source_logo_url: '',
            start_date: new Date().toISOString().slice(0, 16),
            end_date: '',
            is_ongoing: false,
            reward_value: '',
            requirements: '',
            difficulty: 'easy',
            action_url: '',
            action_label: '立即參加',
            is_featured: false,
            is_published: false
        });
        setEditingId(null);
        setShowForm(false);
    };

    const handleEdit = (item: RewardItem) => {
        setFormData({
            title: item.title,
            slug: item.slug,
            description: item.description || '',
            reward_type: item.reward_type,
            source: item.source,
            source_name: item.source_name,
            source_logo_url: item.source_logo_url || '',
            start_date: item.start_date ? new Date(item.start_date).toISOString().slice(0, 16) : '',
            end_date: item.end_date ? new Date(item.end_date).toISOString().slice(0, 16) : '',
            is_ongoing: item.is_ongoing,
            reward_value: item.reward_value || '',
            requirements: item.requirements || '',
            difficulty: item.difficulty || 'easy',
            action_url: item.action_url,
            action_label: item.action_label,
            is_featured: item.is_featured,
            is_published: item.is_published
        });
        setEditingId(item.id);
        setShowForm(true);
    };

    const handleSave = async () => {
        if (!formData.title || !formData.slug || !formData.action_url) {
            toast({ title: '請填寫必填欄位', variant: 'destructive' });
            return;
        }

        setSaving(true);
        try {
            const payload = {
                ...formData,
                start_date: new Date(formData.start_date).toISOString(),
                end_date: formData.end_date ? new Date(formData.end_date).toISOString() : null,
            };

            const url = editingId ? `/api/admin/rewards/${editingId}` : '/api/admin/rewards';
            const method = editingId ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                toast({ title: editingId ? '更新成功' : '新增成功' });
                resetForm();
                void fetchRewards();
            } else {
                toast({ title: '儲存失敗', variant: 'destructive' });
            }
        } catch (e) {
            toast({ title: '發生錯誤', variant: 'destructive' });
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('確定要刪除嗎？')) return;
        try {
            await fetch(`/api/admin/rewards/${id}`, { method: 'DELETE' });
            void fetchRewards();
        } catch (e) {
            toast({ title: '刪除失敗', variant: 'destructive' });
        }
    };

    const [showAiImport, setShowAiImport] = useState(false);
    const [importUrl, setImportUrl] = useState('');
    const [analyzing, setAnalyzing] = useState(false);
    const [importedReward, setImportedReward] = useState<any>(null);

    const handleAnalyze = async () => {
        if (!importUrl) return;
        setAnalyzing(true);
        setImportedReward(null);

        try {
            const res = await fetch('/api/admin/rewards/import', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ raw_content: importUrl })
            });
            const data = await res.json();
            if (data.success) {
                setImportedReward(data.reward);
                toast({ title: '解析成功' });
            } else {
                toast({ title: '解析失敗', description: data.error, variant: 'destructive' });
            }
        } catch (e) {
            toast({ title: '解析錯誤', variant: 'destructive' });
        } finally {
            setAnalyzing(false);
        }
    };

    const handleConfirmImport = () => {
        if (!importedReward) return;
        setFormData({
            title: importedReward.title || '',
            slug: importedReward.slug || '',
            description: importedReward.description || '',
            reward_type: importedReward.reward_type || 'exchange_promo',
            source: importedReward.source || 'exchange',
            source_name: importedReward.source_name || '',
            source_logo_url: importedReward.source_logo_url || '',
            start_date: importedReward.start_date ? new Date(importedReward.start_date).toISOString().slice(0, 16) : new Date().toISOString().slice(0, 16),
            end_date: importedReward.end_date ? new Date(importedReward.end_date).toISOString().slice(0, 16) : '',
            is_ongoing: importedReward.is_ongoing || false,
            reward_value: importedReward.reward_value || '',
            requirements: importedReward.requirements || '',
            difficulty: importedReward.difficulty || 'easy',
            action_url: importedReward.action_url || '',
            action_label: importedReward.action_label || '立即參加',
            is_featured: false,
            is_published: false
        });
        setImportedReward(null);
        setImportUrl('');
        setShowAiImport(false);
        setShowForm(true);
        toast({ title: '匯入完成，請檢查並儲存' });
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <CardDescription>管理福利中心內容</CardDescription>
                <div className="flex gap-2">
                    <Button variant="ghost" size="icon" onClick={() => void fetchRewards()}>
                        <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                    </Button>
                    <Button onClick={() => { setShowAiImport(!showAiImport); setShowForm(false); }} variant="outline" className="border-green-600/50 text-green-500 hover:bg-green-600/10">
                        <Bot className="w-4 h-4 mr-2" />
                        AI 智慧匯入
                    </Button>
                    <Button onClick={() => { resetForm(); setShowForm(true); setShowAiImport(false); }} className="bg-purple-600 hover:bg-purple-500 text-white">
                        <Plus className="w-4 h-4 mr-2" />
                        新增福利
                    </Button>
                </div>
            </div>

            {showAiImport && (
                <Card className="bg-neutral-900 border-green-900/50 border">
                    <CardHeader>
                        <CardTitle className="text-base text-green-400 flex items-center gap-2">
                            <Bot className="w-4 h-4" />
                            AI 智慧活動匯入
                        </CardTitle>
                        <CardDescription>貼上活動網址或文案，AI 自動解析欄位</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex gap-2">
                            <Input
                                value={importUrl}
                                onChange={e => setImportUrl(e.target.value)}
                                placeholder="請貼上活動網址、官網文案或 Telegram 公告..."
                                className="bg-black border-white/10"
                            />
                            <Button onClick={handleAnalyze} disabled={analyzing || !importUrl} className="bg-green-600 hover:bg-green-500 text-white shrink-0">
                                {analyzing ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Bot className="w-4 h-4 mr-2" />}
                                解析
                            </Button>
                        </div>

                        {importedReward && (
                            <div className="bg-black/50 border border-green-500/30 rounded-lg p-4 space-y-4">
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div><span className="text-neutral-500">來源：</span> <span className="text-white">{importedReward.source_name}</span></div>
                                    <div><span className="text-neutral-500">類型：</span> <span className="text-white">{importedReward.reward_type}</span></div>
                                    <div><span className="text-neutral-500">標題：</span> <span className="text-white">{importedReward.title}</span></div>
                                    <div><span className="text-neutral-500">價值：</span> <span className="text-yellow-500">{importedReward.reward_value}</span></div>
                                    <div className="col-span-2 text-xs text-neutral-400 truncate">{importedReward.action_url}</div>
                                </div>
                                <div className="flex justify-end gap-2">
                                    <Button variant="ghost" size="sm" onClick={() => setImportedReward(null)}>取消</Button>
                                    <Button size="sm" onClick={handleConfirmImport} className="bg-green-600 hover:bg-green-500">確認並填入表單</Button>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}

            {showForm && (
                <Card className="bg-neutral-900 border-neutral-800">
                    <CardHeader>
                        <CardTitle className="text-base text-white">{editingId ? '編輯福利' : '新增福利'}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>標題 *</Label>
                                <Input value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} className="bg-black" />
                            </div>
                            <div className="space-y-2">
                                <Label>Slug (網址) *</Label>
                                <Input value={formData.slug} onChange={e => setFormData({ ...formData, slug: e.target.value })} className="bg-black" placeholder="binance-promo-2024" />
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <Label>類型</Label>
                                <Select value={formData.reward_type} onValueChange={v => setFormData({ ...formData, reward_type: v })}>
                                    <SelectTrigger className="bg-black"><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="exchange_promo">交易所福利</SelectItem>
                                        <SelectItem value="raffle">抽獎活動</SelectItem>
                                        <SelectItem value="airdrop">空投領取</SelectItem>
                                        <SelectItem value="learn_earn">學習獎勵</SelectItem>
                                        <SelectItem value="referral">推薦碼</SelectItem>
                                        <SelectItem value="other">其他</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>來源類型</Label>
                                <Select value={formData.source} onValueChange={v => setFormData({ ...formData, source: v })}>
                                    <SelectTrigger className="bg-black"><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="cryptotw">CryptoTW</SelectItem>
                                        <SelectItem value="exchange">交易所</SelectItem>
                                        <SelectItem value="project">項目方</SelectItem>
                                        <SelectItem value="other">其他</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>來源名稱 (如: MAX) *</Label>
                                <Input value={formData.source_name} onChange={e => setFormData({ ...formData, source_name: e.target.value })} className="bg-black" />
                            </div>
                        </div>

                        {/* Re-layout for Image Upload */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>來源 Logo (建議 1:1)</Label>
                                <ImageUploader
                                    value={formData.source_logo_url}
                                    onChange={url => setFormData({ ...formData, source_logo_url: url })}
                                    aspectRatio="square"
                                    className="w-24 h-24"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <Label>獎勵價值 (如: 100 USDT)</Label>
                                <Input value={formData.reward_value} onChange={e => setFormData({ ...formData, reward_value: e.target.value })} className="bg-black text-yellow-500 font-bold" />
                            </div>
                            <div className="space-y-2">
                                <Label>難度</Label>
                                <Select value={formData.difficulty} onValueChange={v => setFormData({ ...formData, difficulty: v })}>
                                    <SelectTrigger className="bg-black"><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="easy">簡單</SelectItem>
                                        <SelectItem value="medium">中等</SelectItem>
                                        <SelectItem value="hard">困難</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>行動按鈕標籤</Label>
                                <Input value={formData.action_label} onChange={e => setFormData({ ...formData, action_label: e.target.value })} className="bg-black" />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>行動連結 (URL) *</Label>
                            <Input value={formData.action_url} onChange={e => setFormData({ ...formData, action_url: e.target.value })} className="bg-black" placeholder="https://..." />
                        </div>

                        <div className="space-y-2">
                            <Label>條件/要求</Label>
                            <Input value={formData.requirements} onChange={e => setFormData({ ...formData, requirements: e.target.value })} className="bg-black" placeholder="需完成 KYC level 2..." />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>開始時間</Label>
                                <Input type="datetime-local" value={formData.start_date} onChange={e => setFormData({ ...formData, start_date: e.target.value })} className="bg-black" />
                            </div>
                            <div className="space-y-2">
                                <div className="flex justify-between">
                                    <Label>結束時間</Label>
                                    <div className="flex items-center gap-2">
                                        <Switch checked={formData.is_ongoing} onCheckedChange={c => setFormData({ ...formData, is_ongoing: c })} id="ongoing" />
                                        <Label htmlFor="ongoing" className="text-xs text-neutral-400">長期有效</Label>
                                    </div>
                                </div>
                                <Input type="datetime-local" value={formData.end_date} onChange={e => setFormData({ ...formData, end_date: e.target.value })} className="bg-black" disabled={formData.is_ongoing} />
                            </div>
                        </div>

                        <div className="flex gap-6 pt-2">
                            <div className="flex items-center gap-2">
                                <Switch checked={formData.is_published} onCheckedChange={c => setFormData({ ...formData, is_published: c })} id="pub" />
                                <Label htmlFor="pub">立即發布</Label>
                            </div>
                            <div className="flex items-center gap-2">
                                <Switch checked={formData.is_featured} onCheckedChange={c => setFormData({ ...formData, is_featured: c })} id="feat" />
                                <Label htmlFor="feat">設為精選</Label>
                            </div>
                        </div>

                        <div className="flex justify-end gap-2 pt-4">
                            <Button variant="outline" onClick={resetForm}>取消</Button>
                            <Button onClick={handleSave} disabled={saving} className="bg-purple-600 hover:bg-purple-500">
                                {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                                儲存
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}

            <Card className="bg-neutral-900/50 border-neutral-800">
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-neutral-400 uppercase bg-neutral-900/50 border-b border-neutral-800">
                                <tr>
                                    <th className="px-6 py-3">名稱</th>
                                    <th className="px-6 py-3">類型</th>
                                    <th className="px-6 py-3">價值</th>
                                    <th className="px-6 py-3">狀態</th>
                                    <th className="px-6 py-3">點擊</th>
                                    <th className="px-6 py-3 text-right">操作</th>
                                </tr>
                            </thead>
                            <tbody>
                                {rewards.map((item) => (
                                    <tr key={item.id} className="border-b border-neutral-800 hover:bg-neutral-800/50">
                                        <td className="px-6 py-4 font-medium text-white max-w-[200px] truncate">
                                            {item.title}
                                            <div className="text-xs text-neutral-500">{item.source_name}</div>
                                        </td>
                                        <td className="px-6 py-4">{item.reward_type}</td>
                                        <td className="px-6 py-4 text-yellow-500">{item.reward_value}</td>
                                        <td className="px-6 py-4">
                                            {item.is_published ?
                                                <Badge className="bg-green-500/20 text-green-400">已發布</Badge> :
                                                <Badge variant="secondary">草稿</Badge>
                                            }
                                            {item.is_featured && <span className="ml-2 text-yellow-500">⭐</span>}
                                        </td>
                                        <td className="px-6 py-4">{item.claim_count}</td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button size="icon" variant="ghost" className="h-8 w-8 text-neutral-400 hover:text-white" onClick={() => handleEdit(item)}>
                                                    <Edit className="w-4 h-4" />
                                                </Button>
                                                <Button size="icon" variant="ghost" className="h-8 w-8 text-neutral-400 hover:text-red-500" onClick={() => handleDelete(item.id)}>
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {rewards.length === 0 && !loading && (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-8 text-center text-neutral-500">
                                            尚無福利資料
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
