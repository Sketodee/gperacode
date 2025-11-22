'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { LogOut, Plus, Home, Calendar, Clock, User, CheckCircle, XCircle, Copy, Check, Share2, Mail, MessageSquare, Phone, ChevronLeft, ChevronRight, Users, Link as LinkIcon, Settings, History } from 'lucide-react'
import ThemeToggle from '@/app/components/ThemeToggle'
import BottomNav from '@/app/components/BottomNav'

export default function ResidentDashboard() {
    const [user, setUser] = useState<any>(null)
    const [codes, setCodes] = useState<any[]>([])
    const [codeType, setCodeType] = useState<'single' | 'group' | 'event'>('single')
    const [formData, setFormData] = useState({
        visitorName: '',
        validFrom: '',
        validUntil: '',
        isMultiUse: false,
        allowExit: true,
        eventName: '',
        maxUsageLimit: 20
    })
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState('')
    const [copiedCode, setCopiedCode] = useState('')
    const [copiedLink, setCopiedLink] = useState(false)
    const [generatedEventLink, setGeneratedEventLink] = useState('')
    const [activeCodesPage, setActiveCodesPage] = useState(1)
    const [expiredCodesPage, setExpiredCodesPage] = useState(1)
    const codesPerPage = 5
    const [latestGeneratedCode, setLatestGeneratedCode] = useState<any>(null)
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

    const handleCreateCode = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setMessage('')
        setGeneratedEventLink('')

        // Validate dates
        const validFrom = new Date(formData.validFrom)
        const validUntil = new Date(formData.validUntil)

        if (validUntil <= validFrom) {
            setMessage('Valid Until date must be greater than Valid From date')
            setLoading(false)
            setTimeout(() => setMessage(''), 5000)
            return
        }

        try {
            const token = localStorage.getItem('token')
            const payload = {
                ...formData,
                codeType: codeType
            }

            const response = await fetch('/api/codes', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            })

            const data = await response.json()

            if (!response.ok) {
                setMessage(data.error || 'Failed to create code')
                setLoading(false)
                return
            }

            setMessage(`Code generated successfully!`)
            setLatestGeneratedCode(data.code)

            setFormData({
                visitorName: '',
                validFrom: '',
                validUntil: '',
                isMultiUse: false,
                allowExit: true,
                eventName: '',
                maxUsageLimit: 20
            })
            fetchCodes()
            setLoading(false)

            // Auto clear generated code after 30 seconds
            setTimeout(() => {
                setLatestGeneratedCode(null)
                setMessage('')
            }, 30000)
        } catch (err) {
            setMessage('An error occurred')
            setLoading(false)
        }
    }

    const copyEventLink = () => {
        navigator.clipboard.writeText(generatedEventLink)
        setCopiedLink(true)
        setTimeout(() => setCopiedLink(false), 2000)
    }

    const shareEventLink = (method: 'whatsapp' | 'sms' | 'email') => {
        const message = `You're invited! Register for access:\n\n${generatedEventLink}\n\nClick the link to get your personal access code.`

        if (method === 'whatsapp') {
            window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank')
        } else if (method === 'sms') {
            window.open(`sms:?body=${encodeURIComponent(message)}`, '_blank')
        } else if (method === 'email') {
            window.open(`mailto:?subject=Event Invitation - Access Code&body=${encodeURIComponent(message)}`, '_blank')
        }
    }

    const copyCode = (code: string) => {
        navigator.clipboard.writeText(code)
        setCopiedCode(code)
        setTimeout(() => setCopiedCode(''), 2000)
    }

    const shareCode = (code: any, method: 'whatsapp' | 'sms' | 'email') => {
        const message = `Your visitor access code is: ${code.code}\n\nVisitor: ${code.visitorName}\nValid from: ${new Date(code.validFrom).toLocaleString()}\nValid until: ${new Date(code.validUntil).toLocaleString()}\n\nPlease present this code at the estate gate.`

        if (method === 'whatsapp') {
            window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank')
        } else if (method === 'sms') {
            window.open(`sms:?body=${encodeURIComponent(message)}`, '_blank')
        } else if (method === 'email') {
            window.open(`mailto:?subject=Estate Access Code - ${code.code}&body=${encodeURIComponent(message)}`, '_blank')
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
                            <h1 className="text-3xl md:text-4xl font-bold text-white">Dashboard</h1>
                        </div>
                        <p className="text-gray-400">Welcome, {user.name} • Unit {user.unitNumber}</p>
                    </div>
                    <div className="hidden md:flex items-center gap-3">
                        <button
                            onClick={() => router.push('/dashboard/history')}
                            className="bg-white/5 hover:bg-white/10 border border-white/10 text-white px-4 py-2 rounded-xl transition-all flex items-center gap-2"
                        >
                            <History className="w-5 h-5" />
                            History
                        </button>
                        <button
                            onClick={() => router.push('/dashboard/settings')}
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

                {message && (
                    <div className={`mb-6 glass rounded-xl p-4 animate-fade-in flex items-center gap-2 ${message.includes('success') || message.includes('generated') ? 'text-teal-400 border border-teal-500/30' : 'text-red-400 border border-red-500/30'}`}>
                        {message.includes('success') || message.includes('generated') ? <CheckCircle className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
                        {message}
                    </div>
                )}

                {/* Form always visible */}
                <div className="glass rounded-3xl p-8 mb-6 animate-slide-in">
                    <h2 className="text-2xl font-bold text-white mb-6">Generate Access Code</h2>

                    {/* Code Type Tabs - Icon only on mobile, icon + text on desktop */}
                    <div className="grid grid-cols-2 gap-3 mb-6">
                        <button
                            type="button"
                            onClick={() => setCodeType('single')}
                            className={`px-4 md:px-6 py-3 md:py-4 rounded-xl font-semibold transition-all flex flex-row items-center justify-center gap-2 ${
                                codeType === 'single'
                                    ? 'gradient-primary text-white shadow-lg'
                                    : 'bg-white/5 border border-white/10 text-gray-400 hover:bg-white/10 hover:text-white'
                            }`}
                        >
                            <User className="w-6 h-6 md:w-6 md:h-6" />
                            <span className="hidden md:inline">Single Visitor</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => setCodeType('group')}
                            className={`px-4 md:px-6 py-3 md:py-4 rounded-xl font-semibold transition-all flex flex-row items-center justify-center gap-2 ${
                                codeType === 'group'
                                    ? 'gradient-primary text-white shadow-lg'
                                    : 'bg-white/5 border border-white/10 text-gray-400 hover:bg-white/10 hover:text-white'
                            }`}
                        >
                            <Users className="w-6 h-6 md:w-6 md:h-6" />
                            <span className="hidden md:inline">Group Code</span>
                        </button>
                    </div>

                        <form onSubmit={handleCreateCode} className="space-y-6">
                            {/* Single Visitor Form */}
                            {codeType === 'single' && (
                                <div>
                                    <label className="block text-gray-300 text-sm font-medium mb-2 flex items-center gap-2">
                                        <User className="w-4 h-4" />
                                        Visitor Name
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.visitorName}
                                        onChange={(e) => setFormData({ ...formData, visitorName: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                                        placeholder="John Doe"
                                        required
                                    />
                                </div>
                            )}

                            {/* Group/Event Form */}
                            {codeType === 'group' && (
                                <div>
                                    <label className="block text-gray-300 text-sm font-medium mb-2 flex items-center gap-2">
                                        <Home className="w-4 h-4" />
                                        {codeType === 'group' ? 'Group/Event Name' : 'Event Name'}
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.eventName}
                                        onChange={(e) => setFormData({ ...formData, eventName: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                                        placeholder="Birthday Party"
                                        required
                                    />
                                </div>
                            )}

                            {/* Max Usage for Group Code */}
                            {codeType === 'group' && (
                                <div>
                                    <label className="block text-gray-300 text-sm font-medium mb-2 flex items-center gap-2">
                                        <Users className="w-4 h-4" />
                                        Max Entries
                                    </label>
                                    <input
                                        type="number"
                                        value={formData.maxUsageLimit}
                                        onChange={(e) => setFormData({ ...formData, maxUsageLimit: parseInt(e.target.value) })}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                                        placeholder="20"
                                        min="1"
                                        required
                                    />
                                    <p className="text-gray-500 text-xs mt-1">Expected number of entries (allows buffer for re-entry)</p>
                                </div>
                            )}

                            <div className="grid md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-gray-300 text-sm font-medium mb-2 flex items-center gap-2">
                                        <Calendar className="w-4 h-4" />
                                        Valid From
                                    </label>
                                    <input
                                        type="datetime-local"
                                        value={formData.validFrom}
                                        onChange={(e) => setFormData({ ...formData, validFrom: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all [color-scheme:dark]"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-gray-300 text-sm font-medium mb-2 flex items-center gap-2">
                                        <Clock className="w-4 h-4" />
                                        Valid Until
                                    </label>
                                    <input
                                        type="datetime-local"
                                        value={formData.validUntil}
                                        onChange={(e) => setFormData({ ...formData, validUntil: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all [color-scheme:dark]"
                                        required
                                    />
                                </div>
                            </div>

                            {codeType === 'single' && (
                                <>
                                    <div className="flex gap-6">
                                        <label className="flex items-center gap-3 text-gray-300 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={formData.isMultiUse}
                                                onChange={(e) => setFormData({ ...formData, isMultiUse: e.target.checked })}
                                                className="w-5 h-5 rounded bg-white/5 border-white/10 text-primary focus:ring-primary"
                                            />
                                            <span>Multi-use code</span>
                                        </label>

                                        <label className="flex items-center gap-3 text-gray-300 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={formData.allowExit}
                                                onChange={(e) => setFormData({ ...formData, allowExit: e.target.checked })}
                                                className="w-5 h-5 rounded bg-white/5 border-white/10 text-primary focus:ring-primary"
                                            />
                                            <span>Allow exit</span>
                                        </label>
                                    </div>

                                    {formData.isMultiUse && (
                                        <div>
                                            <label className="block text-gray-300 text-sm font-medium mb-2 flex items-center gap-2">
                                                <Users className="w-4 h-4" />
                                                Max Usage Count
                                            </label>
                                            <input
                                                type="number"
                                                value={formData.maxUsageLimit}
                                                onChange={(e) => setFormData({ ...formData, maxUsageLimit: parseInt(e.target.value) })}
                                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                                                placeholder="10"
                                                min="1"
                                                required
                                            />
                                            <p className="text-gray-500 text-xs mt-1">Number of times this code can be used</p>
                                        </div>
                                    )}
                                </>
                            )}

                            <button
                                type="submit"
                                disabled={loading}
                                className="gradient-primary text-white font-semibold px-8 py-3 rounded-xl hover:opacity-90 transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed shadow-lg flex items-center gap-2"
                            >
                                <Plus className="w-5 h-5" />
                                {loading ? 'Generating...' : codeType === 'group' ? 'Generate Group Code' : 'Generate Code'}
                            </button>
                        </form>

                        {/* Generated Code Display - Mobile Only */}
                        {latestGeneratedCode && (
                            <div className="mt-6 bg-teal-500/10 border-2 border-teal-500/30 rounded-2xl p-6 animate-slide-in md:hidden">
                                <h3 className="text-xl font-bold text-teal-400 mb-4 flex items-center gap-2">
                                    <CheckCircle className="w-6 h-6" />
                                    Code Generated Successfully!
                                </h3>
                                <div className="bg-white/5 border border-white/10 rounded-xl p-4 mb-4">
                                    <p className="text-4xl font-bold text-white text-center font-mono tracking-widest">
                                        {latestGeneratedCode.code}
                                    </p>
                                </div>
                                <div className="space-y-2 mb-4 text-sm text-gray-300">
                                    <p className="flex items-center gap-2">
                                        <User className="w-4 h-4" />
                                        <span className="font-medium">Visitor:</span> {latestGeneratedCode.visitorName}
                                    </p>
                                    {latestGeneratedCode.eventName && (
                                        <p className="flex items-center gap-2">
                                            <Home className="w-4 h-4" />
                                            <span className="font-medium">Event:</span> {latestGeneratedCode.eventName}
                                        </p>
                                    )}
                                    <p className="flex items-center gap-2">
                                        <Clock className="w-4 h-4" />
                                        <span className="font-medium">Valid Until:</span> {new Date(latestGeneratedCode.validUntil).toLocaleString()}
                                    </p>
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                    <button
                                        onClick={() => {
                                            navigator.clipboard.writeText(latestGeneratedCode.code)
                                            setCopiedCode(latestGeneratedCode.code)
                                            setTimeout(() => setCopiedCode(''), 2000)
                                        }}
                                        className="bg-white/10 hover:bg-white/20 text-white px-4 py-3 rounded-lg transition-colors flex items-center justify-center gap-2 text-sm"
                                    >
                                        {copiedCode === latestGeneratedCode.code ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                        {copiedCode === latestGeneratedCode.code ? 'Copied!' : 'Copy'}
                                    </button>
                                    <button
                                        onClick={() => shareCode(latestGeneratedCode, 'whatsapp')}
                                        className="bg-teal-600/20 hover:bg-teal-600/30 text-teal-400 px-4 py-3 rounded-lg transition-colors flex items-center justify-center gap-2 text-sm"
                                    >
                                        <MessageSquare className="w-4 h-4" />
                                        WhatsApp
                                    </button>
                                    <button
                                        onClick={() => shareCode(latestGeneratedCode, 'sms')}
                                        className="bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-400 px-4 py-3 rounded-lg transition-colors flex items-center justify-center gap-2 text-sm"
                                    >
                                        <Phone className="w-4 h-4" />
                                        SMS
                                    </button>
                                    <button
                                        onClick={() => shareCode(latestGeneratedCode, 'email')}
                                        className="bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-400 px-4 py-3 rounded-lg transition-colors flex items-center justify-center gap-2 text-sm"
                                    >
                                        <Mail className="w-4 h-4" />
                                        Email
                                    </button>
                                </div>
                            </div>
                        )}
                </div>

                {/* Desktop: Active and Expired Codes Grid */}
                <div className="hidden md:grid md:grid-cols-2 gap-6">
                    <div className="glass rounded-3xl p-8 animate-slide-in">
                        <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                            <CheckCircle className="w-6 h-6 text-teal-400" />
                            Active Codes ({activeCodes.length})
                        </h2>
                        <div className="space-y-4">
                            {activeCodes.slice((activeCodesPage - 1) * codesPerPage, activeCodesPage * codesPerPage).map((code) => (
                                <div key={code._id} className="bg-gradient-to-r from-teal-500/10 to-teal-600/10 border border-teal-500/30 rounded-xl p-4">
                                    <div className="flex justify-between items-start mb-2">
                                        <div className="flex items-center gap-2">
                                            <p className="text-3xl font-bold text-teal-400 font-mono tracking-wider">{code.code}</p>
                                            <button
                                                onClick={() => copyCode(code.code)}
                                                className="bg-white/10 hover:bg-white/20 p-2 rounded-lg transition-colors"
                                                title="Copy code"
                                            >
                                                {copiedCode === code.code ? <Check className="w-4 h-4 text-teal-400" /> : <Copy className="w-4 h-4 text-gray-400" />}
                                            </button>
                                        </div>
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
                                    <div className="flex gap-2 mt-3 pt-3 border-t border-teal-500/20">
                                        <button
                                            onClick={() => shareCode(code, 'whatsapp')}
                                            className="flex-1 bg-teal-600/20 hover:bg-teal-600/30 text-teal-400 px-3 py-2 rounded-lg transition-colors flex items-center justify-center gap-2 text-sm"
                                            title="Share via WhatsApp"
                                        >
                                            <MessageSquare className="w-4 h-4" />
                                            WhatsApp
                                        </button>
                                        <button
                                            onClick={() => shareCode(code, 'sms')}
                                            className="flex-1 bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-400 px-3 py-2 rounded-lg transition-colors flex items-center justify-center gap-2 text-sm"
                                            title="Share via SMS"
                                        >
                                            <Phone className="w-4 h-4" />
                                            SMS
                                        </button>
                                        <button
                                            onClick={() => shareCode(code, 'email')}
                                            className="flex-1 bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-400 px-3 py-2 rounded-lg transition-colors flex items-center justify-center gap-2 text-sm"
                                            title="Share via Email"
                                        >
                                            <Mail className="w-4 h-4" />
                                            Email
                                        </button>
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
                                    className="bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed border border-white/10 px-4 py-2 rounded-lg transition-all flex items-center gap-2 text-white"
                                >
                                    <ChevronLeft className="w-5 h-5" />
                                    Prev
                                </button>
                                <span className="text-gray-400">
                                    Page {activeCodesPage} of {Math.ceil(activeCodes.length / codesPerPage)}
                                </span>
                                <button
                                    onClick={() => setActiveCodesPage(p => Math.min(Math.ceil(activeCodes.length / codesPerPage), p + 1))}
                                    disabled={activeCodesPage >= Math.ceil(activeCodes.length / codesPerPage)}
                                    className="bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed border border-white/10 px-4 py-2 rounded-lg transition-all flex items-center gap-2 text-white"
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
                                    className="bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed border border-white/10 px-4 py-2 rounded-lg transition-all flex items-center gap-2 text-white"
                                >
                                    <ChevronLeft className="w-5 h-5" />
                                    Prev
                                </button>
                                <span className="text-gray-400">
                                    Page {expiredCodesPage} of {Math.ceil(expiredCodes.length / codesPerPage)}
                                </span>
                                <button
                                    onClick={() => setExpiredCodesPage(p => Math.min(Math.ceil(expiredCodes.length / codesPerPage), p + 1))}
                                    disabled={expiredCodesPage >= Math.ceil(expiredCodes.length / codesPerPage)}
                                    className="bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed border border-white/10 px-4 py-2 rounded-lg transition-all flex items-center gap-2 text-white"
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
