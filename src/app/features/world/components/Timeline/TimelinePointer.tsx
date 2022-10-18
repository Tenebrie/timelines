import throttle from 'lodash.throttle'
import React, { MutableRefObject, useCallback, useEffect, useState } from 'react'

import { MousePointer } from './styles'

type Props = {
	containerRef: MutableRefObject<HTMLDivElement | null>
	visible: boolean
}

export const TimelinePointer = ({ containerRef, visible }: Props) => {
	const [pointerPos, setPointerPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 })

	const throttledMouseMove = useCallback(
		throttle((x: number, y: number) => {
			setPointerPos({
				x,
				y,
			})
		}, 8),
		[setPointerPos]
	)

	useEffect(() => {
		if (!containerRef.current) {
			return
		}

		containerRef.current.addEventListener('mousemove', (event) => {
			const x = event.x
			const y = event.y

			throttledMouseMove(x, y)
		})
	}, [containerRef, throttledMouseMove])

	if (!visible) {
		return <div />
	}

	return <MousePointer offset={pointerPos.x} />
}
