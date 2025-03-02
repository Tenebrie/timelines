import Button from '@mui/material/Button'
import { useNavigate } from '@tanstack/react-router'
import { ReactNode } from 'react'
import { useSelector } from 'react-redux'
import { useEvent } from 'react-use-event-hook'

import { getWorldState } from '@/app/views/world/WorldSliceSelectors'
import { useCheckRouteMatch } from '@/router-utils/hooks/useCheckRouteMatch'

type Props = {
	icon: ReactNode
	label: string
}

export function LastWorldNavigatorButton({ icon, label }: Props) {
	const navigate = useNavigate()
	const isMatching = useCheckRouteMatch('/world/$worldId/timeline')

	const { id, isLoaded, timeOrigin } = useSelector(
		getWorldState,
		(a, b) => a.id === b.id && a.isLoaded === b.isLoaded && a.timeOrigin === b.timeOrigin,
	)

	const onNavigate = useEvent(() => {
		navigate({ to: `/world/$worldId/timeline`, params: { worldId: id }, search: { time: timeOrigin } })
	})

	if (!isLoaded) {
		return null
	}

	return (
		<Button
			aria-label={label}
			onClick={onNavigate}
			variant={isMatching ? 'contained' : 'text'}
			sx={{
				gap: 0.5,
				border: '1px solid transparent',
				padding: '8px 15px',
			}}
		>
			{icon} {label}
		</Button>
	)
}
