import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/db'
import { AccessCode, generateAccessCode } from '@/lib/models'

// Get event details
export async function GET(
    request: NextRequest,
    { params }: { params: { eventId: string } }
) {
    try {
        await connectDB()

        const eventId = params.eventId

        // Find a code with this eventId to get event details
        const eventCode = await AccessCode.findOne({ eventId, isActive: true })

        if (!eventCode) {
            return NextResponse.json(
                { error: 'Event not found or expired' },
                { status: 404 }
            )
        }

        // Check if event is still valid
        const now = new Date()
        if (now > new Date(eventCode.validUntil)) {
            return NextResponse.json(
                { error: 'Event has ended' },
                { status: 410 }
            )
        }

        // Get all codes for this event
        const allEventCodes = await AccessCode.find({ eventId })
        const usedCount = allEventCodes.reduce((sum, code) => sum + code.usageCount, 0)

        return NextResponse.json({
            eventName: eventCode.eventName,
            residentName: eventCode.residentName,
            validFrom: eventCode.validFrom,
            validUntil: eventCode.validUntil,
            allowExit: eventCode.allowExit,
            totalCodes: allEventCodes.length,
            totalUsed: usedCount
        })
    } catch (error) {
        console.error('Get event error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

// Register guest for event
export async function POST(
    request: NextRequest,
    { params }: { params: { eventId: string } }
) {
    try {
        await connectDB()

        const eventId = params.eventId
        const { guestName } = await request.json()

        if (!guestName || guestName.trim().length === 0) {
            return NextResponse.json(
                { error: 'Guest name is required' },
                { status: 400 }
            )
        }

        // Find event details from existing event code
        const eventCode = await AccessCode.findOne({ eventId, isActive: true })

        if (!eventCode) {
            return NextResponse.json(
                { error: 'Event not found or expired' },
                { status: 404 }
            )
        }

        // Check if event is still valid
        const now = new Date()
        if (now > new Date(eventCode.validUntil)) {
            return NextResponse.json(
                { error: 'Event has ended' },
                { status: 410 }
            )
        }

        // Generate unique code for this guest
        let newCode = generateAccessCode()
        while (await AccessCode.findOne({ code: newCode })) {
            newCode = generateAccessCode()
        }

        // Create individual code for this guest
        const guestCode = await AccessCode.create({
            code: newCode,
            residentId: eventCode.residentId,
            residentName: eventCode.residentName,
            visitorName: guestName.trim(),
            validFrom: eventCode.validFrom,
            validUntil: eventCode.validUntil,
            isMultiUse: false,
            allowExit: eventCode.allowExit,
            usageCount: 0,
            isActive: true,
            codeType: 'event',
            eventName: eventCode.eventName,
            eventId: eventId
        })

        return NextResponse.json({
            success: true,
            code: guestCode.code,
            guestName: guestCode.visitorName,
            eventName: guestCode.eventName,
            validFrom: guestCode.validFrom,
            validUntil: guestCode.validUntil
        })
    } catch (error) {
        console.error('Register guest error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
