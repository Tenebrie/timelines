import Button from '@mui/material/Button'
import { useNavigate } from '@tanstack/react-router'
import { ReactNode } from 'react'
import { useEvent } from 'react-use-event-hook'

import { useCheckRouteMatch } from '@/router-utils/hooks/useCheckRouteMatch'
import { FileRouteTypes } from '@/routeTree.gen'

type Props = {
	route: FileRouteTypes['to']
	icon: ReactNode
	label: string
}

export function NavigatorButton({ route, icon, label }: Props) {
	const navigate = useNavigate()
	const isMatching = useCheckRouteMatch(route)

	const onNavigate = useEvent(() => {
		navigate({ to: route })
	})

	return (
		<Button
			aria-label={label}
			onClick={onNavigate}
			variant={isMatching ? 'contained' : 'text'}
			sx={{
				gap: 0.5,
				border: 'none',
				padding: '8px 15px',
			}}
		>
			{icon} {label}
		</Button>
	)
}
