import Box from '@mui/material/Box'
import { useNavigate } from '@tanstack/react-router'
import { useRef } from 'react'
import { useEffect } from 'react'
import useEvent from 'react-use-event-hook'

import { useNewNodeReceiver } from '../hooks/useNewNodeReceiver'

export function MindmapClickArea() {
	const navigate = useNavigate({ from: '/world/$worldId/mindmap' })

	const onClick = useEvent(() => {
		navigate({ search: (prev) => ({ ...prev, selection: [], new: undefined }) })
	})

	const ref = useRef<HTMLDivElement>(null)
	useNewNodeReceiver({ ref })

	useEffect(() => {
		const element = ref.current
		if (!element) {
			return
		}

		const mouseState = {
			isButtonDown: false,

			canClick: true,
			deltaX: 0,
			deltaY: 0,
		}

		const handleMouseDown = (event: MouseEvent) => {
			if (event.button !== 0) {
				return
			}
			mouseState.isButtonDown = true
		}

		const handleMouseUp = (event: MouseEvent) => {
			if (event.button !== 0 || !mouseState.isButtonDown) {
				return
			}
			if (mouseState.canClick) {
				onClick()
			}
			mouseState.isButtonDown = false
			mouseState.canClick = true
			mouseState.deltaX = 0
			mouseState.deltaY = 0
		}

		const handleMouseMove = (event: MouseEvent) => {
			if (!mouseState.isButtonDown) {
				return
			}

			mouseState.deltaX += event.movementX
			mouseState.deltaY += event.movementY

			if (Math.abs(mouseState.deltaX) > 5 || Math.abs(mouseState.deltaY) > 5) {
				mouseState.canClick = false
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
	}, [onClick])

	return <Box ref={ref} sx={{ position: 'absolute', width: '100%', height: '100%', top: 0, left: 0 }}></Box>
}
