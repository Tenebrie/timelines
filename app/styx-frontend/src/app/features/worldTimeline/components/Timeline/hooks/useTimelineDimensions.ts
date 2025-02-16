import debounce from 'lodash.debounce'
import { useDebugValue, useEffect, useRef } from 'react'

export const useTimelineDimensions = () => {
	useDebugValue('useTimelineDimensions')
	const containerRef = useRef<HTMLDivElement | null>(null)
	const containerWidth = useRef<number>(window.innerWidth)

	useEffect(() => {
		if (!containerRef.current) {
			return
		}
		containerWidth.current = containerRef.current.getBoundingClientRect().width
	}, [containerRef])

	const onResize = useRef(
		debounce(() => {
			if (!containerRef.current) {
				return
			}
			containerWidth.current = containerRef.current.getBoundingClientRect().width
			console.log(containerWidth.current)
		}, 100),
	)

	useEffect(() => {
		if (!containerRef.current) {
			return
		}
		const handler = onResize.current
		const container = containerRef.current
		const observer = new ResizeObserver(handler)
		observer.observe(container)
		return () => {
			observer.unobserve(container)
		}
	}, [containerRef])

	return {
		containerRef,
		containerWidth: containerWidth.current,
	}
}
