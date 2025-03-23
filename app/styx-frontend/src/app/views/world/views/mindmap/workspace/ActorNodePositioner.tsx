import { ActorDetails } from '@api/types/worldTypes'
import Box from '@mui/material/Box'
import { useNavigate, useSearch } from '@tanstack/react-router'
import { useEffect, useRef, useState } from 'react'
import useEvent from 'react-use-event-hook'

import { useCustomTheme } from '@/app/features/theming/hooks/useCustomTheme'
import { useAutoRef } from '@/app/hooks/useAutoRef'

import { ActorNode } from './ActorNode'

type Props = {
	actor: ActorDetails
}

export function ActorNodePositioner({ actor }: Props) {
	const theme = useCustomTheme()
	const navigate = useNavigate({ from: '/world/$worldId/mindmap' })

	const [position, setPosition] = useState({ x: Math.random() * 1000, y: Math.random() * 1000 })
	const positionRef = useAutoRef(position)

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
			isButtonDown: false,
			positionX: positionRef.current.x,
			positionY: positionRef.current.y,
			gridScale: 1,

			isDragging: false,
			canClick: true,
			deltaX: 0,
			deltaY: 0,
		}
		element.style.setProperty('--inner-transition-duration', '0.1s')

		const handleMouseDown = (event: MouseEvent) => {
			if (event.button !== 0) {
				return
			}
			event.preventDefault()
			event.stopPropagation()
			mouseState.isButtonDown = true
			mouseState.gridScale = parseFloat(getComputedStyle(element).getPropertyValue('--grid-scale'))
			element.style.setProperty('--inner-transition-duration', '0.00s')
		}

		const handleMouseUp = (event: MouseEvent) => {
			if (event.button !== 0 || !mouseState.isButtonDown) {
				return
			}
			if (mouseState.canClick) {
				onClick()
			}
			mouseState.isButtonDown = false
			mouseState.isDragging = false
			mouseState.canClick = true
			mouseState.deltaX = 0
			mouseState.deltaY = 0
			element.style.setProperty('--inner-transition-duration', '0.1s')
		}

		const handleMouseMove = (event: MouseEvent) => {
			if (!mouseState.isButtonDown) {
				return
			}

			mouseState.deltaX += event.movementX
			mouseState.deltaY += event.movementY

			if (!mouseState.isDragging && (Math.abs(mouseState.deltaX) > 5 || Math.abs(mouseState.deltaY) > 5)) {
				mouseState.isDragging = true
				mouseState.canClick = false
			}

			if (mouseState.isDragging) {
				mouseState.positionX += mouseState.deltaX / mouseState.gridScale
				mouseState.positionY += mouseState.deltaY / mouseState.gridScale
				setPosition({ x: mouseState.positionX, y: mouseState.positionY })

				mouseState.deltaX = 0
				mouseState.deltaY = 0
			}
		}

		element.addEventListener('mousedown', handleMouseDown)
		window.addEventListener('mousemove', handleMouseMove)
		window.addEventListener('mouseup', handleMouseUp)

		return () => {
			element.removeEventListener('mousedown', handleMouseDown)
			window.removeEventListener('mousemove', handleMouseMove)
			window.removeEventListener('mouseup', handleMouseUp)
		}
	}, [ref, positionRef, onClick])

	return (
		<Box
			ref={ref}
			sx={{
				pointerEvents: 'auto',
				background: theme.custom.palette.background.timeline,
				position: 'absolute',
				transform: `translate(calc(${position.x}px * var(--grid-scale) + var(--grid-offset-x)), calc(${position.y}px * var(--grid-scale) + var(--grid-offset-y)))`,
				outline: '2px solid',
				outlineColor: selectedNodes.includes(actor.id) ? theme.material.palette.primary.main : 'transparent',
				transition: 'transform min(var(--transition-duration), var(--inner-transition-duration)) ease-out',
				borderRadius: 2,
			}}
		>
			<ActorNode actor={actor} isSelected={selectedNodes.includes(actor.id)} />
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
