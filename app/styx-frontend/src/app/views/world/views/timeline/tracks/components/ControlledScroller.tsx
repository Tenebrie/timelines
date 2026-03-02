import Box from '@mui/material/Box'
import { memo, useCallback, useEffect, useRef } from 'react'

import { useEventBusSubscribe } from '@/app/features/eventBus'

import { TimelineState } from '../../utils/TimelineState'

export const EVENT_SCROLL_RESET_PERIOD = 10000
export const CONTROLLED_SCROLLER_SIZE = 100000

type Props = {
	children: React.ReactNode
	resetPeriod: number
}

export const ControlledScroller = memo(ControlledScrollerComponent)

function ControlledScrollerComponent({ children, resetPeriod }: Props) {
	const ref = useRef<HTMLDivElement>(null)

	const mod = useCallback((n: number, m: number) => ((n % m) + m) % m, [])
	const scrollValueRef = useRef(0)

	useEventBusSubscribe['timeline/onScroll']({
		callback: (newScroll) => {
			if (!ref.current) {
				return
			}

			scrollValueRef.current =
				Math.round(mod(-newScroll - 1, resetPeriod)) + CONTROLLED_SCROLLER_SIZE - resetPeriod
			ref.current.style.transform = `translateX(${-scrollValueRef.current}px)`
		},
	})

	useEffect(() => {
		if (!ref.current) {
			return
		}
		scrollValueRef.current =
			Math.round(mod(-TimelineState.scroll - 1, resetPeriod)) + CONTROLLED_SCROLLER_SIZE - resetPeriod
		ref.current.style.transform = `translateX(${-scrollValueRef.current}px)`
	}, [mod, ref, resetPeriod])

	return (
		<Box
			sx={{
				position: 'absolute',
				bottom: 0,
				width: '100%',
				height: '100%',
				overflowX: 'hidden',
				overflowY: 'hidden',
				pointerEvents: 'none',
			}}
		>
			<Box
				ref={ref}
				sx={{
					width: `${CONTROLLED_SCROLLER_SIZE * 2}px`,
					height: '100%',
					willChange: 'transform',
				}}
			>
				{children}
			</Box>
		</Box>
	)
}
