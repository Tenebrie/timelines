import { MarkerType, TimelineEntity } from '@api/types/worldTypes'
import { Icon } from '@iconify/react'
import Close from '@mui/icons-material/Close'
import { CSSProperties, memo, useCallback } from 'react'
import { useSelector } from 'react-redux'

import { useDragDrop } from '@/app/features/dragDrop/hooks/useDragDrop'
import { useEventBusSubscribe } from '@/app/features/eventBus'
import { useEventIcons } from '@/app/features/icons/hooks/useEventIcons'
import { useCustomTheme } from '@/app/features/theming/hooks/useCustomTheme'
import { useTimelineWorldTime } from '@/app/features/time/hooks/useTimelineWorldTime'
import { binarySearchForClosest } from '@/app/utils/binarySearchForClosest'
import { TimelineState } from '@/app/views/world/views/timeline/utils/TimelineState'
import { getTimelineState } from '@/app/views/world/WorldSliceSelectors'

import { TimelineEventHeightPx } from '../../hooks/useEventTracks'
import { CONTROLLED_SCROLLER_SIZE, EVENT_SCROLL_RESET_PERIOD } from '../components/ControlledScroller'
import { Group } from '../styles'
import { Marker, MarkerIcon } from './styles'
import { TimelineMarkerBody } from './TimelineMarkerBody'

type Props = {
	entity: TimelineEntity<MarkerType>
	visible: boolean
	selected: boolean
	trackHeight: number
	realTimeToScaledTime: ReturnType<typeof useTimelineWorldTime>['realTimeToScaledTime']
}

export const TimelineMarker = memo(TimelineMarkerComponent)

function TimelineMarkerComponent({ entity, visible, selected, trackHeight, realTimeToScaledTime }: Props) {
	const { getIconPath } = useEventIcons()
	const theme = useCustomTheme()
	const { scaleLevel } = useSelector(getTimelineState, (a, b) => a.scaleLevel === b.scaleLevel)
	const { scaledTimeToRealTime } = useTimelineWorldTime({ scaleLevel })

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
		adjustPosition: (pos, startingPos) => {
			const dx = pos.x - startingPos.x
			const absoluteTimestamp = entity.markerPosition + scaledTimeToRealTime(dx)
			const snappedTimestamp = binarySearchForClosest(TimelineState.anchorTimestamps, absoluteTimestamp)
			return {
				x: startingPos.x + realTimeToScaledTime(snappedTimestamp - entity.markerPosition),
				y: pos.y,
			}
		},
		ghostFactory: () => (
			<>
				<Marker $theme={theme} style={cssVariables}>
					<Icon
						icon={entity.icon === 'default' ? 'mdi:leaf' : entity.icon}
						color="gray"
						style={{
							position: 'absolute',
							top: '0px',
							left: '0px',
							width: '100%',
							height: '100%',
							pointerEvents: 'none',
						}}
					/>
					{entity.markerType === 'revokedAt' && (
						<MarkerIcon className="icon">
							<Close sx={{ width: 'calc(100% - 2px)', height: 'calc(100% - 2px)' }} />
						</MarkerIcon>
					)}
				</Marker>
			</>
		),
	})

	const calculatePosition = useCallback(
		(scroll: number, markerPosition: number) => {
			const pos = realTimeToScaledTime(Math.floor(markerPosition))
			return (
				pos +
				Math.floor(scroll / EVENT_SCROLL_RESET_PERIOD) * EVENT_SCROLL_RESET_PERIOD +
				CONTROLLED_SCROLLER_SIZE -
				TimelineEventHeightPx / 2 +
				1
			)
		},
		[realTimeToScaledTime],
	)
	const position = calculatePosition(TimelineState.scroll, entity.markerPosition)

	useEventBusSubscribe['timeline/onScroll']({
		callback: (newScroll) => {
			const fixedPos = calculatePosition(newScroll, entity.markerPosition)
			if (ref.current && ref.current.style.getPropertyValue('--position') !== `${fixedPos}px`) {
				ref.current.style.setProperty('--position', `${fixedPos}px`)
			}
		},
	})

	const height = TimelineEventHeightPx * entity.markerHeight + 1

	return (
		<Group
			data-testid="TimelineMarker"
			ref={ref}
			style={{ '--position': `${position}px` } as CSSProperties}
			$height={height}
			className={`${visible ? 'visible' : ''} ${isDragging ? 'dragging' : ''} timeline-marker-scroll`}
		>
			<TimelineMarkerBody entity={entity} trackHeight={trackHeight} selected={selected} />
			{ghostElement}
		</Group>
	)
}
