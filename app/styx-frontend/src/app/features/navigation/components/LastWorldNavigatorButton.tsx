import Button from '@mui/material/Button'
import { Link } from '@tanstack/react-router'
import { ReactNode } from 'react'
import { useSelector } from 'react-redux'

import { getWorldState } from '@/app/views/world/WorldSliceSelectors'
import { useCheckRouteMatch } from '@/router-utils/hooks/useCheckRouteMatch'

type Props = {
	icon: ReactNode
	label: string
}

export function LastWorldNavigatorButton({ icon, label }: Props) {
	const isMatching = useCheckRouteMatch('/world/$worldId')

	const { id, isLoaded } = useSelector(getWorldState, (a, b) => a.id === b.id && a.isLoaded === b.isLoaded)

	return (
		<Link to="/world/$worldId/timeline" params={{ worldId: id }} disabled={!isLoaded}>
			<Button
				aria-label={label}
				variant={isMatching ? 'contained' : 'text'}
				disabled={!isLoaded}
				sx={{
					gap: 0.5,
					padding: '8px 15px',
				}}
			>
				{icon} {label}
			</Button>
		</Link>
	)
}
