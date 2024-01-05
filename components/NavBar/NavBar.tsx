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
		<div className="flex flex-row items-center p-5 justify-between border-2">
			<div>
				<Link href={links[0].href}>
					<h1 className="text-700 text-2xl">VidMasTer</h1>
				</Link>
			</div>
			<div className="flex flex-row gap-[2rem]">
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
