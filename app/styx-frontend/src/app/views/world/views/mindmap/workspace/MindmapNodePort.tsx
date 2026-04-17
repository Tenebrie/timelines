import { MindmapNode } from '@api/types/mindmapTypes'
import { Actor } from '@api/types/worldTypes'
import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import { useEffect, useRef } from 'react'

import { useFeatureFlag } from '@/app/features/auth/hooks/useFeatureFlags'
import { useDragDrop } from '@/app/features/dragDrop/hooks/useDragDrop'
import { useCustomTheme } from '@/app/features/theming/hooks/useCustomTheme'

type Props = {
	node: MindmapNode
	actor: Actor
}

export function MindmapNodePort({ node, actor }: Props) {
	const isDragging = useRef(false)
	const theme = useCustomTheme()

	const { ref, ghostElement } = useDragDrop({
		type: 'actorNodeLinking',
		ghostFactory: () => null,
		params: {
			sourceNode: node,
		},
	})

	useEffect(() => {
		if (!ref.current) {
			return
		}
		const onMouseDown = (event: MouseEvent) => {
			isDragging.current = true
			event.stopPropagation()
			// event.preventDefault()
		}

		const box = ref.current

		box.addEventListener('mousedown', onMouseDown)
		return () => {
			box.removeEventListener('mousedown', onMouseDown)
		}
	}, [node.id, ref])

	const featureEnabled = useFeatureFlag('MindmapRework')
	if (!featureEnabled) {
		return null
	}

	return (
		<>
			<Stack
				data-mindmap-port
				onClick={(e) => {
					e.stopPropagation()
					e.preventDefault()
				}}
				ref={ref}
				sx={{
					width: '42px',
					height: '100%',
					alignItems: 'center',
					justifyContent: 'center',
					cursor: 'pointer',
					'--fill-color': theme.custom.palette.background.timeline,
					'--hover-opacity': 0.0,
					'--active-opacity': 0.0,
					'&:hover': {
						'--hover-opacity': 1.0,
					},
					'&:active': {
						'--fill-color': 'rgba(0, 0, 200, 1.0)',
						'--active-opacity': 1.0,
					},
				}}
			>
				<Box
					sx={{
						position: 'relative',
						width: 16,
						height: 16,
					}}
				>
					<svg
						viewBox="0 0 16 16"
						width="100%"
						height="100%"
						style={{ display: 'block', overflow: 'visible' }}
					>
						<circle
							cx="8"
							cy="8"
							r="7"
							fill="var(--fill-color)"
							stroke={actor.color}
							strokeWidth="2"
							style={{ transition: 'fill 120ms ease-out' }}
						/>
					</svg>
					<Box
						sx={{
							pointerEvents: 'none',
							position: 'absolute',
							top: 0,
							left: 0,
							width: '100%',
							height: '100%',
							borderRadius: '50%',
							opacity: 'var(--hover-opacity)',
							transition: 'opacity 0.3s',
							background: theme.custom.palette.background.hard,
						}}
					/>
					<Box
						sx={{
							pointerEvents: 'none',
							position: 'absolute',
							top: 0,
							left: 0,
							width: '100%',
							height: '100%',
							borderRadius: '50%',
							opacity: 'var(--active-opacity)',
							transition: 'opacity 0.3s',
							background: theme.custom.palette.background.harder,
						}}
					/>
				</Box>
			</Stack>
			{ghostElement}
		</>
	)
}
