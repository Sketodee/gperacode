'use client'

import { Moon, Sun } from 'lucide-react'
import { useTheme } from '@/lib/ThemeContext'
import { useEffect, useState } from 'react'

export default function ThemeToggle() {
    const { theme, toggleTheme } = useTheme()
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    if (!mounted) {
        return (
            <button
                className="relative w-14 h-7 bg-gray-300 dark:bg-gray-700 rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                aria-label="Toggle theme"
                disabled
            >
                <div className="absolute top-0.5 left-0.5 w-6 h-6 bg-white rounded-full shadow-md flex items-center justify-center">
                    <Sun className="w-4 h-4 text-yellow-500" />
                </div>
            </button>
        )
    }

    return (
        <button
            onClick={toggleTheme}
            className="relative w-14 h-7 bg-gray-300 dark:bg-gray-700 rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
            aria-label="Toggle theme"
        >
            <div
                className={`absolute top-0.5 left-0.5 w-6 h-6 bg-white rounded-full shadow-md transform transition-transform duration-300 flex items-center justify-center ${theme === 'dark' ? 'translate-x-7' : 'translate-x-0'
                    }`}
            >
                {theme === 'light' ? (
                    <Sun className="w-4 h-4 text-yellow-500" />
                ) : (
                    <Moon className="w-4 h-4 text-purple-600" />
                )}
            </div>
        </button>
    )
}
