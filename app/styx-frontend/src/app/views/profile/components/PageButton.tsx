import Button from '@mui/material/Button'
import { useNavigate } from '@tanstack/react-router'

import { useCustomTheme } from '@/app/features/theming/hooks/useCustomTheme'
import { useCheckRouteMatch } from '@/router-utils/hooks/useCheckRouteMatch'
import { FileRouteTypes } from '@/routeTree.gen'

type Props = {
	label: string
	route: FileRouteTypes['to']
}

export function PageButton({ label, route }: Props) {
	const theme = useCustomTheme()
	const isActive = useCheckRouteMatch(route)
	const navigate = useNavigate({ from: '/profile' })

	return (
		<Button
			fullWidth
			onClick={() => navigate({ to: route })}
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
			{label}
		</Button>
	)
}
