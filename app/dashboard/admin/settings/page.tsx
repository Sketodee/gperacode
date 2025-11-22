'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { LogOut, Settings, User, Mail, Shield, Moon } from 'lucide-react'
import ThemeToggle from '@/app/components/ThemeToggle'
import BottomNav from '@/app/components/BottomNav'

export default function AdminSettings() {
    const [user, setUser] = useState<any>(null)
    const router = useRouter()

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

    const handleLogout = () => {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        router.push('/login')
    }

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
                <div className="flex justify-between items-center mb-8 animate-slide-in">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <Settings className="w-8 h-8 text-primary" />
                            <h1 className="text-3xl md:text-4xl font-bold" style={{ color: 'var(--text-primary)' }}>Settings</h1>
                        </div>
                        <p className="text-sm md:text-base" style={{ color: 'var(--text-secondary)' }}>Manage your account</p>
                    </div>
                </div>

                {/* User Info Section */}
                <div className="glass rounded-3xl p-8 mb-6 animate-slide-in">
                    <h2 className="text-xl font-bold mb-6 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                        <User className="w-5 h-5" />
                        Account Information
                    </h2>
                    <div className="space-y-4">
                        <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                            <label className="block text-sm mb-1" style={{ color: 'var(--text-secondary)' }}>Name</label>
                            <p className="font-medium text-lg flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                                <User className="w-5 h-5 text-primary" />
                                {user.name}
                            </p>
                        </div>
                        <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                            <label className="block text-sm mb-1" style={{ color: 'var(--text-secondary)' }}>Email</label>
                            <p className="font-medium text-lg flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                                <Mail className="w-5 h-5 text-primary" />
                                {user.email}
                            </p>
                        </div>
                        <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                            <label className="block text-sm mb-1" style={{ color: 'var(--text-secondary)' }}>Role</label>
                            <p className="font-medium">
                                <span className={`px-3 py-1 rounded-lg text-sm border ${
                                    user.role === 'super_admin'
                                        ? 'bg-purple-500/20 text-purple-400 border-purple-500/30'
                                        : 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30'
                                }`}>
                                    {user.role.replace('_', ' ')}
                                </span>
                            </p>
                        </div>
                    </div>
                </div>

                {/* Appearance Section */}
                <div className="glass rounded-3xl p-8 mb-6 animate-slide-in">
                    <h2 className="text-xl font-bold mb-6 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                        <Moon className="w-5 h-5" />
                        Appearance
                    </h2>
                    <div className="bg-white/5 border border-white/10 rounded-xl p-4 flex items-center justify-between">
                        <div>
                            <p className="font-medium mb-1" style={{ color: 'var(--text-primary)' }}>Theme</p>
                            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Toggle between light and dark mode</p>
                        </div>
                        <ThemeToggle />
                    </div>
                </div>

                {/* Actions Section */}
                <div className="glass rounded-3xl p-8 animate-slide-in">
                    <h2 className="text-xl font-bold mb-6 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                        <Settings className="w-5 h-5" />
                        Actions
                    </h2>
                    <button
                        onClick={handleLogout}
                        className="w-full bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 text-red-400 px-6 py-4 rounded-xl transition-all flex items-center justify-center gap-2 font-medium"
                    >
                        <LogOut className="w-5 h-5" />
                        Logout
                    </button>
                </div>
            </div>

            <BottomNav role="admin" />
        </div>
    )
}
