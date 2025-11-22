'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

// Import role-specific dashboard components
import ResidentDashboard from './resident/page'
import AdminDashboard from './admin/page'
import SecurityDashboard from './security/page'

export default function UnifiedDashboard() {
    const [userRole, setUserRole] = useState<string | null>(null)
    const router = useRouter()

    useEffect(() => {
        const userData = localStorage.getItem('user')
        const token = localStorage.getItem('token')

        if (!userData || !token) {
            router.push('/login')
            return
        }

        const parsedUser = JSON.parse(userData)
        setUserRole(parsedUser.role)
    }, [router])

    // Loading state
    if (!userRole) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
        )
    }

    // Render role-specific dashboard
    if (userRole === 'resident') {
        return <ResidentDashboard />
    }

    if (userRole === 'super_admin' || userRole === 'admin') {
        return <AdminDashboard />
    }

    if (userRole === 'security') {
        return <SecurityDashboard />
    }

    // Fallback for unknown roles
    return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
                <h1 className="text-2xl font-bold text-white mb-4">Unknown Role</h1>
                <p className="text-gray-400">Your account role is not recognized. Please contact support.</p>
            </div>
        </div>
    )
}
