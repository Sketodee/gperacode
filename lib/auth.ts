import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production'

export interface TokenPayload {
    userId: string
    email: string
    role: string
}


export function generateToken(user: any): string {
    const payload: TokenPayload = {
        userId: user._id?.toString() || user.id || user.userId,
        email: user.email,
        role: user.role
    }
    return jwt.sign(payload, JWT_SECRET, { expiresIn: '24h' })
}

export function verifyToken(token: string): TokenPayload | null {
    try {
        return jwt.verify(token, JWT_SECRET) as TokenPayload
    } catch (error) {
        return null
    }
}

export async function hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 10)
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash)
}

export function generateTemporaryPassword(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$%^&*'
    let password = ''

    // Ensure at least one uppercase, one lowercase, one number, one special char
    password += 'ABCDEFGHJKLMNPQRSTUVWXYZ'[Math.floor(Math.random() * 23)]
    password += 'abcdefghjkmnpqrstuvwxyz'[Math.floor(Math.random() * 23)]
    password += '23456789'[Math.floor(Math.random() * 8)]
    password += '!@#$%^&*'[Math.floor(Math.random() * 8)]

    // Add 8 more random characters
    for (let i = 0; i < 8; i++) {
        password += chars[Math.floor(Math.random() * chars.length)]
    }

    // Shuffle the password
    return password.split('').sort(() => Math.random() - 0.5).join('')
}

export function simulateEmailSend(to: string, subject: string, body: string): void {
    console.log('\n📧 ===== EMAIL SIMULATION =====')
    console.log(`To: ${to}`)
    console.log(`Subject: ${subject}`)
    console.log(`Body:\n${body}`)
    console.log('================================\n')
}
