import Button from '@mui/material/Button'
import { Link } from '@tanstack/react-router'
import { ReactNode } from 'react'

import { useCheckRouteMatch } from '@/router-utils/hooks/useCheckRouteMatch'
import { useCheckRouteMatchExact } from '@/router-utils/hooks/useCheckRouteMatchExact'
import type { FileRouteTypes } from '@/routeTree.gen'
import { Tooltip } from '@/ui-lib/components/Tooltip'

type Props = {
	route: FileRouteTypes['fullPaths']
	icon: ReactNode
	label: string
	disabled?: boolean
	iconOnly?: boolean
}

export function NavigatorButton({ route, icon, label, disabled, iconOnly }: Props) {
	const isMatchingLoose = useCheckRouteMatch(route)
	const isMatchingExact = useCheckRouteMatchExact(route)
	const isMatching = route === '/' ? isMatchingExact : isMatchingLoose

	return (
		<Link to={route as FileRouteTypes['to']} disabled={disabled}>
			<Tooltip title={iconOnly ? label : ''}>
				<Button
					aria-label={label}
					variant={isMatching ? 'contained' : 'text'}
					sx={{
						gap: 0.5,
						border: 'none',
						padding: '6px 15px',
						minWidth: iconOnly ? 'auto' : undefined,
						textDecoration: 'none',
					}}
					disabled={disabled}
				>
					{icon} {!iconOnly && label}
				</Button>
			</Tooltip>
		</Link>
	)
}
