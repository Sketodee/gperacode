import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/db'
import { AccessLog } from '@/lib/models'
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
        if (!payload || (payload.role !== 'super_admin' && payload.role !== 'admin')) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
        }

        const { searchParams } = new URL(request.url)
        const limit = parseInt(searchParams.get('limit') || '50')

        const logs = await AccessLog.find({}).sort({ timestamp: -1 }).limit(limit)

        return NextResponse.json({ logs })
    } catch (error) {
        console.error('Get logs error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
