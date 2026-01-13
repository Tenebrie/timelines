import { MarkerType, TimelineEntity } from '@api/types/worldTypes'
import Close from '@mui/icons-material/Close'
import { CSSProperties, memo, useCallback } from 'react'

import { useDragDrop } from '@/app/features/dragDrop/hooks/useDragDrop'
import { useEventBusSubscribe } from '@/app/features/eventBus'
import { useEventIcons } from '@/app/features/icons/hooks/useEventIcons'
import { useCustomTheme } from '@/app/features/theming/hooks/useCustomTheme'
import { useTimelineWorldTime } from '@/app/features/time/hooks/useTimelineWorldTime'
import { LineSpacing } from '@/app/utils/constants'
import { TimelineState } from '@/app/views/world/views/timeline/utils/TimelineState'

import { TimelineEventHeightPx } from '../../hooks/useEventTracks'
import { CONTROLLED_SCROLLER_SIZE, EVENT_SCROLL_RESET_PERIOD } from '../components/ControlledScroller'
import { Group } from '../styles'
import { Marker, MarkerIcon } from './styles'
import { TimelineEvent } from './TimelineEvent'

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
			const scroll = TimelineState.scroll - 8
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
						left: 'calc(50% - 1px)',
						overflow: 'hidden',
					}}
				></div>
				<Marker $theme={theme} style={cssVariables}>
					<MarkerIcon className="icon image"></MarkerIcon>
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
		(scroll: number) => {
			const pos = realTimeToScaledTime(Math.floor(entity.markerPosition))
			return (
				pos +
				Math.floor(scroll / EVENT_SCROLL_RESET_PERIOD) * EVENT_SCROLL_RESET_PERIOD +
				CONTROLLED_SCROLLER_SIZE -
				TimelineEventHeightPx / 2 +
				1
			)
		},
		[entity.markerPosition, realTimeToScaledTime],
	)
	const position = calculatePosition(TimelineState.scroll)

	useEventBusSubscribe['timeline/onScroll']({
		callback: (newScroll) => {
			const fixedPos = calculatePosition(newScroll)
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
			<TimelineEvent entity={entity} trackHeight={trackHeight} selected={selected} />
			{ghostElement}
		</Group>
	)
}
