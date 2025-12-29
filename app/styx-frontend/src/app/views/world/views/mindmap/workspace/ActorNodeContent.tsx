import { ActorDetails } from '@api/types/worldTypes'
import Box from '@mui/material/Box'

import { useCustomTheme } from '@/app/features/theming/hooks/useCustomTheme'

type Props = {
	actor: ActorDetails
	onHeaderClick: (e: React.MouseEvent) => void
	onContentClick: () => void
}

export function ActorNodeContent({ actor, onHeaderClick, onContentClick }: Props) {
	const theme = useCustomTheme()

	return (
		<Box
			sx={{
				width: '200px',
				borderRadius: 2,
				overflow: 'hidden',
				position: 'relative',
				transition: 'box-shadow 0.2s ease-out, transform 0.2s ease-out',
				'&:has([data-mindmap-header]:hover)': {
					boxShadow: '0 6px 16px rgba(0,0,0,0.2)',
				},
			}}
		>
			{/* Header */}
			<Box
				data-mindmap-header
				onClick={onHeaderClick}
				sx={{
					background: theme.custom.palette.background.soft,
					padding: '8px 12px',
					borderBottom: `1px solid ${theme.custom.palette.background.softer}`,
					display: 'flex',
					alignItems: 'center',
					userSelect: 'none',
					gap: 1,
					cursor: 'grab',
					'&:active': {
						cursor: 'grabbing',
					},
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
				data-mindmap-content
				onClick={(e) => {
					e.stopPropagation()
					onContentClick()
				}}
				sx={{
					padding: '12px',
					background: theme.custom.palette.background.softest,
					cursor: 'pointer',
					transition: 'background 0.2s ease-out',
					'&:hover': {
						background: theme.custom.palette.background.softer,
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
