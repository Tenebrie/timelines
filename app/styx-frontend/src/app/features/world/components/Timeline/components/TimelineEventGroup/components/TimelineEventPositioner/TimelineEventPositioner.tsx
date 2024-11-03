import classNames from 'classnames'

import { useDragDrop } from '../../../../../../../../../hooks/useDragDrop'
import { useTimelineWorldTime } from '../../../../../../../time/hooks/useTimelineWorldTime'
import { useEventIcons } from '../../../../../../hooks/useEventIcons'
import useEventTracks from '../../../../hooks/useEventTracks'
import { Group } from '../../styles'
import { Marker } from '../TimelineEvent/styles'
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
	const { getIconPath } = useEventIcons()
	const { ref, isDragging, ghostElement } = useDragDrop<HTMLDivElement>({
		ghostFactory: () => (
			<Marker
				$iconPath={getIconPath(entity.icon)}
				className={classNames({
					revoked: entity.markerType === 'revokedAt',
					replace: entity.markerType === 'deltaState' || entity.markerType === 'ghostDelta',
					ghostEvent: entity.markerType === 'issuedAt' || entity.markerType === 'revokedAt',
					ghostDelta: entity.markerType === 'deltaState',
				})}
			>
				<div className="icon" />
			</Marker>
		),
	})
	const position = realTimeToScaledTime(Math.floor(entity.markerPosition) / timelineScale) + scroll

	if (position < -30 || position > containerWidth + 30) {
		return null
	}

	return (
		<Group
			ref={ref}
			$position={position}
			className={`${visible ? 'visible' : ''} ${isDragging} ? 'dragging' : ''`}
		>
			<TimelineEvent entity={entity} highlighted={highlighted} />
			{ghostElement}
		</Group>
	)
}
