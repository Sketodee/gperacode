import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/db'
import { AccessCode, AccessLog, User } from '@/lib/models'
import { verifyToken } from '@/lib/auth'

export async function POST(request: NextRequest) {
    try {
        await connectDB()

        const authHeader = request.headers.get('authorization')
        const token = authHeader?.replace('Bearer ', '')

        if (!token) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const payload = verifyToken(token)
        if (!payload || payload.role !== 'security') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
        }

        const { code, type } = await request.json()

        if (!code || !type) {
            return NextResponse.json(
                { error: 'Code and type are required' },
                { status: 400 }
            )
        }

        const accessCode = await AccessCode.findOne({ code: code.toUpperCase(), isActive: true })

        if (!accessCode) {
            await AccessLog.create({
                code: code.toUpperCase(),
                visitorName: 'Unknown',
                residentName: 'Unknown',
                type,
                validatedBy: payload.email,
                timestamp: new Date(),
                status: 'invalid'
            })

            return NextResponse.json({
                valid: false,
                message: 'Invalid code'
            })
        }

        // Check if code is expired
        const currentTime = new Date()
        const validFrom = new Date(accessCode.validFrom)
        const validUntil = new Date(accessCode.validUntil)

        if (currentTime < validFrom || currentTime > validUntil) {
            await AccessLog.create({
                codeId: accessCode._id,
                code: accessCode.code,
                visitorName: accessCode.visitorName,
                residentName: accessCode.residentName,
                unitNumber: (await User.findById(accessCode.residentId))?.unitNumber,
                type,
                validatedBy: payload.email,
                timestamp: new Date(),
                status: 'expired'
            })

            return NextResponse.json({
                valid: false,
                message: 'Code has expired',
                details: {
                    visitorName: accessCode.visitorName,
                    residentName: accessCode.residentName,
                    validFrom: accessCode.validFrom,
                    validUntil: accessCode.validUntil
                }
            })
        }

        // Check if single-use code has already been used
        // EXCEPT if it's a single-use code with exit allowed and this is an exit (allow one entry + one exit)
        if (!accessCode.isMultiUse && accessCode.usageCount > 0) {
            // Allow exit for single-use codes with exit allowed
            if (accessCode.allowExit && type === 'exit' && accessCode.usageCount === 1) {
                // This is fine - one entry already done, now allowing one exit
            } else {
                await AccessLog.create({
                    codeId: accessCode._id,
                    code: accessCode.code,
                    visitorName: accessCode.visitorName,
                    residentName: accessCode.residentName,
                    unitNumber: (await User.findById(accessCode.residentId))?.unitNumber,
                    type,
                    validatedBy: payload.email,
                    timestamp: new Date(),
                    status: 'already_used'
                })

                return NextResponse.json({
                    valid: false,
                    message: 'Code has already been used',
                    details: {
                        visitorName: accessCode.visitorName,
                        residentName: accessCode.residentName
                    }
                })
            }
        }

        // Check if exit is allowed
        if (type === 'exit' && !accessCode.allowExit) {
            return NextResponse.json({
                valid: false,
                message: 'This code is only valid for entry'
            })
        }

        // Get resident unit number
        const resident = await User.findById(accessCode.residentId)

        // FIRST: Check if code has expired by date
        const now = new Date()
        if (now > new Date(accessCode.validUntil)) {
            accessCode.isActive = false
        }

        // Increment usage count
        if (type === 'entry') {
            accessCode.usageCount += 1
        } else if (type === 'exit') {
            // For single visitor multi-use codes with exit allowed, exits also count toward usage limit
            if (accessCode.codeType === 'single' && accessCode.isMultiUse && accessCode.allowExit) {
                accessCode.usageCount += 1
            }
            // For group codes, exits do NOT count toward usage limit (only entries count)
        }

        // GROUP CODES - only check max limit on entry
        if (accessCode.codeType === 'group' && accessCode.maxUsageLimit && type === 'entry') {
            if (accessCode.usageCount >= accessCode.maxUsageLimit) {
                accessCode.isActive = false
            }
        }

        // SINGLE VISITOR CODES
        if (accessCode.codeType === 'single') {
            // Case 1: NOT multi-use, NOT exit allowed (Entry only, one-time)
            if (!accessCode.isMultiUse && !accessCode.allowExit && type === 'entry') {
                accessCode.isActive = false
            }
            // Case 2: Multi-use, NOT exit allowed (Entry only, multiple times)
            else if (accessCode.isMultiUse && !accessCode.allowExit && accessCode.maxUsageLimit) {
                if (accessCode.usageCount >= accessCode.maxUsageLimit) {
                    accessCode.isActive = false
                }
            }
            // Case 3: Multi-use, Exit allowed
            else if (accessCode.isMultiUse && accessCode.allowExit && accessCode.maxUsageLimit) {
                if (accessCode.usageCount >= accessCode.maxUsageLimit) {
                    accessCode.isActive = false
                }
            }
            // Case 4: NOT multi-use, Exit allowed (one entry, one exit allowed)
            else if (!accessCode.isMultiUse && accessCode.allowExit && type === 'exit') {
                accessCode.isActive = false
            }
        }


        await accessCode.save()

        // Create access log
        await AccessLog.create({
            codeId: accessCode._id,
            code: accessCode.code,
            visitorName: accessCode.visitorName,
            residentName: accessCode.residentName,
            unitNumber: resident?.unitNumber,
            type,
            validatedBy: payload.email,
            timestamp: new Date(),
            status: 'success'
        })

        return NextResponse.json({
            valid: true,
            message: `${type === 'entry' ? 'Entry' : 'Exit'} granted`,
            details: {
                visitorName: accessCode.visitorName,
                residentName: accessCode.residentName,
                unitNumber: resident?.unitNumber,
                isMultiUse: accessCode.isMultiUse,
                usageCount: accessCode.usageCount
            }
        })
    } catch (error) {
        console.error('Validate code error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
