import Box from '@mui/material/Box'
import { ReactNode, useEffect, useRef } from 'react'

import { useEventBusSubscribe } from '@/app/features/eventBus'
import { LineSpacing } from '@/app/utils/constants'

import { CONTROLLED_SCROLLER_SIZE, ControlledScroller } from '../../tracks/components/ControlledScroller'
import { TimelineState } from '../../utils/TimelineState'
import { TimelineSmallestPips } from './styles'

type Props = {
	children: ReactNode | ReactNode[]
}

const RESET_PERIOD = 1000

export function TimelineAnchorContainer({ children }: Props) {
	const ref = useRef<HTMLDivElement>(null)
	const lastSeenScroll = useRef(0)
	useEventBusSubscribe['timeline/onScroll']({
		callback: (newScroll) => {
			const fixedScroll = Math.floor(newScroll / RESET_PERIOD) * RESET_PERIOD + CONTROLLED_SCROLLER_SIZE
			if (lastSeenScroll.current === fixedScroll) {
				return
			}
			lastSeenScroll.current = fixedScroll
			// Keep pip scroll within reasonable bounds using modulo of RESET_PERIOD
			const pipScroll = ((-newScroll % RESET_PERIOD) + RESET_PERIOD) % RESET_PERIOD
			ref.current?.style.setProperty('--pip-scroll', `${pipScroll}px`)
		},
	})

	useEffect(() => {
		if (!ref.current) {
			return
		}
		const newScroll = TimelineState.scroll
		// Keep pip scroll within reasonable bounds using modulo of RESET_PERIOD
		const pipScroll = ((-newScroll % RESET_PERIOD) + RESET_PERIOD) % RESET_PERIOD
		ref.current?.style.setProperty('--pip-scroll', `${pipScroll}px`)
	}, [ref])

	return (
		<ControlledScroller resetPeriod={RESET_PERIOD}>
			<Box
				ref={ref}
				sx={{
					position: 'absolute',
					bottom: 32,
					pointerEvents: 'auto',
					background: 'red',
				}}
			>
				<TimelineSmallestPips $lineSpacing={LineSpacing} />
				{children}
			</Box>
		</ControlledScroller>
	)
}
