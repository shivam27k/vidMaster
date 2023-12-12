'use client'
import { createContext, useEffect, useState } from 'react'
import { ThemeType } from '@/app/types'
import Loading from '@/components/loading'

interface ThemeContextType {
	theme?: string
	changeTheme?: (nextTheme?: string) => void
}
export const ThemeContext = createContext<ThemeContextType>({})

export const ThemeProvider = ({ children }: any) => {
	const [theme, setTheme] = useState<string>(() => {
		if (typeof window !== 'undefined') {
			return localStorage.getItem('theme') || 'light'
		} else {
			return 'light'
		}
	})

	useEffect(() => {
		localStorage.setItem('theme', theme)
	}, [theme])

	const changeTheme = (event?: any) => {
		const nextTheme: string | null = event.target.value || null
		if (nextTheme) {
			setTheme(nextTheme)
		} else {
			setTheme((prev) => (prev === 'light' ? 'dark' : 'light'))
		}
	}
	return (
		<ThemeContext.Provider value={{ theme, changeTheme }}>
			{children}
		</ThemeContext.Provider>
	)
}
