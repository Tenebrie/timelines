import classNames from 'classnames'
import { memo } from 'react'

import { useDragDrop } from '@/app/features/dragDrop/useDragDrop'
import { useEventBusSubscribe } from '@/app/features/eventBus'
import { useTimelineWorldTime } from '@/app/features/time/hooks/useTimelineWorldTime'
import { TimelineState } from '@/app/features/worldTimeline/components/Timeline/utils/TimelineState'
import { useEventIcons } from '@/app/features/worldTimeline/hooks/useEventIcons'
import { LineSpacing } from '@/app/features/worldTimeline/utils/constants'
import { useCustomTheme } from '@/hooks/useCustomTheme'

import useEventTracks, { TimelineEventHeightPx } from '../../hooks/useEventTracks'
import { Group } from '../../styles'
import { Marker } from '../TimelineEvent/styles'
import { TimelineEvent } from '../TimelineEvent/TimelineEvent'

type Props = {
	entity: ReturnType<typeof useEventTracks>[number]['events'][number]
	visible: boolean
	edited: boolean
	selected: boolean
	trackHeight: number
	realTimeToScaledTime: ReturnType<typeof useTimelineWorldTime>['realTimeToScaledTime']
}

const TimelineEventPositionerComponent = ({
	entity,
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
		ghostAlign: {
			top: 'center',
			left: 'center',
		},
		adjustPosition: (pos) => {
			const scroll = TimelineState.scroll
			const b = -scroll % LineSpacing
			const posTimestamp = pos.x + b
			const roundedValue = Math.round(posTimestamp / LineSpacing) * LineSpacing
			const offset = -scroll % LineSpacing > LineSpacing / 2 ? scroll % LineSpacing : scroll % LineSpacing
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
					$isDataPoint={entity.markerType === 'deltaState'}
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
	const position =
		realTimeToScaledTime(Math.floor(entity.markerPosition)) +
		TimelineState.scroll -
		TimelineEventHeightPx / 2 +
		1

	useEventBusSubscribe({
		event: 'timelineScrolled',
		callback: () => {
			const pos =
				realTimeToScaledTime(Math.floor(entity.markerPosition)) +
				TimelineState.scroll -
				TimelineEventHeightPx / 2 +
				1

			if (ref.current) {
				ref.current.style.left = `${pos}px`
			}
		},
	})

	const height = TimelineEventHeightPx * entity.markerHeight

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
