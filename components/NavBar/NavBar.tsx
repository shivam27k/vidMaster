import Link from 'next/link'
import React from 'react'

const NavBar = () => {
	const links = [
		{
			name: 'Home',
			href: '/',
		},
		{
			name: 'About',
			href: '/about',
		},
		{
			name: 'Contact Us',
			href: '/contact-us',
		},
		{
			name: 'Privacy Policy',
			href: '/privacy-policy',
		},
	]

	return (
		<div>
			<div className="flex flex-row gap-10 items-center justify-center w-full border-2">
				{links.map((link) => {
					return (
						<Link href={link.href} key={link.name}>
							{link.name}
						</Link>
					)
				})}
			</div>
		</div>
	)
}

export default NavBar
