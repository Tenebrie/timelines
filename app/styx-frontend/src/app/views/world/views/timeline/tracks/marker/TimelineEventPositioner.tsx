import { MarkerType, TimelineEntity } from '@api/types/worldTypes'
import Close from '@mui/icons-material/Close'
import { CSSProperties, memo } from 'react'
import { useSelector } from 'react-redux'

import { useDragDrop } from '@/app/features/dragDrop/hooks/useDragDrop'
import { useEventBusSubscribe } from '@/app/features/eventBus'
import { useEventIcons } from '@/app/features/icons/hooks/useEventIcons'
import { getOverviewPreferences } from '@/app/features/preferences/PreferencesSliceSelectors'
import { useCustomTheme } from '@/app/features/theming/hooks/useCustomTheme'
import { useTimelineWorldTime } from '@/app/features/time/hooks/useTimelineWorldTime'
import { LineSpacing } from '@/app/utils/constants'
import { TimelineState } from '@/app/views/world/views/timeline/utils/TimelineState'

import { TimelineEventHeightPx } from '../../hooks/useEventTracks'
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
	const { panelOpen } = useSelector(getOverviewPreferences)

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
			const scroll = TimelineState.scroll - (panelOpen ? 0 : 8)
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
	const position =
		realTimeToScaledTime(Math.floor(entity.markerPosition)) +
		TimelineState.scroll -
		TimelineEventHeightPx / 2 +
		1

	useEventBusSubscribe({
		event: 'timeline/onScroll',
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
