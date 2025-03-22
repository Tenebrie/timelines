import { ActorDetails } from '@api/types/worldTypes'
import Box from '@mui/material/Box'

import { useCustomTheme } from '@/app/features/theming/hooks/useCustomTheme'

type Props = {
	actor: ActorDetails
	isSelected: boolean
}

export function ActorNode({ actor, isSelected }: Props) {
	const theme = useCustomTheme()

	return (
		<Box
			sx={{
				width: '200px',
				borderRadius: 2,
				overflow: 'hidden',
				position: 'relative',
				boxShadow: isSelected ? '0 4px 12px rgba(0,0,0,0.15)' : '0 2px 8px rgba(0,0,0,0.1)',
				'&:hover': {
					boxShadow: '0 6px 12px rgba(0,0,0,0.15)',
				},
			}}
		>
			{/* Header */}
			<Box
				sx={{
					background: theme.custom.palette.background.soft,
					padding: '8px 12px',
					borderBottom: `1px solid ${theme.custom.palette.background.softer}`,
					display: 'flex',
					alignItems: 'center',
					gap: 1,
				}}
			>
				<Box
					sx={{
						width: 24,
						height: 24,
						borderRadius: '50%',
						background: actor.color,
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'center',
						color: theme.material.palette.primary.contrastText,
						fontSize: '0.8rem',
						fontWeight: 'bold',
						flexShrink: 0,
					}}
				>
					{actor.name[0]}
				</Box>
				<Box
					sx={{
						fontWeight: 'bold',
						fontSize: '0.9rem',
						color: theme.material.palette.text.primary,
					}}
				>
					{actor.name}
				</Box>
			</Box>

			{/* Content */}
			<Box
				sx={{
					padding: '12px',
					background: theme.custom.palette.background.softest,
					'&:hover': {
						background: theme.custom.palette.background.softer,
					},
					'&:active': {
						background: theme.custom.palette.background.soft,
					},
				}}
			>
				{actor.description && (
					<Box
						sx={{
							fontSize: '0.8rem',
							color: theme.material.palette.text.secondary,
							lineHeight: 1.4,
						}}
					>
						{actor.description}
					</Box>
				)}
			</Box>
		</Box>
	)
}
