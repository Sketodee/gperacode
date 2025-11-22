import { NextRequest, NextResponse } from 'next/server'
import { hashPassword, verifyToken } from '@/lib/auth'
import { updateUser } from '@/lib/database'

export async function POST(request: NextRequest) {
    try {
        const authHeader = request.headers.get('authorization')
        const token = authHeader?.replace('Bearer ', '')

        if (!token) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            )
        }

        const payload = verifyToken(token)
        if (!payload) {
            return NextResponse.json(
                { error: 'Invalid token' },
                { status: 401 }
            )
        }

        const { newPassword } = await request.json()

        if (!newPassword || newPassword.length < 8) {
            return NextResponse.json(
                { error: 'Password must be at least 8 characters long' },
                { status: 400 }
            )
        }

        const hashedPassword = await hashPassword(newPassword)
        const updatedUser = await updateUser(
            payload.userId,
            {
                password: hashedPassword,
                isFirstLogin: false
            }
        )

        if (!updatedUser) {
            return NextResponse.json(
                { error: 'User not found' },
                { status: 404 }
            )
        }

        return NextResponse.json({
            message: 'Password changed successfully',
            isFirstLogin: false
        })
    } catch (error) {
        console.error('Change password error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}
