import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from '@/context/ThemeContext'
import ClientThemeWrapper from '@/context/ClientThemeWrapper'
import NavBar from '@/components/NavBar/NavBar'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
	title: 'VidMaster',
	description: 'Video chat seemlessly using this app!',
}

export default function RootLayout({
	children,
}: {
	children: React.ReactNode
}) {
	return (
		<html lang="en">
			<body className={`${inter.className} bg-white`}>
				<ThemeProvider>
					<ClientThemeWrapper>
						<div className="h-screen ">
							<NavBar />
							{children}
						</div>
					</ClientThemeWrapper>
				</ThemeProvider>
			</body>
		</html>
	)
}
