import connectDB from './db'
import { User, IUser } from './models'
import mongoose from 'mongoose'

export async function updateUser(
    userId: string,
    updates: Partial<IUser>
): Promise<IUser | null> {
    await connectDB()

    try {
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            updates,
            { new: true, runValidators: true }
        )

        return updatedUser
    } catch (error) {
        console.error('Error updating user:', error)
        throw error
    }
}

export async function getUserById(userId: string): Promise<IUser | null> {
    await connectDB()

    try {
        const user = await User.findById(userId)
        return user
    } catch (error) {
        console.error('Error getting user:', error)
        throw error
    }
}

export async function getUserByEmail(email: string): Promise<IUser | null> {
    await connectDB()

    try {
        const user = await User.findOne({ email: email.toLowerCase() })
        return user
    } catch (error) {
        console.error('Error getting user by email:', error)
        throw error
    }
}
