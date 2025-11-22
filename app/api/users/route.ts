import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/db'
import { User } from '@/lib/models'
import { verifyToken, hashPassword, generateTemporaryPassword, simulateEmailSend } from '@/lib/auth'

export async function GET(request: NextRequest) {
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

        const users = await User.find({}).select('-password').sort({ createdAt: -1 })

        return NextResponse.json({ users })
    } catch (error) {
        console.error('Get users error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

export async function POST(request: NextRequest) {
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

        const { email, name, role, unitNumber } = await request.json()

        // Validation
        if (!email || !name || !role) {
            return NextResponse.json(
                { error: 'Email, name, and role are required' },
                { status: 400 }
            )
        }

        if (role === 'resident' && !unitNumber) {
            return NextResponse.json(
                { error: 'Unit number is required for residents' },
                { status: 400 }
            )
        }

        // Super admin can create admins, regular admin cannot
        if (role === 'admin' && payload.role !== 'super_admin') {
            return NextResponse.json(
                { error: 'Only super admin can create admin users' },
                { status: 403 }
            )
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email: email.toLowerCase() })
        if (existingUser) {
            return NextResponse.json(
                { error: 'User with this email already exists' },
                { status: 400 }
            )
        }

        // Generate temporary password
        const tempPassword = generateTemporaryPassword()
        const hashedPassword = await hashPassword(tempPassword)

        const newUser = await User.create({
            email: email.toLowerCase(),
            password: hashedPassword,
            name,
            role,
            unitNumber: role === 'resident' ? unitNumber : undefined,
            isFirstLogin: true
        })

        // Simulate email
        const emailBody = `
Hello ${name},

Your account has been created for the Estate Access Control System.

Login Credentials:
Email: ${email}
Temporary Password: ${tempPassword}

Please login and change your password immediately.

Login URL: ${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000/login'}

Best regards,
Estate Management
    `.trim()

        simulateEmailSend(email, 'Your Estate Access Control Account', emailBody)

        return NextResponse.json({
            message: 'User created successfully',
            user: {
                id: newUser._id,
                email: newUser.email,
                name: newUser.name,
                role: newUser.role,
                unitNumber: newUser.unitNumber
            },
            temporaryPassword: tempPassword // Only for demo purposes
        })
    } catch (error) {
        console.error('Create user error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
