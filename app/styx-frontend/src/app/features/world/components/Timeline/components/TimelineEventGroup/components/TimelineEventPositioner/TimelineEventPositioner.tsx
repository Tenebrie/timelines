import { useTimelineWorldTime } from '../../../../../../../time/hooks/useTimelineWorldTime'
import useEventTracks from '../../../../hooks/useEventTracks'
import { Group } from '../../styles'
import { TimelineEvent } from '../TimelineEvent/TimelineEvent'

type Props = {
	entity: ReturnType<typeof useEventTracks>[number]['events'][number]
	scroll: number
	timelineScale: number
	visible: boolean
	containerWidth: number
	highlighted: boolean
	realTimeToScaledTime: ReturnType<typeof useTimelineWorldTime>['realTimeToScaledTime']
}

export const TimelineEventPositioner = ({
	entity,
	scroll,
	timelineScale,
	visible,
	containerWidth,
	highlighted,
	realTimeToScaledTime,
}: Props) => {
	const position = realTimeToScaledTime(Math.floor(entity.markerPosition) / timelineScale) + scroll

	if (position < -30 || position > containerWidth + 30) {
		return null
	}

	return (
		<Group $position={position} className={visible ? 'visible' : ''}>
			<TimelineEvent entity={entity} highlighted={highlighted} />
		</Group>
	)
}
