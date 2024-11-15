import { colors, Typography } from '@mui/material'
import classNames from 'classnames'
import { memo, MouseEvent, useState } from 'react'
import { useDispatch } from 'react-redux'

import { useDoubleClick } from '../../../../../../../../../hooks/useDoubleClick'
import { useWorldRouter } from '../../../../../../../../../router/routes/worldRoutes'
import { useStringColor } from '../../../../../../../../utils/getStringColor'
import { isMultiselectClick } from '../../../../../../../../utils/isMultiselectClick'
import { useEventIcons } from '../../../../../../hooks/useEventIcons'
import { useTimelineBusDispatch } from '../../../../../../hooks/useTimelineBus'
import { worldSlice } from '../../../../../../reducer'
import { MarkerType, TimelineEntity } from '../../../../../../types'
import { TimelineEventHeightPx } from '../../hooks/useEventTracks'
import { HoveredTimelineEvents } from './HoveredTimelineEvents'
import { Label, LabelContainer, Marker } from './styles'

type Props = {
	entity: TimelineEntity<MarkerType>
	edited: boolean
	selected: boolean
	trackHeight: number
}

export const TimelineEventComponent = ({ entity, edited, selected, trackHeight }: Props) => {
	const [isInfoVisible, setIsInfoVisible] = useState(false)

	const scrollTimelineTo = useTimelineBusDispatch()
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

			dispatch(removeTimelineMarkerFromSelection(entity.key))

			if (entity.markerType === 'deltaState') {
				navigateToEventDeltaEditor({
					eventId: entity.eventId,
					deltaId: entity.id,
				})
			} else {
				navigateToEventEditor(entity.eventId)
			}
			scrollTimelineTo(entity.markerPosition)
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

	const { getStringColor } = useStringColor()
	const color = getStringColor(entity.eventId)

	return (
		<Marker
			onClick={onClick}
			onContextMenu={onContextMenu}
			onMouseEnter={onMouseEnter}
			onMouseLeave={onMouseLeave}
			$size={TimelineEventHeightPx - 6}
			$borderColor={color}
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
			<div className="icon"></div>
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
	)
}

export const TimelineEvent = memo(TimelineEventComponent)
