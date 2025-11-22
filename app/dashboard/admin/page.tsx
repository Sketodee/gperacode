'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { LogOut, UserPlus, Users, ScrollText, AlertCircle, Shield, Copy, Check, ChevronLeft, ChevronRight } from 'lucide-react'
import ThemeToggle from '@/app/components/ThemeToggle'
import BottomNav from '@/app/components/BottomNav'

export default function AdminDashboard() {
    const [activeTab, setActiveTab] = useState<'create' | 'users' | 'logs'>('create')
    const [user, setUser] = useState<any>(null)
    const [users, setUsers] = useState<any[]>([])
    const [logs, setLogs] = useState<any[]>([])
    const [formData, setFormData] = useState({
        email: '',
        name: '',
        role: 'resident',
        unitNumber: ''
    })
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState('')
    const [tempPassword, setTempPassword] = useState('')
    const [copied, setCopied] = useState(false)
    const [usersPage, setUsersPage] = useState(1)
    const [logsPage, setLogsPage] = useState(1)
    const [userSearch, setUserSearch] = useState('')
    const [userRoleFilter, setUserRoleFilter] = useState<string>('all')
    const [userStatusFilter, setUserStatusFilter] = useState<string>('all')
    const [logSearch, setLogSearch] = useState('')
    const [logStatusFilter, setLogStatusFilter] = useState<string>('all')
    const [logTypeFilter, setLogTypeFilter] = useState<string>('all')
    const itemsPerPage = 10
    const router = useRouter()
    const searchParams = useSearchParams()

    useEffect(() => {
        const userData = localStorage.getItem('user')
        const token = localStorage.getItem('token')

        if (!userData || !token) {
            router.push('/login')
            return
        }

        const parsedUser = JSON.parse(userData)
        if (parsedUser.role !== 'super_admin' && parsedUser.role !== 'admin') {
            router.push('/login')
            return
        }

        setUser(parsedUser)
    }, [router])

    // Handle URL params for tab navigation
    useEffect(() => {
        const tab = searchParams.get('tab')
        if (tab === 'users' || tab === 'logs') {
            setActiveTab(tab)
        }
    }, [searchParams])

    useEffect(() => {
        if (activeTab === 'users') {
            fetchUsers()
        } else if (activeTab === 'logs') {
            fetchLogs()
        }
    }, [activeTab])

    const fetchUsers = async () => {
        try {
            const token = localStorage.getItem('token')
            const response = await fetch('/api/users', {
                headers: { 'Authorization': `Bearer ${token}` }
            })
            const data = await response.json()
            if (response.ok) {
                setUsers(data.users)
            }
        } catch (err) {
            console.error('Error fetching users:', err)
        }
    }

    const fetchLogs = async () => {
        try {
            const token = localStorage.getItem('token')
            const response = await fetch('/api/logs', {
                headers: { 'Authorization': `Bearer ${token}` }
            })
            const data = await response.json()
            if (response.ok) {
                setLogs(data.logs)
            }
        } catch (err) {
            console.error('Error fetching logs:', err)
        }
    }

    const handleCreateUser = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setMessage('')
        setTempPassword('')

        try {
            const token = localStorage.getItem('token')
            const response = await fetch('/api/users', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            })

            const data = await response.json()

            if (!response.ok) {
                setMessage(data.error || 'Failed to create user')
                setLoading(false)
                return
            }

            setMessage(`User created successfully!`)
            setTempPassword(data.temporaryPassword)
            setFormData({ email: '', name: '', role: 'resident', unitNumber: '' })
            setLoading(false)
            setCopied(false)
        } catch (err) {
            setMessage('An error occurred')
            setLoading(false)
        }
    }

    const copyPassword = () => {
        navigator.clipboard.writeText(tempPassword)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    const toggleUserStatus = async (userId: string, currentStatus: boolean) => {
        try {
            const token = localStorage.getItem('token')
            const response = await fetch(`/api/users/${userId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ isActive: !currentStatus })
            })

            if (response.ok) {
                fetchUsers()
            } else {
                const data = await response.json()
                alert(data.error || 'Failed to update user status')
            }
        } catch (err) {
            console.error('Error toggling user status:', err)
            alert('An error occurred')
        }
    }

    const handleLogout = () => {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        router.push('/login')
    }

    // Filter users based on search and filters
    const filteredUsers = users.filter(u => {
        const matchesSearch = u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
            u.email.toLowerCase().includes(userSearch.toLowerCase()) ||
            (u.unitNumber && u.unitNumber.toLowerCase().includes(userSearch.toLowerCase()))
        const matchesRole = userRoleFilter === 'all' || u.role === userRoleFilter
        const matchesStatus = userStatusFilter === 'all' ||
            (userStatusFilter === 'active' && u.isActive) ||
            (userStatusFilter === 'inactive' && !u.isActive)
        return matchesSearch && matchesRole && matchesStatus
    })

    // Filter logs based on search and filters
    const filteredLogs = logs.filter(log => {
        const matchesSearch = log.visitorName.toLowerCase().includes(logSearch.toLowerCase()) ||
            log.residentName.toLowerCase().includes(logSearch.toLowerCase()) ||
            log.code.toLowerCase().includes(logSearch.toLowerCase())
        const matchesStatus = logStatusFilter === 'all' || log.status === logStatusFilter
        const matchesType = logTypeFilter === 'all' || log.type === logTypeFilter
        return matchesSearch && matchesStatus && matchesType
    })

    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
        )
    }

    return (
        <div className="min-h-screen p-4 md:p-8 pb-20 md:pb-8">
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-8 animate-slide-in">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <Shield className="w-8 h-8 text-primary" />
                            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold" style={{ color: 'var(--text-primary)' }}>
                                Dashboard
                            </h1>
                        </div>
                        <p className="text-sm md:text-base" style={{ color: 'var(--text-secondary)' }}>Welcome back, {user.name}</p>
                    </div>
                    <div className="hidden md:flex items-center gap-2 md:gap-4">
                        <ThemeToggle />
                        <button
                            onClick={handleLogout}
                            className="bg-white/5 hover:bg-white/10 border border-white/10 px-3 md:px-6 py-2 rounded-xl transition-all flex items-center gap-2 text-sm md:text-base"
                            style={{ color: 'var(--text-primary)' }}
                        >
                            <LogOut className="w-4 h-4 md:w-5 md:h-5" />
                            Logout
                        </button>
                    </div>
                </div>

                <div className="flex gap-2 md:gap-4 mb-6 animate-fade-in overflow-x-auto pb-2 md:hidden">
                    <button
                        onClick={() => setActiveTab('create')}
                        className={`px-4 py-2 md:px-6 md:py-3 rounded-xl font-medium transition-all flex items-center gap-2 whitespace-nowrap text-sm md:text-base ${activeTab === 'create'
                            ? 'gradient-primary text-white'
                            : 'bg-white/5 hover:bg-white/10'
                            }`}
                        style={activeTab !== 'create' ? { color: 'var(--text-secondary)' } : {}}
                    >
                        <UserPlus className="w-4 h-4 md:w-5 md:h-5" />
                        Create User
                    </button>
                    <button
                        onClick={() => setActiveTab('users')}
                        className={`px-4 py-2 md:px-6 md:py-3 rounded-xl font-medium transition-all flex items-center gap-2 whitespace-nowrap text-sm md:text-base ${activeTab === 'users'
                            ? 'gradient-primary text-white shadow-lg'
                            : 'bg-white/5 text-gray-400 hover:bg-white/10'
                            }`}
                    >
                        <Users className="w-4 h-4 md:w-5 md:h-5" />
                        All Users
                    </button>
                </div>

                {/* Desktop tabs - show all three */}
                <div className="hidden md:flex gap-4 mb-6 animate-fade-in overflow-x-auto pb-2">
                    <button
                        onClick={() => setActiveTab('create')}
                        className={`px-6 py-3 rounded-xl font-medium transition-all flex items-center gap-2 whitespace-nowrap ${activeTab === 'create'
                            ? 'gradient-primary text-white'
                            : 'bg-white/5 hover:bg-white/10'
                            }`}
                        style={activeTab !== 'create' ? { color: 'var(--text-secondary)' } : {}}
                    >
                        <UserPlus className="w-5 h-5" />
                        Create User
                    </button>
                    <button
                        onClick={() => setActiveTab('users')}
                        className={`px-6 py-3 rounded-xl font-medium transition-all flex items-center gap-2 whitespace-nowrap ${activeTab === 'users'
                            ? 'gradient-primary text-white shadow-lg'
                            : 'bg-white/5 text-gray-400 hover:bg-white/10'
                            }`}
                    >
                        <Users className="w-5 h-5" />
                        All Users
                    </button>
                    <button
                        onClick={() => setActiveTab('logs')}
                        className={`px-6 py-3 rounded-xl font-medium transition-all flex items-center gap-2 whitespace-nowrap ${activeTab === 'logs'
                            ? 'gradient-primary text-white shadow-lg'
                            : 'bg-white/5 text-gray-400 hover:bg-white/10'
                            }`}
                    >
                        <ScrollText className="w-5 h-5" />
                        Access Logs
                    </button>
                </div>

                {activeTab === 'create' && (
                    <div className="glass rounded-3xl p-8 animate-slide-in">
                        <h2 className="text-2xl font-bold mb-6" style={{ color: 'var(--text-primary)' }}>Create New User</h2>

                        {message && (
                            <div className={`mb-6 p-4 rounded-xl ${tempPassword ? 'bg-teal-500/10 border border-teal-500/50' : 'bg-red-500/10 border border-red-500/50'} flex gap-3 items-start`}>
                                <AlertCircle className={`w-5 h-5 flex-shrink-0 mt-0.5 ${tempPassword ? 'text-teal-400' : 'text-red-400'}`} />
                                <div className="flex-1">
                                    <p className={tempPassword ? 'text-teal-400' : 'text-red-400'}>{message}</p>
                                    {tempPassword && (
                                        <div className="mt-3 p-3 bg-black/20 rounded-lg">
                                            <p className="font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>Temporary Password:</p>
                                            <div className="flex items-center gap-2">
                                                <code className="font-mono text-lg px-3 py-2 rounded flex-1" style={{ color: 'var(--text-primary)', background: 'var(--bg-tertiary)' }}>{tempPassword}</code>
                                                <button
                                                    onClick={copyPassword}
                                                    className="bg-white/10 hover:bg-white/20 p-2 rounded-lg transition-colors"
                                                    title="Copy password"
                                                >
                                                    {copied ? <Check className="w-5 h-5 text-green-400" /> : <Copy className="w-5 h-5 text-gray-400" />}
                                                </button>
                                            </div>
                                            <p className="text-sm mt-2" style={{ color: 'var(--text-tertiary)' }}>Email has been sent to the user (check console for simulation)</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        <form onSubmit={handleCreateUser} className="space-y-6">
                            <div className="grid md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Email</label>
                                    <input
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                                        placeholder="user@example.com"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-gray-300 text-sm font-medium mb-2">Full Name</label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                                        placeholder="John Doe"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-gray-300 text-sm font-medium mb-2">Role</label>
                                    <select
                                        value={formData.role}
                                        onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                                    >
                                        {user.role === 'super_admin' && <option value="admin">Admin</option>}
                                        <option value="resident">Resident</option>
                                        <option value="security">Security</option>
                                    </select>
                                </div>

                                {formData.role === 'resident' && (
                                    <div>
                                        <label className="block text-gray-300 text-sm font-medium mb-2">Unit Number</label>
                                        <input
                                            type="text"
                                            value={formData.unitNumber}
                                            onChange={(e) => setFormData({ ...formData, unitNumber: e.target.value })}
                                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                                            placeholder="A101"
                                            required={formData.role === 'resident'}
                                        />
                                    </div>
                                )}
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="gradient-primary text-white font-semibold px-8 py-3 rounded-xl hover:opacity-90 transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed shadow-lg flex items-center gap-2"
                            >
                                <UserPlus className="w-5 h-5" />
                                {loading ? 'Creating...' : 'Create User'}
                            </button>
                        </form>
                    </div>
                )}

                {activeTab === 'users' && (
                    <div className="glass rounded-3xl p-8 animate-slide-in">
                        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                            <Users className="w-6 h-6" />
                            All Users ({filteredUsers.length})
                        </h2>

                        <div className="mb-6 space-y-4">
                            <input
                                type="text"
                                placeholder="Search by name, email, or unit..."
                                value={userSearch}
                                onChange={(e) => setUserSearch(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                            />
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <select
                                    value={userRoleFilter}
                                    onChange={(e) => setUserRoleFilter(e.target.value)}
                                    className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                                >
                                    <option value="all">All Roles</option>
                                    <option value="super_admin">Super Admin</option>
                                    <option value="admin">Admin</option>
                                    <option value="security">Security</option>
                                    <option value="resident">Resident</option>
                                </select>
                                <select
                                    value={userStatusFilter}
                                    onChange={(e) => setUserStatusFilter(e.target.value)}
                                    className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                                >
                                    <option value="all">All Status</option>
                                    <option value="active">Active</option>
                                    <option value="inactive">Inactive</option>
                                </select>
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-white/10">
                                        <th className="text-left font-medium py-3 px-4" style={{ color: 'var(--text-secondary)' }}>Name</th>
                                        <th className="text-left font-medium py-3 px-4" style={{ color: 'var(--text-secondary)' }}>Email</th>
                                        <th className="text-left font-medium py-3 px-4" style={{ color: 'var(--text-secondary)' }}>Role</th>
                                        <th className="text-left font-medium py-3 px-4" style={{ color: 'var(--text-secondary)' }}>Unit</th>
                                        <th className="text-left font-medium py-3 px-4" style={{ color: 'var(--text-secondary)' }}>Status</th>
                                        <th className="text-left font-medium py-3 px-4" style={{ color: 'var(--text-secondary)' }}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredUsers.slice((usersPage - 1) * itemsPerPage, usersPage * itemsPerPage).map((u) => (
                                        <tr key={u._id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                            <td className="py-3 px-4" style={{ color: 'var(--text-primary)' }}>{u.name}</td>
                                            <td className="py-3 px-4" style={{ color: 'var(--text-secondary)' }}>{u.email}</td>
                                            <td className="py-3 px-4">
                                                <span className={`px-3 py-1 rounded-lg text-sm font-medium ${u.role === 'super_admin' ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30' :
                                                    u.role === 'admin' ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30' :
                                                        u.role === 'resident' ? 'bg-teal-500/20 text-teal-400 border border-teal-500/30' :
                                                            'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                                                    }`}>
                                                    {u.role.replace('_', ' ')}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4" style={{ color: 'var(--text-secondary)' }}>{u.unitNumber || '-'}</td>
                                            <td className="py-3 px-4">
                                                {u.isActive ? (
                                                    <span className="px-3 py-1 rounded-lg text-sm font-medium bg-teal-500/20 text-teal-400 border border-teal-500/30">
                                                        Active
                                                    </span>
                                                ) : (
                                                    <span className="px-3 py-1 rounded-lg text-sm font-medium bg-red-500/20 text-red-400 border border-red-500/30">
                                                        Inactive
                                                    </span>
                                                )}
                                            </td>
                                            <td className="py-3 px-4">
                                                {u.role !== 'super_admin' && (
                                                    <button
                                                        onClick={() => toggleUserStatus(u._id, u.isActive)}
                                                        className={`px-3 py-1 rounded-lg text-sm font-medium transition-all ${u.isActive
                                                            ? 'bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30'
                                                            : 'bg-teal-500/20 text-teal-400 border border-teal-500/30 hover:bg-teal-500/30'
                                                            }`}
                                                    >
                                                        {u.isActive ? 'Deactivate' : 'Activate'}
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        {filteredUsers.length > itemsPerPage && (
                            <div className="flex justify-center items-center gap-2 md:gap-4 mt-6 flex-wrap">
                                <button
                                    onClick={() => setUsersPage(p => Math.max(1, p - 1))}
                                    disabled={usersPage === 1}
                                    className="bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed border border-white/10 px-3 md:px-4 py-2 rounded-lg transition-all flex items-center gap-1 md:gap-2 text-sm md:text-base"
                                    style={{ color: 'var(--text-primary)' }}
                                >
                                    <ChevronLeft className="w-4 h-4 md:w-5 md:h-5" />
                                    <span className="hidden sm:inline">Previous</span>
                                    <span className="sm:hidden">Prev</span>
                                </button>
                                <span className="text-sm md:text-base" style={{ color: 'var(--text-secondary)' }}>
                                    {usersPage} / {Math.ceil(filteredUsers.length / itemsPerPage)}
                                </span>
                                <button
                                    onClick={() => setUsersPage(p => Math.min(Math.ceil(filteredUsers.length / itemsPerPage), p + 1))}
                                    disabled={usersPage >= Math.ceil(filteredUsers.length / itemsPerPage)}
                                    className="bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed border border-white/10 px-3 md:px-4 py-2 rounded-lg transition-all flex items-center gap-1 md:gap-2 text-sm md:text-base"
                                    style={{ color: 'var(--text-primary)' }}
                                >
                                    Next
                                    <ChevronRight className="w-4 h-4 md:w-5 md:h-5" />
                                </button>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'logs' && (
                    <div className="glass rounded-3xl p-8 animate-slide-in">
                        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                            <ScrollText className="w-6 h-6" />
                            Access Logs ({filteredLogs.length})
                        </h2>

                        <div className="mb-6 space-y-4">
                            <input
                                type="text"
                                placeholder="Search by visitor name, resident, or code..."
                                value={logSearch}
                                onChange={(e) => setLogSearch(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                            />
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <select
                                    value={logStatusFilter}
                                    onChange={(e) => setLogStatusFilter(e.target.value)}
                                    className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                                >
                                    <option value="all">All Status</option>
                                    <option value="success">Success</option>
                                    <option value="expired">Expired</option>
                                    <option value="invalid">Invalid</option>
                                    <option value="already_used">Already Used</option>
                                </select>
                                <select
                                    value={logTypeFilter}
                                    onChange={(e) => setLogTypeFilter(e.target.value)}
                                    className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                                >
                                    <option value="all">All Types</option>
                                    <option value="entry">Entry</option>
                                    <option value="exit">Exit</option>
                                </select>
                            </div>
                        </div>

                        <div className="space-y-3">
                            {filteredLogs.slice((logsPage - 1) * itemsPerPage, logsPage * itemsPerPage).map((log) => (
                                <div key={log._id} className="bg-white/5 border border-white/10 rounded-xl p-4 hover:bg-white/10 transition-colors">
                                    <div className="flex justify-between items-start flex-wrap gap-4">
                                        <div className="flex-1">
                                            <p className="font-medium text-lg" style={{ color: 'var(--text-primary)' }}>{log.visitorName}</p>
                                            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Resident: {log.residentName} {log.unitNumber ? `(Unit ${log.unitNumber})` : ''}</p>
                                            <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>Code: {log.code} • Validated by: {log.validatedBy}</p>
                                        </div>
                                        <div className="text-right">
                                            <div className="flex gap-2 mb-2">
                                                <span className={`px-3 py-1 rounded-lg text-sm font-medium ${log.type === 'entry' ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30' :
                                                    'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                                                    }`}>
                                                    {log.type}
                                                </span>
                                                <span className={`px-3 py-1 rounded-lg text-sm font-medium ${log.status === 'success' ? 'bg-teal-500/20 text-teal-400 border border-teal-500/30' :
                                                    log.status === 'expired' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                                                        'bg-red-500/20 text-red-400 border border-red-500/30'
                                                    }`}>
                                                    {log.status}
                                                </span>
                                            </div>
                                            <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>
                                                {new Date(log.timestamp).toLocaleString()}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {filteredLogs.length === 0 && (
                                <p className="text-center py-8" style={{ color: 'var(--text-tertiary)' }}>No access logs found</p>
                            )}
                        </div>
                        {filteredLogs.length > itemsPerPage && (
                            <div className="flex justify-center items-center gap-2 md:gap-4 mt-6 flex-wrap">
                                <button
                                    onClick={() => setLogsPage(p => Math.max(1, p - 1))}
                                    disabled={logsPage === 1}
                                    className="bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed border border-white/10 px-3 md:px-4 py-2 rounded-lg transition-all flex items-center gap-1 md:gap-2 text-sm md:text-base"
                                    style={{ color: 'var(--text-primary)' }}
                                >
                                    <ChevronLeft className="w-4 h-4 md:w-5 md:h-5" />
                                    <span className="hidden sm:inline">Previous</span>
                                    <span className="sm:hidden">Prev</span>
                                </button>
                                <span className="text-sm md:text-base" style={{ color: 'var(--text-secondary)' }}>
                                    {logsPage} / {Math.ceil(filteredLogs.length / itemsPerPage)}
                                </span>
                                <button
                                    onClick={() => setLogsPage(p => Math.min(Math.ceil(filteredLogs.length / itemsPerPage), p + 1))}
                                    disabled={logsPage >= Math.ceil(filteredLogs.length / itemsPerPage)}
                                    className="bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed border border-white/10 px-3 md:px-4 py-2 rounded-lg transition-all flex items-center gap-1 md:gap-2 text-sm md:text-base"
                                    style={{ color: 'var(--text-primary)' }}
                                >
                                    Next
                                    <ChevronRight className="w-4 h-4 md:w-5 md:h-5" />
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>

            <BottomNav role="admin" />
        </div>
    )
}
