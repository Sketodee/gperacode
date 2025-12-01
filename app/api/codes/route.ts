import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/db'
import { AccessCode, User, generateAccessCode } from '@/lib/models'
import { verifyToken } from '@/lib/auth'

export async function GET(request: NextRequest) {
    try {
        await connectDB()

        const authHeader = request.headers.get('authorization')
        const token = authHeader?.replace('Bearer ', '')

        if (!token) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const payload = verifyToken(token)
        if (!payload || payload.role !== 'resident') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
        }

        // Update expired codes before fetching
        const now = new Date()
        await AccessCode.updateMany(
            {
                residentId: payload.userId,
                isActive: true,
                validUntil: { $lt: now }
            },
            {
                $set: { isActive: false }
            }
        )

        const codes = await AccessCode.find({ residentId: payload.userId }).sort({ createdAt: -1 })

        return NextResponse.json({ codes })
    } catch (error) {
        console.error('Get codes error:', error)
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
        if (!payload || payload.role !== 'resident') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
        }

        const { visitorName, validFrom, validUntil, isMultiUse, allowExit, codeType, eventName, maxUsageLimit } = await request.json()

        if (!validFrom || !validUntil) {
            return NextResponse.json(
                { error: 'Valid from and valid until are required' },
                { status: 400 }
            )
        }

        const type = codeType || 'single'

        // Validate based on code type
        if (type === 'single' && !visitorName) {
            return NextResponse.json(
                { error: 'Visitor name is required for single codes' },
                { status: 400 }
            )
        }

        if (type === 'group' && !eventName) {
            return NextResponse.json(
                { error: 'Event name is required for group codes' },
                { status: 400 }
            )
        }

        // Get resident info
        const resident = await User.findById(payload.userId)
        if (!resident) {
            return NextResponse.json({ error: 'Resident not found' }, { status: 404 })
        }

        // Generate unique code
        let code = generateAccessCode()
        let existingCode = await AccessCode.findOne({ code })

        // Regenerate if code already exists
        while (existingCode) {
            code = generateAccessCode()
            existingCode = await AccessCode.findOne({ code })
        }

        // Parse dates with explicit timezone handling for Nigerian time (WAT)
        // The datetime-local input sends the time in local format (e.g., "2024-12-01T15:24")
        // We append 'Z' and then adjust for WAT (UTC+1) to ensure consistency
        const parseWATDate = (dateStr: string) => {
            // If the date string doesn't include timezone info, treat it as WAT (UTC+1)
            if (!dateStr.includes('Z') && !dateStr.includes('+')) {
                // Append timezone offset for Nigeria (WAT = UTC+1)
                return new Date(dateStr + '+01:00')
            }
            return new Date(dateStr)
        }

        const newCode = await AccessCode.create({
            code,
            residentId: payload.userId,
            residentName: resident.name,
            visitorName: type === 'single' ? visitorName : (eventName || 'Group Access'),
            validFrom: parseWATDate(validFrom),
            validUntil: parseWATDate(validUntil),
            isMultiUse: type === 'group' || isMultiUse || false,
            allowExit: type === 'group' ? true : (allowExit === true),
            usageCount: 0,
            isActive: true,
            codeType: type,
            eventName: type === 'group' ? eventName : undefined,
            maxUsageLimit: (type === 'group' || (type === 'single' && isMultiUse)) ? maxUsageLimit : undefined
        })

        return NextResponse.json({
            message: 'Access code generated successfully',
            code: newCode
        })
    } catch (error) {
        console.error('Create code error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
