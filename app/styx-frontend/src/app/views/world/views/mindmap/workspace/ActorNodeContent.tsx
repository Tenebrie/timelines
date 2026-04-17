import { MindmapNode } from '@api/types/mindmapTypes'
import { ActorDetails } from '@api/types/worldTypes'
import { Icon } from '@iconify/react'
import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import { useMemo } from 'react'

import { ActorAvatar } from '@/app/components/ActorAvatar/ActorAvatar'
import { useCustomTheme } from '@/app/features/theming/hooks/useCustomTheme'

import { MindmapNodePort } from './MindmapNodePort'

type Props = {
	node?: MindmapNode
	actor: ActorDetails
	onHeaderClick: (e: React.MouseEvent) => void
	onContentClick: () => void
}

export function ActorNodeContent({ node, actor, onHeaderClick, onContentClick }: Props) {
	const theme = useCustomTheme()

	const description = useMemo(() => {
		const firstParagraph = actor.description.split('\n')[0]
		if (firstParagraph.length < actor.description.length - 1) {
			return {
				content: firstParagraph,
				more: true,
			}
		}
		return { content: firstParagraph }
	}, [actor.description])

	return (
		<Box
			sx={{
				userSelect: 'none',
				width: '250px',
				borderRadius: 2,
				overflow: 'hidden',
				position: 'relative',
				transition: 'box-shadow 0.2s ease-out, transform 0.2s ease-out',
				'&:has([data-mindmap-header]:hover):not(:has([data-mindmap-port]:hover)):not(:has(body.cursor-grabbing))':
					{
						boxShadow: '0 6px 16px rgba(0,0,0,0.2)',
					},
			}}
		>
			{/* Header */}
			<Stack
				data-mindmap-header
				onClick={onHeaderClick}
				sx={{
					background: theme.custom.palette.background.soft,
					padding: '8px 0 8px 12px',
					borderBottom: `1px solid ${theme.custom.palette.background.softer}`,
					flexDirection: 'row',
					userSelect: 'none',
					gap: 1,
					cursor: 'grab',
					'&:active': {
						cursor: 'grabbing',
					},
				}}
			>
				<Stack
					sx={{
						flexDirection: 'row',
						width: '100%',
						alignItems: 'center',
						justifyContent: 'space-between',
						gap: 1,
					}}
				>
					<Stack
						sx={{
							flexDirection: 'row',
							alignItems: 'center',
							gap: 1,
						}}
					>
						<ActorAvatar actor={actor} sx={{ width: 24, height: 24, fontSize: '0.7rem' }} />
						<Box
							sx={{
								fontWeight: 'bold',
								fontSize: '0.9rem',
								color: theme.material.palette.text.primary,
							}}
						>
							{actor.name}
						</Box>

						<Icon
							icon={actor.icon === 'default' ? 'mdi:leaf' : actor.icon}
							color={'#0a0908'}
							style={{
								opacity: theme.mode === 'dark' ? 0.5 : 0.25,
								zIndex: -1,
								position: 'absolute',
								top: '0px',
								right: '36px',
								width: '100%',
								height: '100%',
								maxHeight: '75px',
								maxWidth: '75px',
								pointerEvents: 'none',
							}}
						/>
					</Stack>
				</Stack>
				{node && (
					<Stack sx={{ marginTop: '-8px', marginBottom: '-9px' }} flexShrink={0}>
						<MindmapNodePort node={node} actor={actor} />
					</Stack>
				)}
			</Stack>

			{/* Content */}
			<Box
				data-mindmap-content
				onClick={(e) => {
					e.stopPropagation()
					onContentClick()
				}}
				sx={{
					fontSize: '0.8rem',
					lineHeight: 1.4,
					padding: '12px',
					background: theme.custom.palette.background.softest,
					cursor: 'pointer',
					transition: 'background 0.2s ease-out',
					'&:hover': {
						background: theme.custom.palette.background.softer,
					},
				}}
			>
				<Box>
					<div>{description.content}</div>
				</Box>
				{description.more && (
					<Box sx={{ marginTop: 1, width: '100%', textAlign: 'center', fontWeight: 600 }}>
						Click to see more
					</Box>
				)}
			</Box>
		</Box>
	)
}
