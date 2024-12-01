import classNames from 'classnames'
import { memo } from 'react'

import { useDragDrop } from '@/app/features/dragDrop/useDragDrop'
import { useTimelineWorldTime } from '@/app/features/time/hooks/useTimelineWorldTime'
import { useEventIcons } from '@/app/features/world/hooks/useEventIcons'
import { useCustomTheme } from '@/hooks/useCustomTheme'

import useEventTracks, { TimelineEventHeightPx } from '../../hooks/useEventTracks'
import { useMarkerScroll } from '../../hooks/useMarkerScroll'
import { Group } from '../../styles'
import { Marker } from '../TimelineEvent/styles'
import { TimelineEvent } from '../TimelineEvent/TimelineEvent'

type Props = {
	entity: ReturnType<typeof useEventTracks>[number]['events'][number]
	lineSpacing: number
	visible: boolean
	edited: boolean
	selected: boolean
	trackHeight: number
	realTimeToScaledTime: ReturnType<typeof useTimelineWorldTime>['realTimeToScaledTime']
}

const TimelineEventPositionerComponent = ({
	entity,
	lineSpacing,
	visible,
	edited,
	selected,
	trackHeight,
	realTimeToScaledTime,
}: Props) => {
	const { getIconPath } = useEventIcons()
	const theme = useCustomTheme()

	const { ref, isDragging, ghostElement } = useDragDrop({
		type: 'timelineEvent',
		params: { event: entity },
		adjustPosition: (pos) => {
			const roundingFactor = lineSpacing
			const b = -scroll % lineSpacing
			const posTimestamp = pos.x + b
			const roundedValue = Math.round(posTimestamp / roundingFactor) * roundingFactor
			const offset = -scroll % lineSpacing > lineSpacing / 2 ? scroll % lineSpacing : scroll % lineSpacing
			return {
				x: roundedValue + offset,
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
						overflow: 'hidden',
					}}
				></div>
				<Marker
					$size={TimelineEventHeightPx - 6}
					$borderColor="gray"
					$iconPath={getIconPath(entity.icon)}
					$theme={theme}
					className={classNames({
						revoked: entity.markerType === 'revokedAt',
						replace: entity.markerType === 'deltaState' || entity.markerType === 'ghostDelta',
						ghostEvent: entity.markerType === 'issuedAt' || entity.markerType === 'revokedAt',
						ghostDelta: entity.markerType === 'deltaState',
					})}
				>
					<div className="icon image"></div>
				</Marker>
			</>
		),
	})
	const scroll = 0
	const position =
		realTimeToScaledTime(Math.floor(entity.markerPosition)) + scroll - TimelineEventHeightPx / 2 + 10
	const height = TimelineEventHeightPx * entity.markerHeight
	useMarkerScroll({ ref })

	return (
		<Group
			ref={ref}
			$position={position}
			$height={height}
			className={`${visible ? 'visible' : ''} ${isDragging ? 'dragging' : ''} timeline-marker-scroll`}
		>
			<TimelineEvent entity={entity} trackHeight={trackHeight} edited={edited} selected={selected} />
			{ghostElement}
		</Group>
	)
}

export const TimelineEventPositioner = memo(TimelineEventPositionerComponent)
