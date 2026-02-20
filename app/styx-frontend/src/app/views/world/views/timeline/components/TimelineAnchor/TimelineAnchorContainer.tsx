import Box from '@mui/material/Box'
import { ReactNode, useRef } from 'react'

import { useEventBusDispatch, useEventBusSubscribe } from '@/app/features/eventBus'

import { ControlledScroller } from '../../tracks/components/ControlledScroller'
import { ANCHOR_RESET_PERIOD } from './TimelineAnchorLine'

type Props = {
	children?: ReactNode | ReactNode[]
}

const RESET_PERIOD = ANCHOR_RESET_PERIOD

export function TimelineAnchorContainer({ children }: Props) {
	const ref = useRef<HTMLDivElement>(null)
	const lastSeenScroll = useRef(0)
	const forceUpdate = useEventBusDispatch['timeline/pips/forceUpdate']()
	useEventBusSubscribe['timeline/onScroll']({
		callback: (newScroll) => {
			const fixedScroll = Math.floor(newScroll / RESET_PERIOD)
			if (lastSeenScroll.current === fixedScroll) {
				return
			}
			lastSeenScroll.current = fixedScroll
			forceUpdate(newScroll)
		},
	})

	return (
		<ControlledScroller resetPeriod={RESET_PERIOD}>
			<Box
				ref={ref}
				sx={{
					height: 32,
					width: '100%',
					position: 'absolute',
					bottom: 0,
					pointerEvents: 'auto',
				}}
			>
				{/* <TimelineSmallestPips $lineSpacing={LineSpacing} /> */}
				{children}
			</Box>
		</ControlledScroller>
	)
}
