'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { LogOut, Home, Clock, User, CheckCircle, XCircle, Users, ChevronLeft, ChevronRight, Settings } from 'lucide-react'
import ThemeToggle from '@/app/components/ThemeToggle'
import BottomNav from '@/app/components/BottomNav'

export default function ResidentHistory() {
    const [user, setUser] = useState<any>(null)
    const [codes, setCodes] = useState<any[]>([])
    const [activeCodesPage, setActiveCodesPage] = useState(1)
    const [expiredCodesPage, setExpiredCodesPage] = useState(1)
    const codesPerPage = 5
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
        fetchCodes()
    }, [router])

    const fetchCodes = async () => {
        try {
            const token = localStorage.getItem('token')
            const response = await fetch('/api/codes', {
                headers: { 'Authorization': `Bearer ${token}` }
            })
            const data = await response.json()
            if (response.ok) {
                setCodes(data.codes)
            }
        } catch (err) {
            console.error('Error fetching codes:', err)
        }
    }

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

    // Filter active and expired codes
    const activeCodes = codes.filter(c => c.isActive)
    const expiredCodes = codes.filter(c => !c.isActive)

    return (
        <div className="min-h-screen p-4 md:p-8 pb-20 md:pb-8">
            <div className="max-w-6xl mx-auto">
                <div className="flex justify-between items-center mb-8 animate-slide-in">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <Home className="w-8 h-8 text-primary" />
                            <h1 className="text-3xl md:text-4xl font-bold text-white">History</h1>
                        </div>
                        <p className="text-gray-400">Access Code History</p>
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
                            onClick={() => router.push('/dashboard/resident/settings')}
                            className="bg-white/5 hover:bg-white/10 border border-white/10 text-white px-4 py-2 rounded-xl transition-all flex items-center gap-2"
                        >
                            <Settings className="w-5 h-5" />
                            Settings
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

                <div className="grid md:grid-cols-2 gap-6">
                    <div className="glass rounded-3xl p-8 animate-slide-in">
                        <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                            <CheckCircle className="w-6 h-6 text-teal-400" />
                            Active Codes ({activeCodes.length})
                        </h2>
                        <div className="space-y-4">
                            {activeCodes.slice((activeCodesPage - 1) * codesPerPage, activeCodesPage * codesPerPage).map((code) => (
                                <div key={code._id} className="bg-white/5 border border-white/10 rounded-xl p-4">
                                    <div className="flex justify-between items-start mb-2">
                                        <p className="text-xl font-bold text-white font-mono">{code.code}</p>
                                        <div className="flex gap-2">
                                            {code.codeType === 'group' && (
                                                <span className="bg-amber-500/20 text-amber-400 px-3 py-1 rounded-lg text-sm font-medium border border-amber-500/30 flex items-center gap-1">
                                                    <Users className="w-3 h-3" />
                                                    Group
                                                </span>
                                            )}
                                            <span className="bg-teal-500/20 text-teal-400 px-3 py-1 rounded-lg text-sm font-medium border border-teal-500/30">
                                                Active
                                            </span>
                                        </div>
                                    </div>
                                    <p className="text-white font-medium flex items-center gap-2">
                                        <User className="w-4 h-4" />
                                        {code.visitorName}
                                    </p>
                                    {code.eventName && (
                                        <p className="text-gray-300 text-sm flex items-center gap-2 mt-1">
                                            <Home className="w-4 h-4" />
                                            {code.eventName}
                                        </p>
                                    )}
                                    <p className="text-gray-400 text-sm flex items-center gap-2 mt-1">
                                        <Clock className="w-4 h-4" />
                                        Valid until: {new Date(code.validUntil).toLocaleString()}
                                    </p>
                                    <div className="flex gap-2 mt-3 flex-wrap">
                                        {code.codeType === 'group' && code.maxUsageLimit && (
                                            <span className="bg-amber-500/20 text-amber-400 px-2 py-1 rounded text-xs border border-amber-500/30">
                                                Max: {code.maxUsageLimit} entries
                                            </span>
                                        )}
                                        {code.codeType === 'single' && code.isMultiUse && code.maxUsageLimit && (
                                            <span className="bg-indigo-500/20 text-indigo-400 px-2 py-1 rounded text-xs border border-indigo-500/30">
                                                Max: {code.maxUsageLimit} uses
                                            </span>
                                        )}
                                        {code.codeType === 'single' && code.isMultiUse && !code.maxUsageLimit && (
                                            <span className="bg-indigo-500/20 text-indigo-400 px-2 py-1 rounded text-xs border border-indigo-500/30">Multi-use</span>
                                        )}
                                        {code.allowExit && (
                                            <span className="bg-purple-500/20 text-purple-400 px-2 py-1 rounded text-xs border border-purple-500/30">Exit allowed</span>
                                        )}
                                        <span className="bg-gray-500/20 text-gray-400 px-2 py-1 rounded text-xs border border-gray-500/30">Used: {code.usageCount}x</span>
                                    </div>
                                </div>
                            ))}
                            {activeCodes.length === 0 && (
                                <p className="text-gray-500 text-center py-8">No active codes</p>
                            )}
                        </div>
                        {activeCodes.length > codesPerPage && (
                            <div className="flex justify-center items-center gap-4 mt-6">
                                <button
                                    onClick={() => setActiveCodesPage(p => Math.max(1, p - 1))}
                                    disabled={activeCodesPage === 1}
                                    className="bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed border border-white/10 text-white px-4 py-2 rounded-lg transition-all flex items-center gap-2"
                                >
                                    <ChevronLeft className="w-5 h-5" />
                                    Previous
                                </button>
                                <span className="text-gray-400">
                                    Page {activeCodesPage} of {Math.ceil(activeCodes.length / codesPerPage)}
                                </span>
                                <button
                                    onClick={() => setActiveCodesPage(p => Math.min(Math.ceil(activeCodes.length / codesPerPage), p + 1))}
                                    disabled={activeCodesPage >= Math.ceil(activeCodes.length / codesPerPage)}
                                    className="bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed border border-white/10 text-white px-4 py-2 rounded-lg transition-all flex items-center gap-2"
                                >
                                    Next
                                    <ChevronRight className="w-5 h-5" />
                                </button>
                            </div>
                        )}
                    </div>

                    <div className="glass rounded-3xl p-8 animate-slide-in">
                        <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                            <XCircle className="w-6 h-6 text-gray-500" />
                            Expired Codes ({expiredCodes.length})
                        </h2>
                        <div className="space-y-4">
                            {expiredCodes.slice((expiredCodesPage - 1) * codesPerPage, expiredCodesPage * codesPerPage).map((code) => (
                                <div key={code._id} className="bg-white/5 border border-white/10 rounded-xl p-4">
                                    <div className="flex justify-between items-start mb-2">
                                        <p className="text-xl font-bold text-gray-400 font-mono">{code.code}</p>
                                        {code.codeType === 'group' && (
                                            <span className="bg-amber-500/20 text-amber-400 px-2 py-1 rounded text-xs border border-amber-500/30 flex items-center gap-1">
                                                <Users className="w-3 h-3" />
                                                Group
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-gray-500 flex items-center gap-2 mt-1">
                                        <User className="w-4 h-4" />
                                        {code.visitorName}
                                    </p>
                                    {code.eventName && (
                                        <p className="text-gray-600 text-sm flex items-center gap-2 mt-1">
                                            <Home className="w-4 h-4" />
                                            {code.eventName}
                                        </p>
                                    )}
                                    <p className="text-gray-600 text-sm flex items-center gap-2 mt-1">
                                        <Clock className="w-4 h-4" />
                                        Expired: {new Date(code.validUntil).toLocaleString()}
                                    </p>
                                    {code.codeType === 'group' && code.maxUsageLimit && (
                                        <span className="text-gray-600 text-xs mt-2 inline-block">
                                            Used {code.usageCount}/{code.maxUsageLimit} entries
                                        </span>
                                    )}
                                    {code.codeType === 'single' && code.isMultiUse && code.maxUsageLimit && (
                                        <span className="text-gray-600 text-xs mt-2 inline-block">
                                            Used {code.usageCount}/{code.maxUsageLimit} uses
                                        </span>
                                    )}
                                    {code.codeType === 'single' && (!code.isMultiUse || !code.maxUsageLimit) && (
                                        <span className="text-gray-600 text-xs mt-2 inline-block">
                                            Used: {code.usageCount}x
                                        </span>
                                    )}
                                </div>
                            ))}
                            {expiredCodes.length === 0 && (
                                <p className="text-gray-500 text-center py-8">No expired codes</p>
                            )}
                        </div>
                        {expiredCodes.length > codesPerPage && (
                            <div className="flex justify-center items-center gap-4 mt-6">
                                <button
                                    onClick={() => setExpiredCodesPage(p => Math.max(1, p - 1))}
                                    disabled={expiredCodesPage === 1}
                                    className="bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed border border-white/10 text-white px-4 py-2 rounded-lg transition-all flex items-center gap-2"
                                >
                                    <ChevronLeft className="w-5 h-5" />
                                    Previous
                                </button>
                                <span className="text-gray-400">
                                    Page {expiredCodesPage} of {Math.ceil(expiredCodes.length / codesPerPage)}
                                </span>
                                <button
                                    onClick={() => setExpiredCodesPage(p => Math.min(Math.ceil(expiredCodes.length / codesPerPage), p + 1))}
                                    disabled={expiredCodesPage >= Math.ceil(expiredCodes.length / codesPerPage)}
                                    className="bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed border border-white/10 text-white px-4 py-2 rounded-lg transition-all flex items-center gap-2"
                                >
                                    Next
                                    <ChevronRight className="w-5 h-5" />
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <BottomNav role="resident" />
        </div>
    )
}
