'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Calendar, Clock, User, CheckCircle, Home, Copy, Check, Mail, MessageSquare, Phone } from 'lucide-react'

export default function EventRegistration() {
    const params = useParams()
    const router = useRouter()
    const [event, setEvent] = useState<any>(null)
    const [guestName, setGuestName] = useState('')
    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)
    const [generatedCode, setGeneratedCode] = useState<any>(null)
    const [error, setError] = useState('')
    const [copied, setCopied] = useState(false)

    useEffect(() => {
        fetchEventDetails()
    }, [])

    const fetchEventDetails = async () => {
        try {
            const response = await fetch(`/api/events/${params.eventId}`)
            const data = await response.json()

            if (!response.ok) {
                setError(data.error || 'Event not found')
                setLoading(false)
                return
            }

            setEvent(data)
            setLoading(false)
        } catch (err) {
            setError('Failed to load event details')
            setLoading(false)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setSubmitting(true)
        setError('')

        try {
            const response = await fetch(`/api/events/${params.eventId}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ guestName })
            })

            const data = await response.json()

            if (!response.ok) {
                setError(data.error || 'Failed to register')
                setSubmitting(false)
                return
            }

            setGeneratedCode(data)
            setSubmitting(false)
        } catch (err) {
            setError('An error occurred')
            setSubmitting(false)
        }
    }

    const copyCode = () => {
        navigator.clipboard.writeText(generatedCode.code)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    const shareCode = (method: 'whatsapp' | 'sms' | 'email') => {
        const message = `Your access code for ${generatedCode.eventName}:\n\nCode: ${generatedCode.code}\nName: ${generatedCode.guestName}\nValid from: ${new Date(generatedCode.validFrom).toLocaleString()}\nValid until: ${new Date(generatedCode.validUntil).toLocaleString()}\n\nPlease present this code at the estate gate.`

        if (method === 'whatsapp') {
            window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank')
        } else if (method === 'sms') {
            window.open(`sms:?body=${encodeURIComponent(message)}`, '_blank')
        } else if (method === 'email') {
            window.open(`mailto:?subject=Access Code - ${generatedCode.eventName}&body=${encodeURIComponent(message)}`, '_blank')
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
        )
    }

    if (error && !event) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
                <div className="glass rounded-3xl p-8 max-w-md text-center">
                    <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CheckCircle className="w-8 h-8 text-red-400" />
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-2">Event Not Found</h2>
                    <p className="text-gray-400 mb-6">{error}</p>
                    <button
                        onClick={() => router.push('/')}
                        className="bg-primary hover:bg-primary/90 text-white px-6 py-3 rounded-xl transition-all"
                    >
                        Go to Homepage
                    </button>
                </div>
            </div>
        )
    }

    if (generatedCode) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
                <div className="glass rounded-3xl p-8 max-w-md w-full animate-slide-in">
                    <div className="text-center mb-6">
                        <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                            <CheckCircle className="w-8 h-8 text-green-400" />
                        </div>
                        <h2 className="text-2xl font-bold text-white mb-2">Registration Successful!</h2>
                        <p className="text-gray-400">Your access code has been generated</p>
                    </div>

                    <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/30 rounded-xl p-6 mb-6">
                        <div className="flex items-center justify-between mb-4">
                            <p className="text-4xl font-bold text-green-400 font-mono tracking-wider">{generatedCode.code}</p>
                            <button
                                onClick={copyCode}
                                className="bg-white/10 hover:bg-white/20 p-3 rounded-lg transition-colors"
                                title="Copy code"
                            >
                                {copied ? <Check className="w-5 h-5 text-green-400" /> : <Copy className="w-5 h-5 text-gray-400" />}
                            </button>
                        </div>

                        <div className="space-y-2 text-sm">
                            <p className="text-white flex items-center gap-2">
                                <User className="w-4 h-4" />
                                {generatedCode.guestName}
                            </p>
                            <p className="text-gray-400 flex items-center gap-2">
                                <Home className="w-4 h-4" />
                                {generatedCode.eventName}
                            </p>
                            <p className="text-gray-400 flex items-center gap-2">
                                <Calendar className="w-4 h-4" />
                                {new Date(generatedCode.validFrom).toLocaleDateString()}
                            </p>
                            <p className="text-gray-400 flex items-center gap-2">
                                <Clock className="w-4 h-4" />
                                Valid until: {new Date(generatedCode.validUntil).toLocaleString()}
                            </p>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <p className="text-gray-400 text-sm text-center mb-3">Share your code:</p>
                        <div className="grid grid-cols-3 gap-3">
                            <button
                                onClick={() => shareCode('whatsapp')}
                                className="bg-green-600/20 hover:bg-green-600/30 text-green-400 px-4 py-3 rounded-lg transition-colors flex flex-col items-center justify-center gap-2"
                            >
                                <MessageSquare className="w-5 h-5" />
                                <span className="text-xs">WhatsApp</span>
                            </button>
                            <button
                                onClick={() => shareCode('sms')}
                                className="bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 px-4 py-3 rounded-lg transition-colors flex flex-col items-center justify-center gap-2"
                            >
                                <Phone className="w-5 h-5" />
                                <span className="text-xs">SMS</span>
                            </button>
                            <button
                                onClick={() => shareCode('email')}
                                className="bg-purple-600/20 hover:bg-purple-600/30 text-purple-400 px-4 py-3 rounded-lg transition-colors flex flex-col items-center justify-center gap-2"
                            >
                                <Mail className="w-5 h-5" />
                                <span className="text-xs">Email</span>
                            </button>
                        </div>
                    </div>

                    <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                        <p className="text-blue-400 text-sm">
                            💡 <strong>Important:</strong> Save or screenshot this code. Present it at the estate gate for entry.
                        </p>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
            <div className="glass rounded-3xl p-8 max-w-md w-full animate-slide-in">
                <div className="text-center mb-6">
                    <div className="w-16 h-16 gradient-primary rounded-full flex items-center justify-center mx-auto mb-4">
                        <Home className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-3xl font-bold text-white mb-2">{event.eventName}</h1>
                    <p className="text-gray-400">Hosted by {event.residentName}</p>
                </div>

                <div className="mb-6 space-y-3">
                    <div className="flex items-center gap-3 text-gray-300">
                        <Calendar className="w-5 h-5 text-primary" />
                        <span>{new Date(event.validFrom).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-3 text-gray-300">
                        <Clock className="w-5 h-5 text-primary" />
                        <span>{new Date(event.validFrom).toLocaleTimeString()} - {new Date(event.validUntil).toLocaleTimeString()}</span>
                    </div>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-gray-300 text-sm font-medium mb-2 flex items-center gap-2">
                            <User className="w-4 h-4" />
                            Your Name
                        </label>
                        <input
                            type="text"
                            value={guestName}
                            onChange={(e) => setGuestName(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                            placeholder="Enter your full name"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={submitting}
                        className="w-full gradient-primary text-white font-semibold px-8 py-3 rounded-xl hover:opacity-90 transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                    >
                        {submitting ? 'Generating Code...' : 'Get My Access Code'}
                    </button>
                </form>

                <div className="mt-6 p-4 bg-white/5 rounded-lg">
                    <p className="text-gray-400 text-sm text-center">
                        Enter your name to receive a unique access code for this event
                    </p>
                </div>
            </div>
        </div>
    )
}
