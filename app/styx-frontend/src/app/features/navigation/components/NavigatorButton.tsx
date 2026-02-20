import Button from '@mui/material/Button'
import { Link } from '@tanstack/react-router'
import { ReactNode } from 'react'

import { useCheckRouteMatch } from '@/router-utils/hooks/useCheckRouteMatch'
import { FileRouteTypes } from '@/routeTree.gen'

type Props = {
	route: FileRouteTypes['fullPaths']
	icon: ReactNode
	label: string
	disabled?: boolean
}

export function NavigatorButton({ route, icon, label, disabled }: Props) {
	const isMatching = useCheckRouteMatch(route)

	return (
		<Link to={route as FileRouteTypes['to']}>
			<Button
				aria-label={label}
				variant={isMatching ? 'contained' : 'text'}
				sx={{
					gap: 0.5,
					border: 'none',
					padding: '8px 15px',
					textDecoration: 'none',
				}}
				disabled={disabled}
			>
				{icon} {label}
			</Button>
		</Link>
	)
}
