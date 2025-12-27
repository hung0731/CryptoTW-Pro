'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Save, Trash2, ArrowLeft } from 'lucide-react';

interface ReviewEditorProps {
    review?: any; // Type as needed, mainly Database['public']['Tables']['market_reviews']['Row']
    isNew?: boolean;
}

export function ReviewEditor({ review, isNew = false }: ReviewEditorProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        title: review?.title || '',
        slug: review?.slug || '',
        year: review?.year || new Date().getFullYear(),
        importance: review?.importance || 'B',
        tags: review?.tags?.join(', ') || '',
        content: review?.content ? JSON.stringify(review.content, null, 2) : '{\n  "summary": "",\n  "context": {},\n  "timeline": [],\n  "charts": {}\n}',
        is_published: review?.is_published || false,
    });

    const handleChange = (field: string, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async () => {
        setLoading(true);
        try {
            // Basic Validation
            if (!formData.title || !formData.slug) {
                alert('Title and Slug are required');
                setLoading(false);
                return;
            }

            let parsedContent;
            try {
                parsedContent = JSON.parse(formData.content);
            } catch (e) {
                alert('Invalid JSON in Content field');
                setLoading(false);
                return;
            }

            const payload = {
                ...formData,
                year: Number(formData.year),
                tags: formData.tags.split(',').map((t: string) => t.trim()).filter(Boolean),
                content: parsedContent
            };

            const url = isNew ? '/api/admin/reviews' : `/api/admin/reviews/${review.id}`;
            const method = isNew ? 'POST' : 'PUT';

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!res.ok) throw new Error(await res.text());

            router.push('/admin/reviews');
            router.refresh();
        } catch (error: any) {
            alert(`Error saving: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!confirm('Are you sure you want to delete this review?')) return;
        setLoading(true);
        try {
            const res = await fetch(`/api/admin/reviews/${review.id}`, { method: 'DELETE' });
            if (!res.ok) throw new Error(await res.text());
            router.push('/admin/reviews');
            router.refresh();
        } catch (error: any) {
            alert(`Error deleting: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-5xl mx-auto p-6 space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" onClick={() => router.back()}>
                        <ArrowLeft className="w-4 h-4 mr-2" /> Back
                    </Button>
                    <h1 className="text-2xl font-bold text-white">{isNew ? 'New Review' : 'Edit Review'}</h1>
                </div>
                <div className="flex items-center gap-2">
                    {!isNew && (
                        <Button variant="destructive" size="icon" onClick={handleDelete} disabled={loading}>
                            <Trash2 className="w-4 h-4" />
                        </Button>
                    )}
                    <Button onClick={handleSubmit} disabled={loading} className="bg-[#FF4400] hover:bg-[#CC3300]">
                        <Save className="w-4 h-4 mr-2" />
                        {loading ? 'Saving...' : 'Save Review'}
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Meta Column */}
                <div className="space-y-6 lg:col-span-1">
                    <Card className="bg-neutral-900 border-white/10">
                        <CardHeader>
                            <CardTitle className="text-neutral-200">Metadata</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label className="text-neutral-400">Title</Label>
                                <Input
                                    className="bg-neutral-950 border-white/10 text-white"
                                    value={formData.title}
                                    onChange={e => handleChange('title', e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-neutral-400">Slug (URL)</Label>
                                <Input
                                    className="bg-neutral-950 border-white/10 text-white font-mono text-sm"
                                    value={formData.slug}
                                    onChange={e => handleChange('slug', e.target.value)}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label className="text-neutral-400">Year</Label>
                                    <Input
                                        type="number"
                                        className="bg-neutral-950 border-white/10 text-white"
                                        value={formData.year}
                                        onChange={e => handleChange('year', e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-neutral-400">Importance</Label>
                                    <Select
                                        value={formData.importance}
                                        onValueChange={v => handleChange('importance', v)}
                                    >
                                        <SelectTrigger className="bg-neutral-950 border-white/10 text-white">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="S">S Class (Core)</SelectItem>
                                            <SelectItem value="A">A Class (Major)</SelectItem>
                                            <SelectItem value="B">B Class (Sector)</SelectItem>
                                            <SelectItem value="C">C Class (Minor)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-neutral-400">Tags (comma separated)</Label>
                                <Input
                                    className="bg-neutral-950 border-white/10 text-white"
                                    value={formData.tags}
                                    onChange={e => handleChange('tags', e.target.value)}
                                    placeholder="DeFi, Crisis, LUNA"
                                />
                            </div>
                            <div className="flex items-center justify-between pt-2">
                                <Label className="text-neutral-400">Published</Label>
                                <Switch
                                    checked={formData.is_published}
                                    onCheckedChange={v => handleChange('is_published', v)}
                                />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Content Column */}
                <div className="lg:col-span-2 space-y-6">
                    <Card className="bg-neutral-900 border-white/10 h-full flex flex-col">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle className="text-neutral-200">Content (JSON)</CardTitle>
                            <Badge variant="outline" className="text-xs text-neutral-500">Raw Editor</Badge>
                        </CardHeader>
                        <CardContent className="flex-1 min-h-[500px] flex flex-col">
                            <Textarea
                                className="flex-1 bg-neutral-950 border-white/10 text-white font-mono text-xs leading-relaxed"
                                value={formData.content}
                                onChange={e => handleChange('content', e.target.value)}
                            />
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
