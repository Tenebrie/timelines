import debounce from 'lodash.debounce'
import { useEffect, useRef, useState } from 'react'

export const useTimelineDimensions = () => {
	const containerRef = useRef<HTMLDivElement | null>(null)
	const [width, setWidth] = useState<number>(window.innerWidth)

	useEffect(() => {
		if (!containerRef.current) {
			return
		}
		setWidth(containerRef.current.getBoundingClientRect().width)
	}, [containerRef])

	const onResize = useRef(
		debounce(() => {
			if (!containerRef.current) {
				return
			}
			setWidth(containerRef.current.getBoundingClientRect().width)
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
		containerWidth: width,
	}
}
