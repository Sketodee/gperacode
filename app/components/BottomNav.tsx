'use client'

import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { Home, History, Users, ScrollText, Settings } from 'lucide-react'
import { Suspense } from 'react'

interface BottomNavProps {
    role: 'resident' | 'admin'
}

function BottomNavContent({ role }: BottomNavProps) {
    const pathname = usePathname()
    const router = useRouter()
    const searchParams = useSearchParams()

    if (role === 'resident') {
        return (
            <div className="fixed bottom-0 left-0 right-0 bg-[var(--bg-secondary)] border-t border-white/10 md:hidden z-50 safe-area-pb">
                <div className="flex justify-around items-center h-16 px-4">
                    <button
                        onClick={() => router.push('/dashboard')}
                        className={`flex flex-col items-center justify-center flex-1 h-full transition-all ${
                            pathname === '/dashboard'
                                ? 'text-primary'
                                : 'text-gray-400 hover:text-gray-300'
                        }`}
                    >
                        <Home className="w-6 h-6 mb-1" />
                        <span className="text-xs font-medium">Dashboard</span>
                    </button>
                    <button
                        onClick={() => router.push('/dashboard/history')}
                        className={`flex flex-col items-center justify-center flex-1 h-full transition-all ${
                            pathname === '/dashboard/history'
                                ? 'text-primary'
                                : 'text-gray-400 hover:text-gray-300'
                        }`}
                    >
                        <History className="w-6 h-6 mb-1" />
                        <span className="text-xs font-medium">History</span>
                    </button>
                    <button
                        onClick={() => router.push('/dashboard/settings')}
                        className={`flex flex-col items-center justify-center flex-1 h-full transition-all ${
                            pathname === '/dashboard/settings'
                                ? 'text-primary'
                                : 'text-gray-400 hover:text-gray-300'
                        }`}
                    >
                        <Settings className="w-6 h-6 mb-1" />
                        <span className="text-xs font-medium">Settings</span>
                    </button>
                </div>
            </div>
        )
    }

    if (role === 'admin') {
        const currentTab = searchParams.get('tab') || 'users'
        const isOnSettings = pathname === '/dashboard/settings'

        return (
            <div className="fixed bottom-0 left-0 right-0 bg-[var(--bg-secondary)] border-t border-white/10 md:hidden z-50 safe-area-pb">
                <div className="flex justify-around items-center h-16 px-4">
                    <button
                        onClick={() => router.push('/dashboard?tab=users')}
                        className={`flex flex-col items-center justify-center flex-1 h-full transition-all ${
                            currentTab === 'users' && !isOnSettings
                                ? 'text-primary'
                                : 'text-gray-400 hover:text-gray-300'
                        }`}
                    >
                        <Users className="w-6 h-6 mb-1" />
                        <span className="text-xs font-medium">Users</span>
                    </button>
                    <button
                        onClick={() => router.push('/dashboard?tab=logs')}
                        className={`flex flex-col items-center justify-center flex-1 h-full transition-all ${
                            currentTab === 'logs' && !isOnSettings
                                ? 'text-primary'
                                : 'text-gray-400 hover:text-gray-300'
                        }`}
                    >
                        <ScrollText className="w-6 h-6 mb-1" />
                        <span className="text-xs font-medium">Logs</span>
                    </button>
                    <button
                        onClick={() => router.push('/dashboard/settings')}
                        className={`flex flex-col items-center justify-center flex-1 h-full transition-all ${
                            isOnSettings
                                ? 'text-primary'
                                : 'text-gray-400 hover:text-gray-300'
                        }`}
                    >
                        <Settings className="w-6 h-6 mb-1" />
                        <span className="text-xs font-medium">Settings</span>
                    </button>
                </div>
            </div>
        )
    }

    return null
}

export default function BottomNav({ role }: BottomNavProps) {
    return (
        <Suspense fallback={null}>
            <BottomNavContent role={role} />
        </Suspense>
    )
}
