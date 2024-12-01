import { useEffect } from 'react'

import { TimelineState } from '@/app/features/world/components/Timeline/utils/TimelineState'

type Props = {
	ref: React.RefObject<HTMLDivElement>
}

export const useMarkerScroll = ({ ref }: Props) => {
	useEffect(() => {
		ref.current?.style.setProperty('--timeline-scroll', `${TimelineState.scroll}px`)
	}, [ref])
}
