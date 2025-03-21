import { ActorDetails } from '@api/types/worldTypes'
import Box from '@mui/material/Box'
import { useNavigate, useSearch } from '@tanstack/react-router'
import { useEffect, useRef, useState } from 'react'
import useEvent from 'react-use-event-hook'

import { useCustomTheme } from '@/app/features/theming/hooks/useCustomTheme'

import { Position } from '../../timeline/utils/Position'

type Props = {
	index: number
	actor: ActorDetails
}

export function ActorNode({ index, actor }: Props) {
	const theme = useCustomTheme()
	const navigate = useNavigate({ from: '/world/$worldId/mindmap' })
	const [position, setPosition] = useState<Position>({ x: Math.random() * 1000, y: Math.random() * 1000 })

	const selectedNodes = useSearch({
		from: '/world/$worldId/_world/mindmap',
		select: (search) => search.selection,
	})

	const onClick = useEvent(() => {
		navigate({
			search: (prev) => ({
				...prev,
				selection: [actor.id],
			}),
		})
	})

	const ref = useRef<HTMLDivElement | null>(null)
	useEffect(() => {
		const element = ref.current
		if (!element) {
			return
		}

		const mouseState = {
			isDragging: false,
			positionX: position.x,
			positionY: position.y,
			gridScale: 1,
			scaleAdjustmentPending: 0,
		}

		const handleMouseDown = (event: MouseEvent) => {
			if (event.button !== 0) return
			event.preventDefault()
			event.stopPropagation()
			mouseState.isDragging = true
		}

		const handleMouseUp = (event: MouseEvent) => {
			if (event.button !== 0) return
			mouseState.isDragging = false
		}

		const handleMouseMove = (event: MouseEvent) => {
			if (!mouseState.isDragging) return
			mouseState.positionX += event.movementX
			mouseState.positionY += event.movementY
			setPosition({ x: mouseState.positionX, y: mouseState.positionY })
		}

		element.addEventListener('mousedown', handleMouseDown)
		window.addEventListener('mousemove', handleMouseMove)
		window.addEventListener('mouseup', handleMouseUp)

		return () => {
			element.removeEventListener('mousedown', handleMouseDown)
			window.removeEventListener('mousemove', handleMouseMove)
			window.removeEventListener('mouseup', handleMouseUp)
		}
	}, [ref])

	return (
		<Box
			ref={ref}
			onClick={onClick}
			sx={{
				pointerEvents: 'auto',
				background: theme.custom.palette.background.timeline,
				position: 'absolute',
				padding: 2,
				transform: `translate(calc(${position.x}px * var(--grid-scale)), calc(${position.y}px * var(--grid-scale)))`,
				outline: '2px solid',
				outlineColor: selectedNodes.includes(actor.id) ? theme.material.palette.primary.main : 'transparent',
				borderRadius: 2,
			}}
		>
			{actor.name}
			<Box
				sx={{
					background: theme.custom.palette.background.softest,
					position: 'absolute',
					top: 0,
					left: 0,
					width: '100%',
					height: '100%',
					borderRadius: 2,
					'&:hover': {
						background: theme.custom.palette.background.softer,
					},
					'&:active': {
						background: theme.custom.palette.background.soft,
					},
				}}
			></Box>
		</Box>
	)
}
