import Button from '@mui/material/Button'
import ListItemIcon from '@mui/material/ListItemIcon'
import { FileRouteTypes } from '@tanstack/react-router'

import { NavigationLink } from '@/app/components/NavigationLink'
import { useCustomTheme } from '@/app/features/theming/hooks/useCustomTheme'
import { useCheckRouteMatch } from '@/router-utils/hooks/useCheckRouteMatch'
import { useCheckRouteMatchExact } from '@/router-utils/hooks/useCheckRouteMatchExact'

import { RouteItem } from './RoutedView'

type Props = {
	route: RouteItem
}

export function RoutedViewButton({ route }: Props) {
	const { icon, label, path } = route
	const theme = useCustomTheme()
	const isActiveLoose = useCheckRouteMatch(path)
	const isActiveExact = useCheckRouteMatchExact(path)
	const isActive = route.exact ? isActiveExact : isActiveLoose

	return (
		<NavigationLink to={path as FileRouteTypes['to']}>
			<Button
				fullWidth
				sx={{
					justifyContent: 'flex-start',
					px: 2,
					py: 1,
					fontWeight: theme.material.typography.fontWeightRegular,
					'&.active': {
						fontWeight: theme.material.typography.fontWeightBold,
						bgcolor: theme.custom.palette.background.softer,
						'&:hover': {
							bgcolor: theme.custom.palette.background.soft,
						},
					},
				}}
				className={isActive ? 'active' : ''}
			>
				{icon && <ListItemIcon>{icon}</ListItemIcon>}
				{label}
			</Button>
		</NavigationLink>
	)
}
