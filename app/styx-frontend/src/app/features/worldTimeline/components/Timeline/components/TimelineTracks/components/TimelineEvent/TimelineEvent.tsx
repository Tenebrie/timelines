import Close from '@mui/icons-material/Close'
import { colors } from '@mui/material'
import Typography from '@mui/material/Typography'
import { useNavigate } from '@tanstack/react-router'
import classNames from 'classnames'
import { memo, MouseEvent, Profiler, useState } from 'react'
import { useDispatch } from 'react-redux'

import { reportComponentProfile } from '@/app/features/profiling/reportComponentProfile'
import { worldSlice } from '@/app/features/world/reducer'
import { useEventIcons } from '@/app/features/worldTimeline/hooks/useEventIcons'
import { MarkerType, TimelineEntity } from '@/app/features/worldTimeline/types'
import { useCustomTheme } from '@/app/hooks/useCustomTheme'
import { useDoubleClick } from '@/app/hooks/useDoubleClick'
import { useStringColor } from '@/app/utils/getStringColor'
import { isMultiselectClick } from '@/app/utils/isMultiselectClick'

import { TimelineEventHeightPx } from '../../hooks/useEventTracks'
import { HoveredTimelineEvents } from './HoveredTimelineEvents'
import { Label, LabelContainer, Marker } from './styles'

type Props = {
	entity: TimelineEntity<MarkerType>
	edited: boolean
	selected: boolean
	trackHeight: number
}

export const TimelineEventComponent = ({ entity, edited, selected }: Props) => {
	const [isInfoVisible, setIsInfoVisible] = useState(false)

	const dispatch = useDispatch()
	const { addTimelineMarkerToSelection, removeTimelineMarkerFromSelection, openTimelineContextMenu } =
		worldSlice.actions

	const navigate = useNavigate({ from: '/world/$worldId' })
	const { getIconPath } = useEventIcons()

	const { triggerClick } = useDoubleClick<{ multiselect: boolean }>({
		onClick: ({ multiselect }) => {
			if (selected) {
				dispatch(removeTimelineMarkerFromSelection(entity.key))
			} else {
				dispatch(addTimelineMarkerToSelection({ id: entity.key, multiselect }))
			}
		},
		onDoubleClick: () => {
			if (entity.markerType === 'ghostEvent' || entity.markerType === 'ghostDelta') {
				return
			}

			if (entity.markerType === 'deltaState') {
				navigate({
					to: '/world/$worldId/timeline/event/$eventId/delta/$deltaId',
					params: { eventId: entity.eventId, deltaId: entity.id },
					search: { time: entity.markerPosition },
				})
			} else {
				navigate({
					to: '/world/$worldId/timeline/event/$eventId',
					params: { eventId: entity.eventId },
					search: { time: entity.markerPosition },
				})
			}
		},
		ignoreDelay: true,
	})

	const onClick = (clickEvent: MouseEvent<HTMLDivElement>) => {
		clickEvent.stopPropagation()
		clickEvent.preventDefault()

		triggerClick(clickEvent, { multiselect: isMultiselectClick(clickEvent) })
	}

	const onContextMenu = (clickEvent: MouseEvent<HTMLDivElement>) => {
		clickEvent.stopPropagation()
		clickEvent.preventDefault()

		dispatch(
			openTimelineContextMenu({
				selectedEvent: entity,
				mousePos: {
					x: clickEvent.clientX + 1,
					y: clickEvent.clientY,
				},
				selectedTime: entity.markerPosition,
			}),
		)
	}

	const onMouseEnter = () => {
		setIsInfoVisible(true)
		HoveredTimelineEvents.hoverEvent(entity)
	}

	const onMouseLeave = () => {
		setIsInfoVisible(false)
		HoveredTimelineEvents.unhoverEvent(entity)
	}

	const labelType =
		entity.markerType === 'issuedAt' ? (
			<b style={{ color: colors.green[500] }}>Event:</b>
		) : entity.markerType === 'revokedAt' ? (
			<b style={{ color: colors.red[500] }}>Resolve:</b>
		) : entity.markerType === 'deltaState' ? (
			<b style={{ color: colors.yellow[500] }}>Data Point:</b>
		) : (
			''
		)

	const color = useStringColor(entity.eventId)
	const theme = useCustomTheme()

	return (
		<Profiler id="TimelineEvent" onRender={reportComponentProfile}>
			<Marker
				onClick={onClick}
				onContextMenu={onContextMenu}
				onMouseEnter={onMouseEnter}
				onMouseLeave={onMouseLeave}
				$size={TimelineEventHeightPx - 6}
				$borderColor={color}
				$theme={theme}
				$isDataPoint={entity.markerType === 'deltaState' || entity.markerType === 'ghostDelta'}
				className={classNames({
					selected,
					edited,
					revoked: entity.markerType === 'revokedAt',
					replace: entity.markerType === 'deltaState' || entity.markerType === 'ghostDelta',
					ghostEvent: entity.markerType === 'ghostEvent',
					ghostDelta: entity.markerType === 'ghostDelta',
				})}
				$iconPath={getIconPath(entity.icon)}
				data-testid="timeline-event-marker"
			>
				{entity.markerType !== 'revokedAt' && <div className="icon image"></div>}
				{entity.markerType === 'revokedAt' && (
					<>
						<div className="icon image"></div>
						<div className="icon">
							<Close sx={{ width: 'calc(100% - 2px)', height: 'calc(100% - 2px)' }} />
						</div>
					</>
				)}
				{isInfoVisible && (
					<LabelContainer>
						<Label data-hj-suppress>
							<Typography sx={{ color: 'white' }}>
								{labelType}
								{labelType ? ' ' : ''}
								{entity.name}
							</Typography>
						</Label>
					</LabelContainer>
				)}
			</Marker>
		</Profiler>
	)
}

export const TimelineEvent = memo(TimelineEventComponent)
