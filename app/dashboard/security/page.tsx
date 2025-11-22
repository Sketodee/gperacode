'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { LogOut, Shield, CheckCircle, XCircle, AlertCircle, User, Home, ArrowRightCircle, ArrowLeftCircle } from 'lucide-react'
import ThemeToggle from '@/app/components/ThemeToggle'

export default function SecurityDashboard() {
    const [user, setUser] = useState<any>(null)
    const [code, setCode] = useState('')
    const [type, setType] = useState<'entry' | 'exit'>('entry')
    const [result, setResult] = useState<any>(null)
    const [loading, setLoading] = useState(false)
    const router = useRouter()

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
        <div className="min-h-screen p-4 md:p-8">
            <div className="max-w-2xl mx-auto">
                <div className="flex justify-between items-center mb-8 animate-slide-in">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <Shield className="w-8 h-8 text-primary" />
                            <h1 className="text-3xl md:text-4xl font-bold text-white">Dashboard</h1>
                        </div>
                        <p className="text-gray-400">Welcome, {user.name}</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <ThemeToggle />
                        <button
                            onClick={handleLogout}
                            className="bg-white/5 hover:bg-white/10 border border-white/10 text-white px-6 py-2 rounded-xl transition-all flex items-center gap-2"
                        >
                            <LogOut className="w-5 h-5" />
                            Logout
                        </button>
                    </div>
                </div>

                <div className="glass rounded-3xl p-8 mb-6 animate-slide-in">
                    <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                        <Shield className="w-6 h-6" />
                        Validate Access Code
                    </h2>

                    <form onSubmit={handleValidate} className="space-y-6">
                        <div>
                            <label className="block text-gray-300 text-sm font-medium mb-2">Access Code</label>
                            <input
                                type="text"
                                value={code}
                                onChange={(e) => setCode(e.target.value.toUpperCase())}
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-4 text-white text-3xl font-bold text-center placeholder-gray-500 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all uppercase tracking-widest font-mono"
                                placeholder="ENTER CODE"
                                maxLength={6}
                                autoFocus
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-gray-300 text-sm font-medium mb-3">Access Type</label>
                            <div className="grid grid-cols-2 gap-4">
                                <button
                                    type="button"
                                    onClick={() => setType('entry')}
                                    className={`py-4 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 ${type === 'entry'
                                            ? 'gradient-success text-white shadow-lg'
                                            : 'bg-white/5 text-gray-400 hover:bg-white/10 border border-white/10'
                                        }`}
                                >
                                    <ArrowRightCircle className="w-5 h-5" />
                                    Entry
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setType('exit')}
                                    className={`py-4 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 ${type === 'exit'
                                            ? 'gradient-danger text-white shadow-lg'
                                            : 'bg-white/5 text-gray-400 hover:bg-white/10 border border-white/10'
                                        }`}
                                >
                                    <ArrowLeftCircle className="w-5 h-5" />
                                    Exit
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full gradient-primary text-white font-semibold py-4 text-lg rounded-xl hover:opacity-90 transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed shadow-lg flex items-center justify-center gap-2"
                        >
                            <Shield className="w-6 h-6" />
                            {loading ? 'Validating...' : 'Validate Code'}
                        </button>
                    </form>
                </div>

                {result && (
                    <div className={`glass rounded-3xl p-8 animate-slide-in ${result.valid
                            ? 'border-2 border-teal-500/50 bg-teal-500/5'
                            : 'border-2 border-red-500/50 bg-red-500/5'
                        }`}>
                        <div className="text-center">
                            <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 ${result.valid ? 'bg-teal-500/20 border-2 border-teal-500/50' : 'bg-red-500/20 border-2 border-red-500/50'
                                }`}>
                                {result.valid ? (
                                    <CheckCircle className="w-10 h-10 text-teal-400" />
                                ) : (
                                    <XCircle className="w-10 h-10 text-red-400" />
                                )}
                            </div>
                            <h3 className={`text-3xl font-bold mb-4 ${result.valid ? 'text-teal-400' : 'text-red-400'}`}>
                                {result.message}
                            </h3>
                            {result.details && (
                                <div className="mt-4 bg-white/5 border border-white/10 rounded-xl p-6">
                                    <div className="flex items-center justify-center gap-2 mb-3">
                                        <User className="w-6 h-6 text-primary" />
                                        <p className="text-white font-medium text-xl">{result.details.visitorName}</p>
                                    </div>
                                    <div className="space-y-2 text-gray-400">
                                        <p className="flex items-center justify-center gap-2">
                                            <Home className="w-5 h-5" />
                                            Visiting: {result.details.residentName}
                                        </p>
                                        {result.details.unitNumber && (
                                            <p>Unit: {result.details.unitNumber}</p>
                                        )}
                                        {result.valid && (
                                            <>
                                                {result.details.isMultiUse && (
                                                    <span className="inline-flex px-3 py-1 rounded-lg text-sm font-medium bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                                                        Multi-use code
                                                    </span>
                                                )}
                                                <p className="text-sm mt-2">Total uses: {result.details.usageCount}</p>
                                            </>
                                        )}
                                    </div>
                                </div>
                            )}
                            {!result.valid && result.details && (
                                <div className="mt-4 bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 flex gap-3 items-start">
                                    <AlertCircle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                                    <div className="text-left text-amber-400 text-sm">
                                        {result.details.validFrom && (
                                            <p>Valid: {new Date(result.details.validFrom).toLocaleString()} - {new Date(result.details.validUntil).toLocaleString()}</p>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
