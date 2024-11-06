import classNames from 'classnames'
import { memo, useRef } from 'react'

import { useDragDrop } from '../../../../../../../dragDrop/useDragDrop'
import { useTimelineWorldTime } from '../../../../../../../time/hooks/useTimelineWorldTime'
import { useEventIcons } from '../../../../../../hooks/useEventIcons'
import useEventTracks from '../../hooks/useEventTracks'
import { Group } from '../../styles'
import { Marker } from '../TimelineEvent/styles'
import { TimelineEvent } from '../TimelineEvent/TimelineEvent'

type Props = {
	entity: ReturnType<typeof useEventTracks>[number]['events'][number]
	scroll: number
	lineSpacing: number
	timelineScale: number
	visible: boolean
	containerWidth: number
	highlighted: boolean
	realTimeToScaledTime: ReturnType<typeof useTimelineWorldTime>['realTimeToScaledTime']
}

const TimelineEventPositionerComponent = ({
	entity,
	scroll,
	lineSpacing,
	timelineScale,
	visible,
	containerWidth,
	highlighted,
	realTimeToScaledTime,
}: Props) => {
	const { getIconPath } = useEventIcons()

	const adjustPosition = (pos: { x: number; y: number }) => {
		const roundingFactor = lineSpacing
		const posTimestamp = pos.x
		const roundedValue = Math.floor(posTimestamp / roundingFactor) * roundingFactor
		return {
			x: roundedValue + ((entity.markerPosition + scroll) % lineSpacing),
			y: window.innerHeight - Math.round((window.innerHeight - pos.y + 14) / 96) * 96 + 16,
		}
	}

	const { ref, isDragging, ghostElement, attachEvents } = useDragDrop({
		type: 'timelineEvent',
		params: { event: entity },
		adjustPosition,
		ghostFactory: () => (
			<>
				<div
					style={{
						height: '100vh',
						background: 'red',
						width: '1px',
						position: 'absolute',
						top: 0,
						left: '50%',
					}}
				></div>
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
			</>
		),
	})
	const position = realTimeToScaledTime(Math.floor(entity.markerPosition) / timelineScale) + scroll

	const isHidden = useRef(false)

	if (position < -30 || position > containerWidth + 30) {
		isHidden.current = true
		return null
	}

	if (isHidden.current) {
		isHidden.current = false
		setTimeout(() => {
			attachEvents()
		}, 0)
	}

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
