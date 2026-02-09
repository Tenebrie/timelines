import Button from '@mui/material/Button'
import { ReactNode } from 'react'
import { useEvent } from 'react-use-event-hook'

import { useCheckRouteMatch } from '@/router-utils/hooks/useCheckRouteMatch'
import { useStableNavigate } from '@/router-utils/hooks/useStableNavigate'
import { FileRouteTypes } from '@/routeTree.gen'

type Props = {
	route: FileRouteTypes['fullPaths']
	icon: ReactNode
	label: string
	disabled?: boolean
}

export function NavigatorButton({ route, icon, label, disabled }: Props) {
	const navigate = useStableNavigate()
	const isMatching = useCheckRouteMatch(route)

	const onNavigate = useEvent(() => {
		navigate({ to: route as FileRouteTypes['to'] })
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
			disabled={disabled}
		>
			{icon} {label}
		</Button>
	)
}
