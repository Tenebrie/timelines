import classNames from 'classnames'
import { memo } from 'react'

import { useDragDrop } from '../../../../../../../dragDrop/useDragDrop'
import { useTimelineWorldTime } from '../../../../../../../time/hooks/useTimelineWorldTime'
import { useEventIcons } from '../../../../../../hooks/useEventIcons'
import { TimelineScroll } from '../../../../utils/TimelineScroll'
import useEventTracks from '../../hooks/useEventTracks'
import { Group } from '../../styles'
import { Marker } from '../TimelineEvent/styles'
import { TimelineEvent } from '../TimelineEvent/TimelineEvent'

type Props = {
	entity: ReturnType<typeof useEventTracks>[number]['events'][number]
	lineSpacing: number
	timelineScale: number
	visible: boolean
	highlighted: boolean
	realTimeToScaledTime: ReturnType<typeof useTimelineWorldTime>['realTimeToScaledTime']
}

const TimelineEventPositionerComponent = ({
	entity,
	lineSpacing,
	timelineScale,
	visible,
	highlighted,
	realTimeToScaledTime,
}: Props) => {
	const { getIconPath } = useEventIcons()

	const { ref, isDragging, ghostElement } = useDragDrop({
		type: 'timelineEvent',
		params: { event: entity },
		adjustPosition: (pos) => {
			const roundingFactor = lineSpacing
			const posTimestamp = pos.x
			const roundedValue = Math.floor(posTimestamp / roundingFactor) * roundingFactor
			return {
				x: roundedValue + ((entity.markerPosition + TimelineScroll.current) % lineSpacing),
				// y: window.innerHeight - Math.round((window.innerHeight - pos.y + 15 - 25) / 96) * 96 + 34 - 24 - 16,
				y: pos.y,
			}
		},
		ghostFactory: () => (
			<>
				<div
					style={{
						height: '100vh',
						background: 'gray',
						width: '1px',
						position: 'absolute',
						top: 0,
						left: '50%',
					}}
				></div>
				<Marker
					$borderColor="gray"
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
			</>
		),
	})
	const position = realTimeToScaledTime(Math.floor(entity.markerPosition) / timelineScale)

	return (
		<Group
			ref={ref}
			$position={position}
			className={`${visible ? 'visible' : ''} ${isDragging ? 'dragging' : ''}`}
		>
			<TimelineEvent entity={entity} highlighted={highlighted} />
			{ghostElement}
		</Group>
	)
}

export const TimelineEventPositioner = memo(TimelineEventPositionerComponent)
