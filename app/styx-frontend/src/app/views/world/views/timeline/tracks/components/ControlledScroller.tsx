import Box from '@mui/material/Box'
import { useCallback, useEffect, useRef } from 'react'

import { useEventBusSubscribe } from '@/app/features/eventBus'

import { TimelineState } from '../../utils/TimelineState'

export const EVENT_SCROLL_RESET_PERIOD = 1000
export const CONTROLLED_SCROLLER_SIZE = 10000

type Props = {
	children: React.ReactNode
	resetPeriod: number
}

export const ControlledScroller = ({ children, resetPeriod }: Props) => {
	const ref = useRef<HTMLDivElement>(null)

	const mod = useCallback((n: number, m: number) => ((n % m) + m) % m, [])

	useEventBusSubscribe['timeline/onScroll']({
		callback: (newScroll) => {
			if (!ref.current) {
				return
			}

			ref.current.scrollTo({
				left: Math.round(mod(-newScroll - 1, resetPeriod)) + CONTROLLED_SCROLLER_SIZE - resetPeriod + 42,
			})
		},
	})

	useEffect(() => {
		ref.current?.scrollTo({
			left:
				Math.round(mod(-TimelineState.scroll - 1, resetPeriod)) + CONTROLLED_SCROLLER_SIZE - resetPeriod + 42,
		})
	}, [mod, ref, resetPeriod])

	return (
		<Box
			ref={ref}
			sx={{
				position: 'absolute',
				bottom: 0,
				width: '100%',
				height: '100%',
				overflowX: 'hidden',
				overflowY: 'visible',
				pointerEvents: 'none',
			}}
		>
			<Box sx={{ width: `${CONTROLLED_SCROLLER_SIZE * 2}px`, height: '100%' }}>{children}</Box>
		</Box>
	)
}
