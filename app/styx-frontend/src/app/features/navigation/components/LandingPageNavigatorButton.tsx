import Button from '@mui/material/Button'
import Link from '@mui/material/Link'
import { ReactNode } from 'react'

type Props = {
	icon: ReactNode
	label: string
}

export function LandingPageNavigatorButton({ icon, label }: Props) {
	const targetUrl = window.location.origin.replace('//app.', '//')

	return (
		<Link href={targetUrl}>
			<Button
				aria-label={label}
				variant="text"
				sx={{
					height: 1,
					gap: 0.5,
					border: 'none',
					padding: '8px 15px',
					marginTop: '0px',
					textDecoration: 'none',
				}}
			>
				{icon} {label}
			</Button>
		</Link>
	)
}
