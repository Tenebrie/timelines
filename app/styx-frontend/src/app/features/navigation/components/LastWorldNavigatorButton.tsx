import Button from '@mui/material/Button'
import { Link } from '@tanstack/react-router'
import { ReactNode } from 'react'
import { useSelector } from 'react-redux'

import { getWorldState } from '@/app/views/world/WorldSliceSelectors'
import { useCheckRouteMatch } from '@/router-utils/hooks/useCheckRouteMatch'

import { getAuthState } from '../../auth/AuthSliceSelectors'

type Props = {
	icon: ReactNode
	label: string
	iconOnly?: boolean
}

export function LastWorldNavigatorButton({ icon, label, iconOnly }: Props) {
	const isMatching = useCheckRouteMatch('/world/$worldId')

	const { id, isLoaded } = useSelector(getWorldState, (a, b) => a.id === b.id && a.isLoaded === b.isLoaded)
	const { user } = useSelector(getAuthState)

	return (
		<Link to="/world/$worldId/timeline" params={{ worldId: id }} disabled={!isLoaded || !user}>
			<Button
				aria-label={label}
				variant={isMatching ? 'contained' : 'text'}
				disabled={!isLoaded || !user}
				sx={{
					gap: 0.5,
					padding: '8px 15px',
					minWidth: iconOnly ? 'auto' : undefined,
				}}
			>
				{icon} {!iconOnly && label}
			</Button>
		</Link>
	)
}
