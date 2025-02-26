import Box from '@mui/material/Box'
import { ReactNode } from '@tanstack/react-router'
import { useEffect, useRef } from 'react'

import { useEventBusSubscribe } from '@/app/features/eventBus'
import { LineSpacing } from '@/app/utils/constants'

import { TimelineState } from '../../utils/TimelineState'
import { TimelineSmallestPips } from './styles'
import { ResetNumbersAfterEvery } from './TimelineAnchor'

type Props = {
	children: ReactNode | ReactNode[]
}

export function TimelineAnchorContainer({ children }: Props) {
	const ref = useRef<HTMLDivElement>(null)
	const lastSeenScroll = useRef(0)
	useEventBusSubscribe({
		event: 'timelineScrolled',
		callback: (newScroll) => {
			const fixedScroll = newScroll % ResetNumbersAfterEvery
			if (lastSeenScroll.current === newScroll) {
				return
			}
			lastSeenScroll.current = newScroll
			ref.current?.style.setProperty('--scroll', `${fixedScroll}px`)
			ref.current?.style.setProperty('--pip-scroll', `${-fixedScroll + (fixedScroll % LineSpacing)}px`)
		},
	})

	useEffect(() => {
		if (!ref.current) {
			return
		}
		const newScroll = TimelineState.scroll
		const fixedScroll = newScroll % ResetNumbersAfterEvery
		ref.current?.style.setProperty('--scroll', `${fixedScroll}px`)
		ref.current?.style.setProperty('--pip-scroll', `${-fixedScroll + (fixedScroll % LineSpacing)}px`)
	}, [ref])

	return (
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
	)
}
