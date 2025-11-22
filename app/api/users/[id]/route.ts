import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/db'
import { User } from '@/lib/models'
import { verifyToken } from '@/lib/auth'

// Toggle user active status
export async function PATCH(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        await connectDB()

        const authHeader = request.headers.get('authorization')
        const token = authHeader?.replace('Bearer ', '')

        if (!token) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const payload = verifyToken(token)
        if (!payload || (payload.role !== 'super_admin' && payload.role !== 'admin')) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
        }

        const { isActive } = await request.json()

        const user = await User.findById(params.id)

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 })
        }

        // Prevent deactivating super admin
        if (user.role === 'super_admin') {
            return NextResponse.json(
                { error: 'Cannot deactivate super admin' },
                { status: 403 }
            )
        }

        user.isActive = isActive
        await user.save()

        return NextResponse.json({
            message: `User ${isActive ? 'activated' : 'deactivated'} successfully`,
            user: {
                id: user._id,
                email: user.email,
                name: user.name,
                role: user.role,
                unitNumber: user.unitNumber,
                isActive: user.isActive
            }
        })
    } catch (error) {
        console.error('Update user error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
