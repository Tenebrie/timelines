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

const RESET_PERIOD = 50

export function TimelineAnchorContainer({ children }: Props) {
	const ref = useRef<HTMLDivElement>(null)
	const lastSeenScroll = useRef(0)
	useEventBusSubscribe({
		event: 'timeline/onScroll',
		callback: (newScroll) => {
			const fixedScroll = Math.floor(newScroll / RESET_PERIOD) * RESET_PERIOD + CONTROLLED_SCROLLER_SIZE
			if (lastSeenScroll.current === fixedScroll) {
				return
			}
			lastSeenScroll.current = fixedScroll
			ref.current?.style.setProperty('--scroll', `${fixedScroll}px`)
			ref.current?.style.setProperty('--pip-scroll', `${-fixedScroll + (fixedScroll % LineSpacing)}px`)
		},
	})

	useEffect(() => {
		if (!ref.current) {
			return
		}
		const newScroll = TimelineState.scroll
		const fixedScroll = Math.floor(newScroll / RESET_PERIOD) * RESET_PERIOD + CONTROLLED_SCROLLER_SIZE
		ref.current?.style.setProperty('--scroll', `${fixedScroll}px`)
		ref.current?.style.setProperty('--pip-scroll', `${-fixedScroll + (fixedScroll % LineSpacing)}px`)
	}, [ref])

	return (
		<ControlledScroller resetPeriod={RESET_PERIOD}>
			<Box
				ref={ref}
				sx={{
					position: 'absolute',
					bottom: 0,
					pointerEvents: 'none',
					transform: 'translateX(var(--scroll))',
				}}
			>
				<TimelineSmallestPips $lineSpacing={LineSpacing} />
				{children}
			</Box>
		</ControlledScroller>
	)
}
