'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { LogOut, Shield, CheckCircle, XCircle, AlertCircle, User, Home, ArrowRightCircle, ArrowLeftCircle, Settings } from 'lucide-react'
import ThemeToggle from '@/app/components/ThemeToggle'
import BottomNav from '@/app/components/BottomNav'

export default function SecurityDashboard() {
    const [user, setUser] = useState<any>(null)
    const [code, setCode] = useState('')
    const [type, setType] = useState<'entry' | 'exit'>('entry')
    const [result, setResult] = useState<any>(null)
    const [loading, setLoading] = useState(false)
    const router = useRouter()
    const resultRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const userData = localStorage.getItem('user')
        const token = localStorage.getItem('token')

        if (!userData || !token) {
            router.push('/login')
            return
        }

        const parsedUser = JSON.parse(userData)
        if (parsedUser.role !== 'security') {
            router.push('/login')
            return
        }

        setUser(parsedUser)
    }, [router])

    // Scroll to result when it appears
    useEffect(() => {
        if (result && resultRef.current) {
            setTimeout(() => {
                resultRef.current?.scrollIntoView({
                    behavior: 'smooth',
                    block: 'nearest'
                })
            }, 100)
        }
    }, [result])

    const handleValidate = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setResult(null)

        try {
            const token = localStorage.getItem('token')
            const response = await fetch('/api/codes/validate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ code: code.toUpperCase(), type })
            })

            const data = await response.json()
            setResult(data)
            setCode('')
            setLoading(false)

            // Auto-clear result after 8 seconds
            setTimeout(() => setResult(null), 8000)
        } catch (err) {
            setResult({ valid: false, message: 'An error occurred' })
            setLoading(false)
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

    return (
        <div className="min-h-screen p-4 md:p-8 pb-20 md:pb-8">
            <div className="max-w-2xl mx-auto">
                <div className="flex justify-between items-center mb-8 animate-slide-in">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <Shield className="w-8 h-8 text-primary" />
                            <h1 className="text-3xl md:text-4xl font-bold text-white">Dashboard</h1>
                        </div>
                        <p className="text-gray-400">Welcome, {user.name}</p>
                    </div>
                    <div className="hidden md:flex items-center gap-3">
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

                <div className="glass rounded-3xl p-6 md:p-8 mb-6 animate-slide-in">
                    <form onSubmit={handleValidate} className="space-y-6">
                        {/* Access Type Selection */}
                        <div>
                            <label className="block text-sm font-medium mb-3 text-center" style={{ color: 'var(--text-secondary)' }}>
                                Select Access Type
                            </label>
                            <div className="grid grid-cols-2 gap-3 md:gap-4">
                                <button
                                    type="button"
                                    onClick={() => setType('entry')}
                                    className={`py-4 md:py-5 rounded-2xl font-semibold transition-all flex items-center justify-center gap-2 ${
                                        type === 'entry'
                                            ? 'gradient-success text-white shadow-xl scale-105'
                                            : 'bg-white/5 hover:bg-white/10 border border-white/10 hover:scale-105'
                                        }`}
                                    style={{ color: type === 'entry' ? 'white' : 'var(--text-secondary)' }}
                                >
                                    <ArrowRightCircle className="w-5 h-5 md:w-6 md:h-6" />
                                    <span className="text-base md:text-lg">Entry</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setType('exit')}
                                    className={`py-4 md:py-5 rounded-2xl font-semibold transition-all flex items-center justify-center gap-2 ${
                                        type === 'exit'
                                            ? 'gradient-warning text-white shadow-xl scale-105'
                                            : 'bg-white/5 hover:bg-white/10 border border-white/10 hover:scale-105'
                                        }`}
                                    style={{ color: type === 'exit' ? 'white' : 'var(--text-secondary)' }}
                                >
                                    <ArrowLeftCircle className="w-5 h-5 md:w-6 md:h-6" />
                                    <span className="text-base md:text-lg">Exit</span>
                                </button>
                            </div>
                        </div>

                        {/* Access Code Input */}
                        <div>
                            <label className="block text-sm font-medium mb-3 text-center" style={{ color: 'var(--text-secondary)' }}>
                                Enter Access Code
                            </label>
                            <div className="relative">
                                <input
                                    type="text"
                                    value={code}
                                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                                    className="w-full bg-white/5 border-2 border-white/10 rounded-2xl px-4 py-6 md:py-8 text-4xl md:text-5xl font-bold text-center placeholder-gray-500 focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/20 transition-all uppercase tracking-[0.3em] font-mono"
                                    style={{ color: 'var(--text-primary)' }}
                                    placeholder="••••••"
                                    maxLength={6}
                                    autoFocus
                                    required
                                />
                                <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-transparent via-primary/20 to-transparent"></div>
                            </div>
                            <p className="text-xs text-center mt-3" style={{ color: 'var(--text-tertiary)' }}>
                                {code.length}/6 characters
                            </p>
                        </div>

                        {/* Validate Button */}
                        <button
                            type="submit"
                            disabled={loading || code.length !== 6}
                            className="w-full gradient-primary text-white font-bold py-5 md:py-6 text-lg md:text-xl rounded-2xl hover:opacity-90 transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-2xl flex items-center justify-center gap-3"
                        >
                            {loading ? (
                                <>
                                    <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-white"></div>
                                    <span>Validating...</span>
                                </>
                            ) : (
                                <>
                                    <Shield className="w-6 h-6 md:w-7 md:h-7" />
                                    <span>Validate Access Code</span>
                                </>
                            )}
                        </button>
                    </form>
                </div>

                {result && (
                    <div
                        ref={resultRef}
                        className={`glass rounded-3xl p-6 md:p-8 animate-slide-in overflow-hidden ${
                        result.valid
                            ? 'border-2 border-teal-500/50 bg-teal-500/5'
                            : 'border-2 border-red-500/50 bg-red-500/5'
                        }`}>
                        {/* Success/Error Icon and Message */}
                        <div className="text-center mb-6">
                            <div className={`w-24 h-24 md:w-28 md:h-28 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse ${
                                result.valid
                                    ? 'bg-teal-500/20 border-4 border-teal-500/50 shadow-lg shadow-teal-500/20'
                                    : 'bg-red-500/20 border-4 border-red-500/50 shadow-lg shadow-red-500/20'
                                }`}>
                                {result.valid ? (
                                    <CheckCircle className="w-12 h-12 md:w-14 md:h-14 text-teal-400" strokeWidth={2.5} />
                                ) : (
                                    <XCircle className="w-12 h-12 md:w-14 md:h-14 text-red-400" strokeWidth={2.5} />
                                )}
                            </div>
                            <h3 className={`text-2xl md:text-3xl font-bold mb-2 ${result.valid ? 'text-teal-400' : 'text-red-400'}`}>
                                {result.message}
                            </h3>
                        </div>

                        {/* Valid Access Details */}
                        {result.valid && result.details && (
                            <div className="space-y-4">
                                {/* Visitor Info Card */}
                                <div className="bg-white/5 border border-white/10 rounded-2xl p-5 md:p-6">
                                    <div className="flex items-center gap-3 mb-4 pb-4 border-b border-white/10">
                                        <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                                            <User className="w-6 h-6 text-primary" />
                                        </div>
                                        <div className="flex-1 text-left">
                                            <p className="text-xs font-medium mb-1" style={{ color: 'var(--text-tertiary)' }}>Visitor Name</p>
                                            <p className="font-bold text-lg md:text-xl" style={{ color: 'var(--text-primary)' }}>
                                                {result.details.visitorName}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0">
                                                <Home className="w-5 h-5 text-accent" />
                                            </div>
                                            <div className="text-left">
                                                <p className="text-xs font-medium" style={{ color: 'var(--text-tertiary)' }}>Visiting</p>
                                                <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                                                    {result.details.residentName}
                                                    {result.details.unitNumber && (
                                                        <span style={{ color: 'var(--text-secondary)' }}> • Unit {result.details.unitNumber}</span>
                                                    )}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Multi-use badge and usage count */}
                                        {result.details.isMultiUse && (
                                            <div className="flex items-center justify-between pt-3 border-t border-white/10">
                                                <span className="inline-flex px-4 py-2 rounded-full text-sm font-semibold bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                                                    Multi-use Code
                                                </span>
                                                <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                                                    {result.details.usageCount} {result.details.usageCount === 1 ? 'use' : 'uses'}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Access Granted Banner */}
                                <div className="bg-linear-to-r from-teal-500/10 via-teal-500/20 to-teal-500/10 border border-teal-500/30 rounded-2xl p-4 text-center">
                                    <p className="text-teal-400 font-bold text-lg">✓ Access Granted</p>
                                    <p className="text-xs mt-1" style={{ color: 'var(--text-tertiary)' }}>
                                        {type === 'entry' ? 'Entry logged successfully' : 'Exit logged successfully'}
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Invalid Access Details */}
                        {!result.valid && (
                            <div className="space-y-4">
                                {result.details && result.details.validFrom && (
                                    <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-5">
                                        <div className="flex gap-3 items-start">
                                            <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center flex-shrink-0">
                                                <AlertCircle className="w-5 h-5 text-amber-400" />
                                            </div>
                                            <div className="text-left flex-1">
                                                <p className="font-semibold text-amber-400 mb-2">Code Validity Period</p>
                                                <div className="text-sm space-y-1" style={{ color: 'var(--text-secondary)' }}>
                                                    <p>From: {new Date(result.details.validFrom).toLocaleString()}</p>
                                                    <p>Until: {new Date(result.details.validUntil).toLocaleString()}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Access Denied Banner */}
                                <div className="bg-linear-to-r from-red-500/10 via-red-500/20 to-red-500/10 border border-red-500/30 rounded-2xl p-4 text-center">
                                    <p className="text-red-400 font-bold text-lg">✗ Access Denied</p>
                                    <p className="text-xs mt-1" style={{ color: 'var(--text-tertiary)' }}>
                                        Do not grant entry
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            <BottomNav role="security" />
        </div>
    )
}
