import Box from '@mui/material/Box'
import { useRef } from 'react'

import { useEventBusSubscribe } from '@/app/features/eventBus'

export const EVENT_SCROLL_RESET_PERIOD = 1000
export const CONTROLLED_SCROLLER_SIZE = 10000

type Props = {
	children: React.ReactNode
	resetPeriod: number
}

export const ControlledScroller = ({ children, resetPeriod }: Props) => {
	const ref = useRef<HTMLDivElement>(null)

	useEventBusSubscribe({
		event: 'timeline/onScroll',
		callback: (newScroll) => {
			if (!ref.current) {
				return
			}
			ref.current.scrollTo({ left: (-newScroll % resetPeriod) + CONTROLLED_SCROLLER_SIZE })
		},
	})

	return (
		<Box
			ref={ref}
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
			<Box sx={{ width: `${CONTROLLED_SCROLLER_SIZE * 2}px`, height: '100%', position: 'relative' }}>
				{children}
			</Box>
		</Box>
	)
}
