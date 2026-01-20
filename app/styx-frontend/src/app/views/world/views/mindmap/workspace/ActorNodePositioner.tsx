import { MindmapNode } from '@api/types/mindmapTypes'
import { ActorDetails } from '@api/types/worldTypes'
import Box from '@mui/material/Box'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import useEvent from 'react-use-event-hook'

import { useCustomTheme } from '@/app/features/theming/hooks/useCustomTheme'
import { useAutoRef } from '@/app/hooks/useAutoRef'
import { useDoubleClick } from '@/app/hooks/useDoubleClick'
import { isMultiselectClick } from '@/app/utils/isMultiselectClick'
import { worldSlice } from '@/app/views/world/WorldSlice'
import { getSelectedNodeActorIds } from '@/app/views/world/WorldSliceSelectors'
import { useStableNavigate } from '@/router-utils/hooks/useStableNavigate'

import { useUpdateMindmapNode } from '../api/useUpdateMindmapNode'
import { ActorNode } from './ActorNode'

type Props = {
	actor: ActorDetails
	node: MindmapNode
}

export function ActorNodePositioner({ actor, node }: Props) {
	const theme = useCustomTheme()
	const navigate = useStableNavigate({ from: '/world/$worldId/mindmap' })
	const [updateMindmapNode] = useUpdateMindmapNode()

	const [position, setPosition] = useState({ x: node.positionX, y: node.positionY })
	const positionRef = useAutoRef(position)

	useEffect(() => {
		setPosition({ x: node.positionX, y: node.positionY })
	}, [node])

	const selectedNodes = useSelector(getSelectedNodeActorIds)
	const selected = useMemo(() => selectedNodes.includes(actor.id), [selectedNodes, actor.id])
	const { addActorNodeToSelection, removeActorNodeFromSelection } = worldSlice.actions
	const dispatch = useDispatch()

	const { triggerClick: onHeaderClick } = useDoubleClick<{ multiselect: boolean }>({
		onClick: ({ multiselect }) => {
			if (selected) {
				dispatch(removeActorNodeFromSelection(node.id))
			} else {
				dispatch(addActorNodeToSelection({ key: node.id, actorId: actor.id, multiselect }))
			}
		},
		onDoubleClick: () => {
			onContentClick()
			dispatch(addActorNodeToSelection({ key: node.id, actorId: actor.id, multiselect: false }))
		},
		ignoreDelay: true,
	})

	const onContentClick = useEvent(() => {
		navigate({
			search: (prev) => ({
				...prev,
				navi: [actor.id],
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
			canClick: true,

			isDragging: false,
			deltaX: 0,
			deltaY: 0,
		}
		element.style.setProperty('--inner-transition-duration', '0.1s')

		const handleMouseDown = (event: MouseEvent) => {
			if (event.button !== 0) {
				return
			}
			event.stopPropagation()

			// Don't start dragging if clicking on content (but header is ok for dragging)
			const target = event.target as HTMLElement
			const contentElement = element.querySelector('[data-mindmap-content]')
			if (contentElement?.contains(target)) {
				return
			}

			mouseState.isButtonDown = true
			mouseState.gridScale = parseFloat(getComputedStyle(element).getPropertyValue('--grid-scale'))
			element.style.setProperty('--inner-transition-duration', '0.00s')
		}

		const handleMouseClick = (event: MouseEvent) => {
			if (!mouseState.canClick) {
				event.stopPropagation()
				event.preventDefault()
			}
			mouseState.canClick = true
		}

		const handleMouseUp = (event: MouseEvent) => {
			if (event.button !== 0 || !mouseState.isButtonDown) {
				return
			}

			updateMindmapNode(node.id, {
				positionX: positionRef.current.x,
				positionY: positionRef.current.y,
			})
			// event.currentTarget.style.cursor = 'grabbing'

			mouseState.isButtonDown = false
			mouseState.isDragging = false
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
		element.addEventListener('click', handleMouseClick)
		window.addEventListener('mousemove', handleMouseMove)
		window.addEventListener('mouseup', handleMouseUp)

		return () => {
			element.removeEventListener('mousedown', handleMouseDown)
			element.removeEventListener('click', handleMouseClick)
			window.removeEventListener('mousemove', handleMouseMove)
			window.removeEventListener('mouseup', handleMouseUp)
		}
	}, [ref, positionRef, updateMindmapNode, node.id])

	return (
		<Box
			ref={ref}
			data-mindmap-node={node.id}
			data-actor-id={actor.id}
			sx={{
				pointerEvents: 'auto',
				background: theme.custom.palette.background.timeline,
				position: 'absolute',
				transform: `translate(calc(${position.x}px * var(--grid-scale) + var(--grid-offset-x)), calc(${position.y}px * var(--grid-scale) + var(--grid-offset-y))) scale(var(--grid-scale))`,
				transformOrigin: 'top left',
				outline: '2px solid',
				outlineColor: selected ? theme.material.palette.primary.main : 'transparent',
				transition:
					'transform min(var(--transition-duration), var(--inner-transition-duration)) ease-out, outline-color 0.2s ease-out',
				borderRadius: 2,
				'&:hover': {
					zIndex: 10,
				},
			}}
		>
			<ActorNode
				actor={actor}
				node={node}
				onHeaderClick={(e) => onHeaderClick(e, { multiselect: isMultiselectClick(e) })}
				onContentClick={onContentClick}
			/>
		</Box>
	)
}
