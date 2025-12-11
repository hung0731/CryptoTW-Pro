'use client'

import { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Search, Loader2, User, Trophy, ShieldCheck, Clock } from 'lucide-react'
import { useDebounce } from '@/hooks/use-debounce'

interface AdminUser {
    id: string
    line_user_id: string
    display_name: string | null
    picture_url: string | null
    membership_status: 'free' | 'pending' | 'pro' | 'lifetime'
    created_at: string
}

export default function AdminUsersPage() {
    const [users, setUsers] = useState<AdminUser[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState('')
    const debouncedSearch = useDebounce(searchQuery, 500)
    const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null)
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [isSaving, setIsSaving] = useState(false)

    const fetchUsers = async () => {
        setIsLoading(true)
        try {
            const res = await fetch(`/api/admin/users?q=${debouncedSearch}`)
            const json = await res.json()
            if (json.data) {
                setUsers(json.data)
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

    const handleEdit = (user: AdminUser) => {
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
                body: JSON.stringify({
                    id: selectedUser.id,
                    membership_status: selectedUser.membership_status
                })
            })

            if (res.ok) {
                setIsDialogOpen(false)
                fetchUsers()
            } else {
                alert('Update failed')
            }
        } catch (error) {
            console.error('Update error:', error)
            alert('Update error')
        } finally {
            setIsSaving(false)
        }
    }

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'pro': return <Badge className="bg-yellow-500 text-black">PRO</Badge>
            case 'lifetime': return <Badge className="bg-purple-600 text-white">LIFETIME</Badge>
            case 'pending': return <Badge variant="outline" className="text-yellow-500 border-yellow-500">PENDING</Badge>
            default: return <Badge variant="secondary">FREE</Badge>
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold tracking-tight text-white">User Management</h1>
                <div className="flex items-center gap-2">
                    <Badge variant="outline" className="h-8 px-3 text-sm">
                        Total: {users.length}
                    </Badge>
                </div>
            </div>

            {/* Search */}
            <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500" />
                <Input
                    placeholder="Search by name or ID..."
                    className="pl-9 bg-neutral-900 border-white/10 text-white h-10"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>

            {/* List */}
            {isLoading ? (
                <div className="flex justify-center p-12">
                    <Loader2 className="w-8 h-8 animate-spin text-neutral-500" />
                </div>
            ) : (
                <div className="grid gap-4">
                    {users.map((user) => (
                        <Card key={user.id} className="bg-neutral-900/50 border-white/5 hover:bg-neutral-900 transition-colors">
                            <CardContent className="p-4 flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <Avatar className="h-10 w-10 ring-1 ring-white/10">
                                        <AvatarImage src={user.picture_url || ''} />
                                        <AvatarFallback className="bg-neutral-800 text-neutral-400">
                                            <User className="w-5 h-5" />
                                        </AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <h3 className="font-medium text-white">{user.display_name || 'Unknown User'}</h3>
                                            {getStatusBadge(user.membership_status)}
                                        </div>
                                        <p className="text-xs text-neutral-500 font-mono mt-0.5">ID: {user.line_user_id}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="text-right hidden md:block">
                                        <p className="text-xs text-neutral-500">Joined</p>
                                        <p className="text-sm text-neutral-300">
                                            {new Date(user.created_at).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <Button size="sm" variant="outline" onClick={() => handleEdit(user)} className="border-white/10 hover:bg-white/5">
                                        Edit
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                    {users.length === 0 && (
                        <div className="text-center py-12 text-neutral-500">
                            No users found.
                        </div>
                    )}
                </div>
            )}

            {/* Edit Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="bg-neutral-900 border-white/10 text-white">
                    <DialogHeader>
                        <DialogTitle>Edit User</DialogTitle>
                    </DialogHeader>
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
                                <label className="text-sm text-neutral-400">Membership Status</label>
                                <Select
                                    value={selectedUser.membership_status}
                                    onValueChange={(val: any) => setSelectedUser({ ...selectedUser, membership_status: val })}
                                >
                                    <SelectTrigger className="bg-black border-white/10 text-white">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="bg-neutral-900 border-white/10 text-white">
                                        <SelectItem value="free">Free</SelectItem>
                                        <SelectItem value="pending">Pending</SelectItem>
                                        <SelectItem value="pro">Pro (Verified)</SelectItem>
                                        <SelectItem value="lifetime">Lifetime</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    )}
                    <DialogFooter>
                        <Button variant="ghost" onClick={() => setIsDialogOpen(false)} className="hover:bg-white/5 text-neutral-400">Cancel</Button>
                        <Button onClick={handleSave} disabled={isSaving} className="bg-white text-black hover:bg-neutral-200">
                            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save Changes'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
