import { memo } from 'react'

import { useTimelineWorldTime } from '@/app/features/time/hooks/useTimelineWorldTime'
import { MarkerType, TimelineEntity } from '@/app/features/world/types'

import { Chain } from '../../styles'
import { TimelineChain } from '../TimelineChain/TimelineChain'

type Props = {
	entity: TimelineEntity<MarkerType>
	visible: boolean
	edited: boolean
	selected: boolean
	scroll: number
	realTimeToScaledTime: ReturnType<typeof useTimelineWorldTime>['realTimeToScaledTime']
}

export const TimelineChainPositionerComponent = ({
	entity,
	visible,
	edited,
	selected,
	scroll,
	realTimeToScaledTime,
}: Props) => {
	const position = realTimeToScaledTime(Math.floor(entity.markerPosition)) + scroll

	return (
		<Chain $position={position} className={`${visible ? 'visible' : ''}`}>
			<TimelineChain
				entity={entity}
				edited={edited}
				selected={selected}
				realTimeToScaledTime={realTimeToScaledTime}
			/>
		</Chain>
	)
}

export const TimelineChainPositioner = memo(TimelineChainPositionerComponent)
