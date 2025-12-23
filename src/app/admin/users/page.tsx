'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { logger } from '@/lib/logger'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from '@/components/ui/sheet'
import { Search, Loader2, User, RefreshCw, Trash2, RotateCw, Check, X, ArrowUpDown, ArrowUp, ArrowDown, Users, ShieldAlert, Crown, AlertCircle, Clock, CheckCircle } from 'lucide-react'
import { useDebounce } from '@/hooks/use-debounce'
import { useToast } from '@/hooks/use-toast'
import {
    ColumnDef,
    flexRender,
    getCoreRowModel,
    getSortedRowModel,
    SortingState,
    useReactTable,
} from '@tanstack/react-table'

// Types
interface UserWithBinding {
    id: string
    line_user_id: string
    display_name: string | null
    picture_url: string | null
    membership_status: 'free' | 'pending' | 'pro' | 'lifetime'
    created_at: string
    // Binding Data
    binding_id: string | null
    exchange_uid: string | null
    binding_status: string | null
    monthly_volume: number | null
    accumulated_fee: number | null
    total_commission: number | null
    deposit_amount: number | null
    okx_level: string | null
    rebate_rate: number | null
    region: string | null
    last_synced_at: string | null
}

interface BindingRequest {
    id: string
    exchange_name: string
    exchange_uid: string
    status: string
    rejection_reason: string | null
    deposit_amount: number | null
    created_at: string
    user: {
        id: string
        line_user_id: string
        display_name: string
        picture_url: string
    }
}

// VIP Tier Config
const VIP_TIERS = [
    { name: '白金', minVolume: 1000000, color: 'bg-gradient-to-r from-neutral-300 to-neutral-100', textColor: 'text-neutral-900' },
    { name: '黃金', minVolume: 500000, color: 'bg-gradient-to-r from-yellow-500 to-amber-400', textColor: 'text-black' },
    { name: '白銀', minVolume: 100000, color: 'bg-gradient-to-r from-neutral-400 to-neutral-300', textColor: 'text-neutral-900' },
    { name: '青銅', minVolume: 10000, color: 'bg-gradient-to-r from-orange-700 to-orange-500', textColor: 'text-white' },
]

function getTier(volume: number) {
    for (const tier of VIP_TIERS) {
        if (volume >= tier.minVolume) return tier
    }
    return null
}

function formatCurrency(val: number | null) {
    if (val === null || val === undefined) return '-'
    return `$${val.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`
}

function formatLargeCurrency(val: number) {
    if (val >= 1000000) return `$${(val / 1000000).toFixed(2)}M`
    if (val >= 1000) return `$${(val / 1000).toFixed(1)}K`
    return `$${val.toFixed(0)}`
}

// --- Modules ---

// 1. All Users List
function AllUsersTab({ users, isLoading, fetchUsers, onEdit }: { users: UserWithBinding[], isLoading: boolean, fetchUsers: () => void, onEdit: (u: UserWithBinding) => void }) {
    const [sorting, setSorting] = useState<SortingState>([])
    const [actionLoading, setActionLoading] = useState<string | null>(null)
    const { toast } = useToast()

    const handleSync = async (bindingId: string) => {
        setActionLoading(bindingId)
        try {
            const res = await fetch('/api/admin/bindings', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: bindingId, action: 'sync' })
            })
            if (res.ok) {
                toast({ title: '已同步' })
                fetchUsers()
            } else {
                toast({ title: '同步失敗' })
            }
        } finally {
            setActionLoading(null)
        }
    }

    const columns: ColumnDef<UserWithBinding>[] = useMemo(() => [
        {
            id: 'user',
            header: '用戶',
            cell: ({ row }) => (
                <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                        <AvatarImage src={row.original.picture_url || ''} />
                        <AvatarFallback className="bg-neutral-800 text-neutral-400 text-xs"><User className="w-4 h-4" /></AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                        <span className="font-medium text-white text-sm">{row.original.display_name || 'Unknown'}</span>
                        <span className="text-xs text-neutral-500 font-mono">{row.original.exchange_uid || '-'}</span>
                    </div>
                </div>
            ),
        },
        {
            accessorKey: 'membership_status',
            header: '狀態',
            cell: ({ row }) => {
                const s = row.original.membership_status
                return (
                    <Badge variant={s === 'pro' || s === 'lifetime' ? 'default' : s === 'pending' ? 'outline' : 'secondary'}
                        className={`text-xs ${s === 'pending' ? 'text-yellow-500 border-yellow-500' : ''}`}>
                        {s.toUpperCase()}
                    </Badge>
                )
            }
        },
        {
            accessorKey: 'monthly_volume',
            header: ({ column }) => <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')} className="h-8 px-2 text-neutral-400">Volume <ArrowUpDown className="ml-1 h-3 w-3" /></Button>,
            cell: ({ row }) => <span className="font-mono text-sm">{formatCurrency(row.original.monthly_volume)}</span>,
        },
        {
            accessorKey: 'total_commission',
            header: ({ column }) => <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')} className="h-8 px-2 text-neutral-400">Comm. <ArrowUpDown className="ml-1 h-3 w-3" /></Button>,
            cell: ({ row }) => <span className="font-mono text-sm text-green-400">{formatCurrency(row.original.total_commission)}</span>,
        },
        {
            id: 'actions',
            header: '',
            cell: ({ row }) => (
                <div className="flex gap-1 justify-end">
                    {row.original.binding_id && (
                        <Button size="icon" variant="ghost" onClick={() => handleSync(row.original.binding_id!)} disabled={actionLoading === row.original.binding_id} className="h-7 w-7 text-blue-400 hover:text-blue-300">
                            <RotateCw className={`h-3 w-3 ${actionLoading === row.original.binding_id ? 'animate-spin' : ''}`} />
                        </Button>
                    )}
                    <Button size="sm" variant="ghost" onClick={() => onEdit(row.original)} className="h-7 text-xs text-neutral-400 hover:text-white">Edit</Button>
                </div>
            ),
        },
    ], [actionLoading, onEdit])

    const table = useReactTable({
        data: users,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        onSortingChange: setSorting,
        state: { sorting },
    })

    return (
        <div className="rounded-lg border border-white/10 overflow-hidden">
            <Table>
                <TableHeader>
                    {table.getHeaderGroups().map(headerGroup => (
                        <TableRow key={headerGroup.id} className="border-white/10 hover:bg-transparent">
                            {headerGroup.headers.map(header => (
                                <TableHead key={header.id} className="text-neutral-400 h-10">
                                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                                </TableHead>
                            ))}
                        </TableRow>
                    ))}
                </TableHeader>
                <TableBody>
                    {isLoading ? (
                        <TableRow><TableCell colSpan={columns.length} className="h-24 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto text-neutral-500" /></TableCell></TableRow>
                    ) : table.getRowModel().rows.length ? (
                        table.getRowModel().rows.map(row => (
                            <TableRow key={row.id} className="border-white/5 hover:bg-white/5">
                                {row.getVisibleCells().map(cell => (
                                    <TableCell key={cell.id} className="py-2">
                                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                    </TableCell>
                                ))}
                            </TableRow>
                        ))
                    ) : (
                        <TableRow><TableCell colSpan={columns.length} className="h-24 text-center text-neutral-500">No users found</TableCell></TableRow>
                    )}
                </TableBody>
            </Table>
        </div>
    )
}

// 2. Pending Bindings Tab
function BindingsTab() {
    const [bindings, setBindings] = useState<BindingRequest[]>([])
    const [loading, setLoading] = useState(true)
    const [processingId, setProcessingId] = useState<string | null>(null)
    const { toast } = useToast()

    const fetchBindings = async () => {
        setLoading(true)
        try {
            const res = await fetch('/api/admin/bindings?status=pending')
            const data = await res.json()
            if (data.bindings) setBindings(data.bindings)
        } catch (e) {
            logger.error('Failed to bindings', e, { feature: 'admin-users' })
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => { fetchBindings() }, [])

    const handleAction = async (id: string, action: 'verify' | 'reject') => {
        const reason = action === 'reject' ? prompt('拒絕原因(可選):') : null
        setProcessingId(id)
        try {
            const res = await fetch('/api/admin/bindings', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, action, rejection_reason: reason })
            })
            if (res.ok) {
                toast({ title: action === 'verify' ? '已驗證' : '已拒絕' })
                setBindings(prev => prev.filter(b => b.id !== id))
            } else {
                toast({ title: '操作失敗', variant: 'destructive' })
            }
        } finally {
            setProcessingId(null)
        }
    }

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <div className="text-sm text-neutral-400">待審核申請: {bindings.length}</div>
                <Button variant="ghost" size="icon" onClick={fetchBindings}><RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /></Button>
            </div>

            {loading && <div className="text-center py-8"><Loader2 className="w-8 h-8 animate-spin mx-auto text-neutral-500" /></div>}

            {!loading && bindings.length === 0 && (
                <div className="text-center py-12 border border-dashed border-white/10 rounded-lg text-neutral-500">
                    <CheckCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    無需審核
                </div>
            )}

            <div className="grid gap-3">
                {bindings.map(b => (
                    <Card key={b.id} className="bg-neutral-900/50 border-white/5">
                        <CardContent className="p-4 flex flex-col md:flex-row items-center justify-between gap-4">
                            <div className="flex items-center gap-3">
                                <Avatar><AvatarImage src={b.user.picture_url} /><AvatarFallback><User /></AvatarFallback></Avatar>
                                <div>
                                    <div className="font-bold text-white">{b.user.display_name}</div>
                                    <div className="text-xs text-neutral-500 font-mono">{b.user.line_user_id.slice(0, 8)}...</div>
                                </div>
                            </div>
                            <div className="md:px-4 flex-1">
                                <div className="flex items-center gap-2">
                                    <Badge variant="secondary" className="text-[10px]">OKX</Badge>
                                    <span className="font-mono font-bold text-white">{b.exchange_uid}</span>
                                </div>
                                <div className="text-xs text-neutral-500 mt-1 flex gap-2">
                                    <span>{new Date(b.created_at).toLocaleDateString()}</span>
                                    {b.deposit_amount && <span>Deposit: ${b.deposit_amount}</span>}
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <Button size="sm" variant="outline" className="border-red-500/30 text-red-400 hover:bg-red-500/10" onClick={() => handleAction(b.id, 'reject')} disabled={processingId === b.id}>
                                    {processingId === b.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <X className="w-4 h-4 mr-1" />} Reject
                                </Button>
                                <Button size="sm" className="bg-green-600 hover:bg-green-500 text-white" onClick={() => handleAction(b.id, 'verify')} disabled={processingId === b.id}>
                                    {processingId === b.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4 mr-1" />} Approve
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    )
}

// 3. VIP Ranking Tab
function VIPTab({ users }: { users: UserWithBinding[] }) {
    // Filter and sort VIPs
    const vipList = useMemo(() => {
        return users
            .filter(u => (u.monthly_volume || 0) > 0)
            .sort((a, b) => (b.monthly_volume || 0) - (a.monthly_volume || 0))
    }, [users])

    return (
        <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-4">
                {VIP_TIERS.map(tier => {
                    const count = vipList.filter(u => getTier(u.monthly_volume || 0)?.name === tier.name).length
                    return (
                        <Card key={tier.name} className="bg-neutral-900/50 border-white/5 pt-4">
                            <CardContent>
                                <div className="flex justify-between items-center">
                                    <Badge className={`${tier.color} ${tier.textColor} border-0`}>{tier.name}</Badge>
                                    <span className="text-xl font-bold text-white">{count}</span>
                                </div>
                                <div className="text-xs text-neutral-500 mt-2">≥ {formatLargeCurrency(tier.minVolume)}</div>
                            </CardContent>
                        </Card>
                    )
                })}
            </div>

            <Card className="bg-neutral-900/50 border-white/5">
                <CardHeader><CardTitle className="text-base text-white">交易量排行 (Top 50)</CardTitle></CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow className="border-white/5 hover:bg-transparent">
                                <TableHead className="w-12 text-center text-neutral-400">#</TableHead>
                                <TableHead className="text-neutral-400">User</TableHead>
                                <TableHead className="text-right text-neutral-400">Volume</TableHead>
                                <TableHead className="text-right text-neutral-400">Comm.</TableHead>
                                <TableHead className="text-center text-neutral-400">Rank</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {vipList.slice(0, 50).map((u, i) => {
                                const tier = getTier(u.monthly_volume || 0)
                                return (
                                    <TableRow key={u.id} className="border-white/5 hover:bg-white/5">
                                        <TableCell className="text-center text-neutral-500 font-mono">{i + 1}</TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <Avatar className="w-6 h-6"><AvatarImage src={u.picture_url || ''} /><AvatarFallback className="text-[10px]"><User /></AvatarFallback></Avatar>
                                                <span className="text-sm text-white">{u.display_name}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right font-mono text-white">{formatCurrency(u.monthly_volume)}</TableCell>
                                        <TableCell className="text-right font-mono text-green-400">{formatCurrency(u.total_commission)}</TableCell>
                                        <TableCell className="text-center">
                                            {tier && <Badge className={`${tier.color} ${tier.textColor} border-0 text-[10px] h-5`}>{tier.name}</Badge>}
                                        </TableCell>
                                    </TableRow>
                                )
                            })}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    )
}

export default function UsersPage() {
    const [activeTab, setActiveTab] = useState('all')
    const [users, setUsers] = useState<UserWithBinding[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState('')
    const debouncedSearch = useDebounce(searchQuery, 500)

    // User Edit Sheet State
    const [selectedUser, setSelectedUser] = useState<UserWithBinding | null>(null)
    const [isSheetOpen, setIsSheetOpen] = useState(false)
    const [isSaving, setIsSaving] = useState(false)
    const { toast } = useToast()

    const fetchUsers = async () => {
        setIsLoading(true)
        try {
            const res = await fetch(`/api/admin/users?q=${debouncedSearch}&include_bindings=true`)
            const json = await res.json()
            if (json.data) {
                // Flatten Logic
                const flatUsers: UserWithBinding[] = json.data.map((user: any) => {
                    const verifiedBinding = user.bindings?.find((b: any) => b.status === 'verified')
                    return {
                        ...user,
                        binding_id: verifiedBinding?.id || null,
                        exchange_uid: verifiedBinding?.exchange_uid || null,
                        binding_status: verifiedBinding?.status || (user.bindings?.length ? user.bindings[0].status : null),
                        monthly_volume: verifiedBinding?.monthly_volume || null,
                        accumulated_fee: verifiedBinding?.accumulated_fee || null,
                        total_commission: verifiedBinding?.total_commission || null,
                        deposit_amount: verifiedBinding?.deposit_amount || null,
                        okx_level: verifiedBinding?.okx_level || null,
                        rebate_rate: verifiedBinding?.rebate_rate || null,
                        region: verifiedBinding?.region || null,
                        last_synced_at: verifiedBinding?.last_synced_at || null,
                    }
                })
                setUsers(flatUsers)
            }
        } catch (e) { logger.error('Failed to fetch users', e, { feature: 'admin-users' }) }
        finally { setIsLoading(false) }
    }

    useEffect(() => { fetchUsers() }, [debouncedSearch])

    const openEdit = (u: UserWithBinding) => {
        setSelectedUser(u)
        setIsSheetOpen(true)
    }

    const handleSaveUser = async () => {
        if (!selectedUser) return
        setIsSaving(true)
        try {
            await fetch('/api/admin/users', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: selectedUser.id, membership_status: selectedUser.membership_status })
            })
            toast({ title: '已儲存' })
            fetchUsers()
            setIsSheetOpen(false)
        } catch { toast({ title: 'Error' }) }
        finally { setIsSaving(false) }
    }

    const handleDeleteUser = async () => {
        if (!selectedUser || !confirm('Delete user?')) return
        await fetch(`/api/admin/users?id=${selectedUser.id}`, { method: 'DELETE' })
        fetchUsers()
        setIsSheetOpen(false)
    }

    return (
        <div className="p-6 md:p-8 space-y-8 w-full max-w-[1600px] mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-white">用戶中心 (Users)</h1>
                    <p className="text-neutral-400 mt-2">整合用戶管理、綁定審核與 VIP 追蹤</p>
                </div>
                <div className="relative w-full md:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500" />
                    <Input
                        placeholder="搜尋用戶..."
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        className="pl-9 bg-neutral-900 border-white/10"
                    />
                </div>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="bg-neutral-900 border border-white/10 text-neutral-400">
                    <TabsTrigger value="all" className="data-[state=active]:bg-white/10 data-[state=active]:text-white gap-2">
                        <Users className="w-4 h-4" /> 所有用戶 <span className="text-xs opacity-50 ml-1">{users.length}</span>
                    </TabsTrigger>
                    <TabsTrigger value="pending" className="data-[state=active]:bg-white/10 data-[state=active]:text-white gap-2">
                        <ShieldAlert className="w-4 h-4" /> 綁定審核
                    </TabsTrigger>
                    <TabsTrigger value="vip" className="data-[state=active]:bg-white/10 data-[state=active]:text-white gap-2">
                        <Crown className="w-4 h-4" /> VIP 榜單
                    </TabsTrigger>
                </TabsList>
                <div className="mt-6">
                    <TabsContent value="all">
                        <AllUsersTab users={users} isLoading={isLoading} fetchUsers={fetchUsers} onEdit={openEdit} />
                    </TabsContent>
                    <TabsContent value="pending">
                        <BindingsTab />
                    </TabsContent>
                    <TabsContent value="vip">
                        <VIPTab users={users} />
                    </TabsContent>
                </div>
            </Tabs>

            <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                <SheetContent className="bg-black border-l border-white/10 text-white w-[400px] sm:w-[540px] overflow-y-auto">
                    <SheetHeader>
                        <SheetTitle className="text-white">用戶詳情</SheetTitle>
                    </SheetHeader>
                    {selectedUser && (
                        <div className="py-6 space-y-6">
                            <div className="flex items-center gap-4">
                                <Avatar className="w-16 h-16 border border-white/10">
                                    <AvatarImage src={selectedUser.picture_url || ''} />
                                    <AvatarFallback><User className="w-8 h-8" /></AvatarFallback>
                                </Avatar>
                                <div>
                                    <h3 className="text-xl font-bold">{selectedUser.display_name}</h3>
                                    <p className="text-neutral-500 font-mono text-sm">{selectedUser.line_user_id}</p>
                                    <div className="flex gap-2 mt-2">
                                        <Badge variant="outline" className="border-white/20">{selectedUser.membership_status}</Badge>
                                        <Badge variant="outline" className="border-blue-500/30 text-blue-400">
                                            {selectedUser.exchange_uid ? `OKX: ${selectedUser.exchange_uid}` : '未綁定'}
                                        </Badge>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm text-neutral-400">更改會員狀態</label>
                                <Select value={selectedUser.membership_status} onValueChange={v => setSelectedUser({ ...selectedUser, membership_status: v as any })}>
                                    <SelectTrigger className="bg-neutral-900 border-white/10"><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="free">Free</SelectItem>
                                        <SelectItem value="pending">Pending</SelectItem>
                                        <SelectItem value="pro">Pro</SelectItem>
                                        <SelectItem value="lifetime">Lifetime</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {selectedUser.binding_id && (
                                <Card className="bg-neutral-900/30 border-white/10">
                                    <CardHeader><CardTitle className="text-sm text-white">交易數據 (Verified)</CardTitle></CardHeader>
                                    <CardContent className="space-y-3 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-neutral-500">Volume (Month)</span>
                                            <span className="text-white font-mono">{formatCurrency(selectedUser.monthly_volume)}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-neutral-500">Total Comm.</span>
                                            <span className="text-green-400 font-mono">{formatCurrency(selectedUser.total_commission)}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-neutral-500">Last Synced</span>
                                            <span className="text-neutral-400 text-xs">{selectedUser.last_synced_at ? new Date(selectedUser.last_synced_at).toLocaleString() : '-'}</span>
                                        </div>
                                    </CardContent>
                                </Card>
                            )}

                            <div className="pt-8 flex justify-between">
                                <Button variant="ghost" onClick={handleDeleteUser} className="text-red-500 hover:bg-red-500/10 hover:text-red-400"><Trash2 className="w-4 h-4 mr-2" /> 刪除用戶</Button>
                                <div className="flex gap-2">
                                    <Button variant="outline" onClick={() => setIsSheetOpen(false)}>Cancel</Button>
                                    <Button onClick={handleSaveUser} disabled={isSaving}>{isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save Changes'}</Button>
                                </div>
                            </div>
                        </div>
                    )}
                </SheetContent>
            </Sheet>
        </div>
    )
}
