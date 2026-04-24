import { MindmapNode } from '@api/types/mindmapTypes'
import { ActorDetails } from '@api/types/worldTypes'
import Box from '@mui/material/Box'
import { useEffect, useMemo, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import useEvent from 'react-use-event-hook'

import { dispatchGlobalEvent } from '@/app/features/eventBus'
import { useCustomTheme } from '@/app/features/theming/hooks/useCustomTheme'
import { useDoubleClick } from '@/app/hooks/useDoubleClick'
import { isMultiselectClick } from '@/app/utils/isMultiselectClick'
import { useStableNavigate } from '@/router-utils/hooks/useStableNavigate'

import { useUpdateMindmapNode } from '../api/useUpdateMindmapNode'
import { mindmapSlice } from '../MindmapSlice'
import { getSelectedNodeActorIds } from '../MindmapSliceSelectors'
import { ActorNode } from './ActorNode'

type Props = {
	actor: ActorDetails
	node: MindmapNode
}

export function ActorNodePositioner({ actor, node }: Props) {
	const theme = useCustomTheme()
	const navigate = useStableNavigate({ from: '/world/$worldId/mindmap' })
	const [updateMindmapNode] = useUpdateMindmapNode()

	const positionRef = useRef({ x: node.positionX, y: node.positionY })

	useEffect(() => {
		positionRef.current = { x: node.positionX, y: node.positionY }
		const el = ref.current
		if (el) {
			el.style.setProperty('--node-x', `${node.positionX}px`)
			el.style.setProperty('--node-y', `${node.positionY}px`)
		}
	}, [node])

	const selectedNodes = useSelector(getSelectedNodeActorIds)
	const selected = useMemo(() => selectedNodes.includes(actor.id), [selectedNodes, actor.id])
	const { addNodeToSelection, removeNodeFromSelection } = mindmapSlice.actions
	const dispatch = useDispatch()

	const { triggerClick: onHeaderClick } = useDoubleClick<{ multiselect: boolean }>({
		onClick: ({ multiselect }) => {
			if (selected) {
				dispatch(removeNodeFromSelection(node.id))
			} else {
				dispatch(addNodeToSelection({ key: node.id, actorId: actor.id, multiselect }))
			}
		},
		onDoubleClick: () => {
			onContentClick()
			dispatch(addNodeToSelection({ key: node.id, actorId: actor.id, multiselect: false }))
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

	const ref = useRef<HTMLDivElement>(null)

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

			// Don't start dragging if clicking on content (but header is fine for dragging)
			const target = event.target as HTMLElement
			const contentElement = element.querySelector('[data-mindmap-content]')
			if (contentElement?.contains(target)) {
				return
			}

			mouseState.positionX = positionRef.current.x
			mouseState.positionY = positionRef.current.y
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

			const snappedPosition = {
				x: Math.round(positionRef.current.x / 10) * 10,
				y: Math.round(positionRef.current.y / 10) * 10,
			}

			positionRef.current = snappedPosition
			element.style.setProperty('--node-x', `${snappedPosition.x}px`)
			element.style.setProperty('--node-y', `${snappedPosition.y}px`)

			updateMindmapNode(node.id, {
				positionX: snappedPosition.x,
				positionY: snappedPosition.y,
			})

			dispatchGlobalEvent['mindmap/node/onMove']({
				nodeId: node.id,
				positionX: snappedPosition.x,
				positionY: snappedPosition.y,
			})

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

			if (!mouseState.isDragging && (Math.abs(mouseState.deltaX) > 3 || Math.abs(mouseState.deltaY) > 3)) {
				mouseState.isDragging = true
				mouseState.canClick = false
			}

			if (mouseState.isDragging) {
				mouseState.positionX += mouseState.deltaX / mouseState.gridScale
				mouseState.positionY += mouseState.deltaY / mouseState.gridScale
				positionRef.current = { x: mouseState.positionX, y: mouseState.positionY }
				element.style.setProperty('--node-x', `${mouseState.positionX}px`)
				element.style.setProperty('--node-y', `${mouseState.positionY}px`)
				dispatchGlobalEvent['mindmap/node/onMove']({
					nodeId: node.id,
					positionX: mouseState.positionX,
					positionY: mouseState.positionY,
				})

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
	}, [positionRef, updateMindmapNode, node.id])

	return (
		<Box
			ref={ref}
			data-mindmap-node={node.id}
			data-actor-id={actor.id}
			style={
				{
					'--node-x': `${node.positionX}px`,
					'--node-y': `${node.positionY}px`,
				} as React.CSSProperties
			}
			sx={{
				pointerEvents: 'auto',
				background: theme.custom.palette.background.timeline,
				position: 'absolute',
				transform:
					'translate(calc(var(--node-x) * var(--grid-scale) + var(--grid-offset-x)), calc(var(--node-y) * var(--grid-scale) + var(--grid-offset-y))) scale(var(--grid-scale))',
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
