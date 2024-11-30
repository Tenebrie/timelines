import { Close } from '@mui/icons-material'
import { colors, Typography } from '@mui/material'
import classNames from 'classnames'
import { memo, MouseEvent, Profiler, useState } from 'react'
import { useDispatch } from 'react-redux'

import { reportComponentProfile } from '@/app/features/profiling/reportComponentProfile'
import { useEventIcons } from '@/app/features/world/hooks/useEventIcons'
import { worldSlice } from '@/app/features/world/reducer'
import { MarkerType, TimelineEntity } from '@/app/features/world/types'
import { useStringColor } from '@/app/utils/getStringColor'
import { isMultiselectClick } from '@/app/utils/isMultiselectClick'
import { useCustomTheme } from '@/hooks/useCustomTheme'
import { useDoubleClick } from '@/hooks/useDoubleClick'
import { useWorldRouter } from '@/router/routes/worldRoutes'

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

	const { navigateToEventEditor, navigateToEventDeltaEditor } = useWorldRouter()
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
				navigateToEventDeltaEditor({
					eventId: entity.eventId,
					deltaId: entity.id,
					selectedTime: entity.markerPosition,
				})
			} else {
				navigateToEventEditor({ eventId: entity.eventId, selectedTime: entity.markerPosition })
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
							<Close sx={{ width: '100%', height: '100%' }} />
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
