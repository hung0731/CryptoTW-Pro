'use client'

import { useState, useEffect, useMemo } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Search, Loader2, User, RefreshCw, Trash2, RotateCw, Check, X, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react'
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

interface UserWithBinding {
    id: string
    line_user_id: string
    display_name: string | null
    picture_url: string | null
    membership_status: 'free' | 'pending' | 'pro' | 'lifetime'
    created_at: string
    // OKX Binding Data (flattened from verified binding)
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

export default function AdminUsersPage() {
    const [users, setUsers] = useState<UserWithBinding[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState('')
    const debouncedSearch = useDebounce(searchQuery, 500)
    const [selectedUser, setSelectedUser] = useState<UserWithBinding | null>(null)
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [isSaving, setIsSaving] = useState(false)
    const [actionLoading, setActionLoading] = useState<string | null>(null)
    const [sorting, setSorting] = useState<SortingState>([])
    const { toast } = useToast()

    const fetchUsers = async () => {
        setIsLoading(true)
        try {
            const res = await fetch(`/api/admin/users?q=${debouncedSearch}&include_bindings=true`)
            const json = await res.json()
            if (json.data) {
                // Flatten users with their verified binding data
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
        } catch (error) {
            console.error('Failed to fetch users:', error)
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchUsers()
    }, [debouncedSearch])

    const handleEdit = (user: UserWithBinding) => {
        setSelectedUser(user)
        setIsDialogOpen(true)
    }

    const handleSave = async () => {
        if (!selectedUser) return
        setIsSaving(true)
        try {
            const res = await fetch('/api/admin/users', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: selectedUser.id, membership_status: selectedUser.membership_status })
            })
            if (res.ok) {
                toast({ title: '已儲存' })
                setIsDialogOpen(false)
                fetchUsers()
            } else {
                toast({ title: '儲存失敗', variant: 'destructive' })
            }
        } catch (error) {
            toast({ title: '儲存錯誤', variant: 'destructive' })
        } finally {
            setIsSaving(false)
        }
    }

    const handleDeleteUser = async (userId: string) => {
        if (!confirm('確定要刪除此用戶嗎？')) return
        setActionLoading(userId)
        try {
            const res = await fetch(`/api/admin/users?id=${userId}`, { method: 'DELETE' })
            if (res.ok) {
                toast({ title: '用戶已刪除' })
                setIsDialogOpen(false)
                fetchUsers()
            } else {
                toast({ title: '刪除失敗', variant: 'destructive' })
            }
        } finally {
            setActionLoading(null)
        }
    }

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
                toast({ title: '同步失敗', variant: 'destructive' })
            }
        } finally {
            setActionLoading(null)
        }
    }

    const formatCurrency = (val: number | null) => {
        if (val === null || val === undefined) return '-'
        return `$${val.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`
    }

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'pro': return <Badge className="bg-white text-black text-xs">PRO</Badge>
            case 'lifetime': return <Badge className="bg-purple-600 text-white text-xs">LIFETIME</Badge>
            case 'pending': return <Badge variant="outline" className="text-yellow-500 border-yellow-500 text-xs">PENDING</Badge>
            default: return <Badge variant="secondary" className="bg-neutral-800 text-neutral-400 text-xs">FREE</Badge>
        }
    }

    // Table columns definition
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
                    <div>
                        <p className="font-medium text-white text-sm">{row.original.display_name || 'Unknown'}</p>
                        <p className="text-xs text-neutral-500 font-mono">{row.original.exchange_uid || '-'}</p>
                    </div>
                </div>
            ),
        },
        {
            accessorKey: 'membership_status',
            header: '狀態',
            cell: ({ row }) => getStatusBadge(row.original.membership_status),
        },
        {
            accessorKey: 'monthly_volume',
            header: ({ column }) => (
                <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')} className="h-8 px-2 text-neutral-400 hover:text-white">
                    當月交易量
                    {column.getIsSorted() === 'asc' ? <ArrowUp className="ml-1 h-3 w-3" /> : column.getIsSorted() === 'desc' ? <ArrowDown className="ml-1 h-3 w-3" /> : <ArrowUpDown className="ml-1 h-3 w-3" />}
                </Button>
            ),
            cell: ({ row }) => <span className="font-mono text-sm">{formatCurrency(row.original.monthly_volume)}</span>,
        },
        {
            accessorKey: 'accumulated_fee',
            header: ({ column }) => (
                <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')} className="h-8 px-2 text-neutral-400 hover:text-white">
                    累計手續費
                    {column.getIsSorted() === 'asc' ? <ArrowUp className="ml-1 h-3 w-3" /> : column.getIsSorted() === 'desc' ? <ArrowDown className="ml-1 h-3 w-3" /> : <ArrowUpDown className="ml-1 h-3 w-3" />}
                </Button>
            ),
            cell: ({ row }) => <span className="font-mono text-sm text-neutral-300">{formatCurrency(row.original.accumulated_fee)}</span>,
        },
        {
            accessorKey: 'total_commission',
            header: ({ column }) => (
                <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')} className="h-8 px-2 text-neutral-400 hover:text-white">
                    累計返佣
                    {column.getIsSorted() === 'asc' ? <ArrowUp className="ml-1 h-3 w-3" /> : column.getIsSorted() === 'desc' ? <ArrowDown className="ml-1 h-3 w-3" /> : <ArrowUpDown className="ml-1 h-3 w-3" />}
                </Button>
            ),
            cell: ({ row }) => <span className="font-mono text-sm text-green-400">{formatCurrency(row.original.total_commission)}</span>,
        },
        {
            accessorKey: 'deposit_amount',
            header: ({ column }) => (
                <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')} className="h-8 px-2 text-neutral-400 hover:text-white">
                    入金金額
                    {column.getIsSorted() === 'asc' ? <ArrowUp className="ml-1 h-3 w-3" /> : column.getIsSorted() === 'desc' ? <ArrowDown className="ml-1 h-3 w-3" /> : <ArrowUpDown className="ml-1 h-3 w-3" />}
                </Button>
            ),
            cell: ({ row }) => <span className="font-mono text-sm">{formatCurrency(row.original.deposit_amount)}</span>,
        },
        {
            accessorKey: 'okx_level',
            header: ({ column }) => (
                <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')} className="h-8 px-2 text-neutral-400 hover:text-white">
                    等級
                    {column.getIsSorted() === 'asc' ? <ArrowUp className="ml-1 h-3 w-3" /> : column.getIsSorted() === 'desc' ? <ArrowDown className="ml-1 h-3 w-3" /> : <ArrowUpDown className="ml-1 h-3 w-3" />}
                </Button>
            ),
            cell: ({ row }) => <span className="text-sm">{row.original.okx_level || '-'}</span>,
        },
        {
            accessorKey: 'rebate_rate',
            header: ({ column }) => (
                <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')} className="h-8 px-2 text-neutral-400 hover:text-white">
                    返佣%
                    {column.getIsSorted() === 'asc' ? <ArrowUp className="ml-1 h-3 w-3" /> : column.getIsSorted() === 'desc' ? <ArrowDown className="ml-1 h-3 w-3" /> : <ArrowUpDown className="ml-1 h-3 w-3" />}
                </Button>
            ),
            cell: ({ row }) => <span className="text-sm">{row.original.rebate_rate ? `${(row.original.rebate_rate * 100).toFixed(1)}%` : '-'}</span>,
        },
        {
            id: 'actions',
            header: '操作',
            cell: ({ row }) => (
                <div className="flex gap-1">
                    {row.original.binding_id && (
                        <Button size="icon" variant="ghost" onClick={() => handleSync(row.original.binding_id!)} disabled={actionLoading === row.original.binding_id} className="h-7 w-7 text-blue-400 hover:text-blue-300">
                            {actionLoading === row.original.binding_id ? <Loader2 className="h-3 w-3 animate-spin" /> : <RotateCw className="h-3 w-3" />}
                        </Button>
                    )}
                    <Button size="sm" variant="ghost" onClick={() => handleEdit(row.original)} className="h-7 text-xs text-neutral-400 hover:text-white">編輯</Button>
                </div>
            ),
        },
    ], [actionLoading])

    const table = useReactTable({
        data: users,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        onSortingChange: setSorting,
        state: { sorting },
    })

    const proUsers = users.filter(u => u.membership_status === 'pro' || u.membership_status === 'lifetime').length
    const pendingUsers = users.filter(u => u.membership_status === 'pending').length

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold tracking-tight text-white">用戶管理</h1>
                <div className="flex items-center gap-2">
                    <Badge variant="outline" className="h-8 px-3 text-sm border-green-500/50 text-green-400">Pro: {proUsers}</Badge>
                    <Badge variant="outline" className="h-8 px-3 text-sm border-yellow-500/50 text-yellow-400">Pending: {pendingUsers}</Badge>
                    <Badge variant="outline" className="h-8 px-3 text-sm">Total: {users.length}</Badge>
                    <Button variant="ghost" size="icon" onClick={fetchUsers} className="text-neutral-400 hover:text-white">
                        <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                    </Button>
                </div>
            </div>

            <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500" />
                <Input placeholder="搜尋名稱或 ID..." className="pl-9 bg-neutral-900 border-white/10 text-white h-10" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
            </div>

            {isLoading ? (
                <div className="flex justify-center p-12"><Loader2 className="w-8 h-8 animate-spin text-neutral-500" /></div>
            ) : (
                <div className="rounded-lg border border-white/10 overflow-hidden">
                    <Table>
                        <TableHeader>
                            {table.getHeaderGroups().map((headerGroup) => (
                                <TableRow key={headerGroup.id} className="border-white/10 hover:bg-transparent">
                                    {headerGroup.headers.map((header) => (
                                        <TableHead key={header.id} className="text-neutral-400 h-10">
                                            {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                                        </TableHead>
                                    ))}
                                </TableRow>
                            ))}
                        </TableHeader>
                        <TableBody>
                            {table.getRowModel().rows?.length ? (
                                table.getRowModel().rows.map((row) => (
                                    <TableRow key={row.id} className="border-white/5 hover:bg-white/5">
                                        {row.getVisibleCells().map((cell) => (
                                            <TableCell key={cell.id} className="py-2">
                                                {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={columns.length} className="h-24 text-center text-neutral-500">找不到用戶</TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            )}

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="bg-neutral-900 border-white/10 text-white">
                    <DialogHeader><DialogTitle>編輯用戶</DialogTitle></DialogHeader>
                    {selectedUser && (
                        <div className="space-y-4 py-4">
                            <div className="flex items-center gap-4 p-4 border border-white/10 rounded-lg bg-black/20">
                                <Avatar className="h-12 w-12">
                                    <AvatarImage src={selectedUser.picture_url || ''} />
                                    <AvatarFallback><User /></AvatarFallback>
                                </Avatar>
                                <div>
                                    <p className="font-bold">{selectedUser.display_name}</p>
                                    <p className="text-xs text-neutral-500">{selectedUser.line_user_id}</p>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm text-neutral-400">會員狀態</label>
                                <Select value={selectedUser.membership_status} onValueChange={(val: any) => setSelectedUser({ ...selectedUser, membership_status: val })}>
                                    <SelectTrigger className="bg-black border-white/10 text-white"><SelectValue /></SelectTrigger>
                                    <SelectContent className="bg-neutral-900 border-white/10 text-white">
                                        <SelectItem value="free">Free</SelectItem>
                                        <SelectItem value="pending">Pending</SelectItem>
                                        <SelectItem value="pro">Pro</SelectItem>
                                        <SelectItem value="lifetime">Lifetime</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    )}
                    <DialogFooter className="flex justify-between">
                        <Button variant="ghost" onClick={() => selectedUser && handleDeleteUser(selectedUser.id)} disabled={actionLoading === selectedUser?.id} className="text-red-400 hover:text-red-300 hover:bg-red-500/10">
                            {actionLoading === selectedUser?.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4 mr-1" />}刪除用戶
                        </Button>
                        <div className="flex gap-2">
                            <Button variant="ghost" onClick={() => setIsDialogOpen(false)} className="hover:bg-white/5 text-neutral-400">取消</Button>
                            <Button onClick={handleSave} disabled={isSaving} className="bg-white text-black hover:bg-neutral-200">
                                {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : '儲存'}
                            </Button>
                        </div>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
