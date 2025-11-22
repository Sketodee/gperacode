import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/db'
import { User, seedSuperAdmin } from '@/lib/models'
import { comparePassword, generateToken } from '@/lib/auth'

export async function POST(request: NextRequest) {
    try {
        await connectDB()
        await seedSuperAdmin()

        const { email, password } = await request.json()

        if (!email || !password) {
            return NextResponse.json(
                { error: 'Email and password are required' },
                { status: 400 }
            )
        }

        const user = await User.findOne({ email: email.toLowerCase() })

        if (!user) {
            return NextResponse.json(
                { error: 'Invalid credentials' },
                { status: 401 }
            )
        }

        // Check if user is active
        if (!user.isActive) {
            return NextResponse.json(
                { error: 'Your account has been deactivated. Please contact an administrator.' },
                { status: 403 }
            )
        }

        const isValidPassword = await comparePassword(password, user.password)

        if (!isValidPassword) {
            return NextResponse.json(
                { error: 'Invalid credentials' },
                { status: 401 }
            )
        }

        const token = generateToken({
            userId: user._id.toString(),
            email: user.email,
            role: user.role
        } as any)

        return NextResponse.json({
            token,
            user: {
                id: user._id,
                email: user.email,
                name: user.name,
                role: user.role,
                unitNumber: user.unitNumber,
                isFirstLogin: user.isFirstLogin
            }
        })
    } catch (error) {
        console.error('Login error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}
