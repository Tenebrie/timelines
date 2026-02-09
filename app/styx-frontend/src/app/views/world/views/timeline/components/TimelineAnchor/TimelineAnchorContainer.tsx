import Box from '@mui/material/Box'
import { ReactNode, useRef } from 'react'

import { dispatchEvent, useEventBusSubscribe } from '@/app/features/eventBus'
import { LineSpacing } from '@/app/utils/constants'

import { ControlledScroller } from '../../tracks/components/ControlledScroller'
import { TimelineSmallestPips } from './styles'
import { ANCHOR_RESET_PERIOD } from './TimelineAnchorLine'

type Props = {
	children?: ReactNode | ReactNode[]
}

const RESET_PERIOD = ANCHOR_RESET_PERIOD

export function TimelineAnchorContainer({ children }: Props) {
	const ref = useRef<HTMLDivElement>(null)
	const lastSeenScroll = useRef(0)
	useEventBusSubscribe['timeline/onScroll']({
		callback: (newScroll) => {
			const fixedScroll = Math.floor(newScroll / RESET_PERIOD)
			if (lastSeenScroll.current === fixedScroll) {
				return
			}
			lastSeenScroll.current = fixedScroll
			dispatchEvent['timeline/pips/forceUpdate'](newScroll)
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
				<TimelineSmallestPips $lineSpacing={LineSpacing} />
				{children}
			</Box>
		</ControlledScroller>
	)
}
