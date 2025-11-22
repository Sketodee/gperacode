import mongoose, { Schema, Model } from 'mongoose'
import bcrypt from 'bcryptjs'

export interface IUser {
    _id?: mongoose.Types.ObjectId
    email: string
    password: string
    name: string
    role: 'super_admin' | 'admin' | 'security' | 'resident'
    unitNumber?: string
    isFirstLogin: boolean
    isActive: boolean
    createdAt?: Date
    updatedAt?: Date
}

const UserSchema = new Schema<IUser>({
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    name: { type: String, required: true },
    role: { type: String, enum: ['super_admin', 'admin', 'security', 'resident'], required: true },
    unitNumber: { type: String },
    isFirstLogin: { type: Boolean, default: true },
    isActive: { type: Boolean, default: true }
}, {
    timestamps: true
})

export const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', UserSchema)

export interface IAccessCode {
    _id?: mongoose.Types.ObjectId
    code: string
    residentId: mongoose.Types.ObjectId
    residentName: string
    visitorName: string
    validFrom: Date
    validUntil: Date
    isMultiUse: boolean
    allowExit: boolean
    usageCount: number
    isActive: boolean
    codeType: 'single' | 'group' | 'event'
    eventName?: string
    maxUsageLimit?: number
    eventId?: string
    createdAt?: Date
    updatedAt?: Date
}

const AccessCodeSchema = new Schema<IAccessCode>({
    code: { type: String, required: true, unique: true, uppercase: true },
    residentId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    residentName: { type: String, required: true },
    visitorName: { type: String, required: true },
    validFrom: { type: Date, required: true },
    validUntil: { type: Date, required: true },
    isMultiUse: { type: Boolean, default: false },
    allowExit: { type: Boolean, default: true },
    usageCount: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
    codeType: { type: String, enum: ['single', 'group', 'event'], default: 'single' },
    eventName: { type: String },
    maxUsageLimit: { type: Number },
    eventId: { type: String }
}, {
    timestamps: true
})

AccessCodeSchema.index({ code: 1 })
AccessCodeSchema.index({ residentId: 1 })
AccessCodeSchema.index({ eventId: 1 })

export const AccessCode: Model<IAccessCode> = mongoose.models.AccessCode || mongoose.model<IAccessCode>('AccessCode', AccessCodeSchema)

export interface IAccessLog {
    _id?: mongoose.Types.ObjectId
    codeId?: mongoose.Types.ObjectId
    code: string
    visitorName: string
    residentName: string
    unitNumber?: string
    type: 'entry' | 'exit'
    validatedBy: string
    timestamp: Date
    status: 'success' | 'expired' | 'invalid' | 'already_used'
    createdAt?: Date
}

const AccessLogSchema = new Schema<IAccessLog>({
    codeId: { type: Schema.Types.ObjectId, ref: 'AccessCode' },
    code: { type: String, required: true },
    visitorName: { type: String, required: true },
    residentName: { type: String, required: true },
    unitNumber: { type: String },
    type: { type: String, enum: ['entry', 'exit'], required: true },
    validatedBy: { type: String, required: true },
    timestamp: { type: Date, required: true },
    status: { type: String, enum: ['success', 'expired', 'invalid', 'already_used'], required: true }
}, {
    timestamps: true
})

AccessLogSchema.index({ timestamp: -1 })
AccessLogSchema.index({ codeId: 1 })

export const AccessLog: Model<IAccessLog> = mongoose.models.AccessLog || mongoose.model<IAccessLog>('AccessLog', AccessLogSchema)

// Helper function to seed super admin
export async function seedSuperAdmin() {
    const superAdminExists = await User.findOne({ email: 'admin123@test.com' })

    if (!superAdminExists) {
        const hashedPassword = await bcrypt.hash('Password123*', 10)
        await User.create({
            email: 'admin123@test.com',
            password: hashedPassword,
            name: 'Super Administrator',
            role: 'super_admin',
            isFirstLogin: false,
            isActive: true
        })
        console.log('✅ Super admin created: admin123@test.com / Password123*')
    } else if (superAdminExists.isActive === undefined) {
        // Update existing super admin to be active if field is missing
        await User.updateOne(
            { email: 'admin123@test.com' },
            { $set: { isActive: true } }
        )
        console.log('✅ Super admin updated with isActive field')
    }
}

// Helper function to generate access code
export function generateAccessCode(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
    let code = ''
    for (let i = 0; i < 6; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return code
}
