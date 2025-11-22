'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { LogOut, Settings, User, Mail, Home, Moon, Sun, History } from 'lucide-react'
import ThemeToggle from '@/app/components/ThemeToggle'
import BottomNav from '@/app/components/BottomNav'

export default function ResidentSettings() {
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
        if (parsedUser.role !== 'resident') {
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
            <div className="max-w-6xl mx-auto">
                <div className="flex justify-between items-center mb-8 animate-slide-in">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <Settings className="w-8 h-8 text-primary" />
                            <h1 className="text-3xl md:text-4xl font-bold text-white">Settings</h1>
                        </div>
                        <p className="text-gray-400">Manage your account</p>
                    </div>
                    <div className="hidden md:flex items-center gap-3">
                        <button
                            onClick={() => router.push('/dashboard/resident')}
                            className="bg-white/5 hover:bg-white/10 border border-white/10 text-white px-4 py-2 rounded-xl transition-all flex items-center gap-2"
                        >
                            <Home className="w-5 h-5" />
                            Dashboard
                        </button>
                        <button
                            onClick={() => router.push('/dashboard/resident/history')}
                            className="bg-white/5 hover:bg-white/10 border border-white/10 text-white px-4 py-2 rounded-xl transition-all flex items-center gap-2"
                        >
                            <History className="w-5 h-5" />
                            History
                        </button>
                        <ThemeToggle />
                        <button
                            onClick={handleLogout}
                            className="bg-white/5 hover:bg-white/10 border border-white/10 text-white px-4 py-2 rounded-xl transition-all flex items-center gap-2"
                        >
                            <LogOut className="w-5 h-5" />
                            Logout
                        </button>
                    </div>
                </div>

                {/* User Info Section */}
                <div className="glass rounded-3xl p-8 mb-6 animate-slide-in">
                    <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                        <User className="w-5 h-5" />
                        Account Information
                    </h2>
                    <div className="space-y-4">
                        <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                            <label className="block text-gray-400 text-sm mb-1">Name</label>
                            <p className="text-white font-medium text-lg flex items-center gap-2">
                                <User className="w-5 h-5 text-primary" />
                                {user.name}
                            </p>
                        </div>
                        <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                            <label className="block text-gray-400 text-sm mb-1">Email</label>
                            <p className="text-white font-medium text-lg flex items-center gap-2">
                                <Mail className="w-5 h-5 text-primary" />
                                {user.email}
                            </p>
                        </div>
                        <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                            <label className="block text-gray-400 text-sm mb-1">Unit Number</label>
                            <p className="text-white font-medium text-lg flex items-center gap-2">
                                <Home className="w-5 h-5 text-primary" />
                                {user.unitNumber || 'Not assigned'}
                            </p>
                        </div>
                        <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                            <label className="block text-gray-400 text-sm mb-1">Role</label>
                            <p className="text-white font-medium">
                                <span className="bg-teal-500/20 text-teal-400 px-3 py-1 rounded-lg text-sm border border-teal-500/30">
                                    Resident
                                </span>
                            </p>
                        </div>
                    </div>
                </div>

                {/* Appearance Section */}
                <div className="glass rounded-3xl p-8 mb-6 animate-slide-in">
                    <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                        <Moon className="w-5 h-5" />
                        Appearance
                    </h2>
                    <div className="bg-white/5 border border-white/10 rounded-xl p-4 flex items-center justify-between">
                        <div>
                            <p className="text-white font-medium mb-1">Theme</p>
                            <p className="text-gray-400 text-sm">Toggle between light and dark mode</p>
                        </div>
                        <ThemeToggle />
                    </div>
                </div>

                {/* Actions Section */}
                <div className="glass rounded-3xl p-8 animate-slide-in">
                    <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
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

            <BottomNav role="resident" />
        </div>
    )
}
