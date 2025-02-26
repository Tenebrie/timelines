import { MarkerType, TimelineEntity } from '@api/types/types'
import classNames from 'classnames'
import { CSSProperties, memo } from 'react'

import { useDragDrop } from '@/app/features/dragDrop/useDragDrop'
import { useEventBusSubscribe } from '@/app/features/eventBus'
import { useEventIcons } from '@/app/features/icons/useEventIcons'
import { useCustomTheme } from '@/app/features/theming/useCustomTheme'
import { useTimelineWorldTime } from '@/app/features/time/hooks/useTimelineWorldTime'
import { LineSpacing } from '@/app/utils/constants'
import { TimelineState } from '@/app/views/world/views/timeline/utils/TimelineState'

import { TimelineEventHeightPx } from '../hooks/useEventTracks'
import { Group } from '../styles'
import { Marker } from './TimelineEvent/styles'
import { TimelineEvent } from './TimelineEvent/TimelineEvent'

type Props = {
	entity: TimelineEntity<MarkerType>
	visible: boolean
	selected: boolean
	trackHeight: number
	realTimeToScaledTime: ReturnType<typeof useTimelineWorldTime>['realTimeToScaledTime']
}

export const TimelineEventPositioner = memo(TimelineEventPositionerComponent)

function TimelineEventPositionerComponent({
	entity,
	visible,
	selected,
	trackHeight,
	realTimeToScaledTime,
}: Props) {
	const { getIconPath } = useEventIcons()
	const theme = useCustomTheme()

	const cssVariables = {
		'--border-color': 'gray',
		'--icon-path': `url(${getIconPath(entity.icon)})`,
		'--marker-size': `${TimelineEventHeightPx - 6}px`,
		'--border-radius': entity.markerType === 'deltaState' ? '50%' : '4px',
	} as CSSProperties

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
					$theme={theme}
					style={cssVariables}
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
		callback: (newScroll) => {
			const pos =
				realTimeToScaledTime(Math.round(entity.markerPosition)) + newScroll - TimelineEventHeightPx / 2 + 1

			if (ref.current && ref.current.style.getPropertyValue('--position') !== `${pos}px`) {
				ref.current?.style.setProperty('--position', `${pos}px`)
			}
		},
	})

	const height = TimelineEventHeightPx * entity.markerHeight

	return (
		<Group
			data-testid="TimelineMarker"
			ref={ref}
			style={{ '--position': `${position}px` } as CSSProperties}
			$height={height}
			className={`${visible ? 'visible' : ''} ${isDragging ? 'dragging' : ''} timeline-marker-scroll`}
		>
			<TimelineEvent entity={entity} trackHeight={trackHeight} selected={selected} />
			{ghostElement}
		</Group>
	)
}
