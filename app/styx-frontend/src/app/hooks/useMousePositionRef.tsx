import { useEffect, useRef } from 'react'

export function useMousePositionRef() {
	const mousePos = useRef({ x: 0, y: 0 })

	useEffect(() => {
		const onMouseMove = (event: MouseEvent) => {
			mousePos.current = { x: event.clientX, y: event.clientY }
		}

		window.addEventListener('mousemove', onMouseMove)
		return () => {
			window.removeEventListener('mousemove', onMouseMove)
		}
	}, [])

	return mousePos
}
