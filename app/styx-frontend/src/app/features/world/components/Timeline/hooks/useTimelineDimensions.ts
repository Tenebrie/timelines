import debounce from 'lodash.debounce'
import { useEffect, useRef } from 'react'

import { useEffectOnce } from '../../../../../utils/useEffectOnce'

export const useTimelineDimensions = () => {
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
		}, 100)
	)

	useEffectOnce(() => {
		window.addEventListener('resize', onResize.current)
		return () => window.removeEventListener('resize', onResize.current)
	})

	return {
		containerRef,
		containerWidth: containerWidth.current,
	}
}
