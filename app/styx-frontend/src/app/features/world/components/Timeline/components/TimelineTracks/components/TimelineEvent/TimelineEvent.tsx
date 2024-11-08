import { colors, Typography } from '@mui/material'
import classNames from 'classnames'
import { memo, MouseEvent, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import { useDoubleClick } from '../../../../../../../../../hooks/useDoubleClick'
import { useWorldRouter, worldRoutes } from '../../../../../../../../../router/routes/worldRoutes'
import { useStringColor } from '../../../../../../../../utils/getStringColor'
import { isMultiselectClick } from '../../../../../../../../utils/isMultiselectClick'
import { useEventIcons } from '../../../../../../hooks/useEventIcons'
import { worldSlice } from '../../../../../../reducer'
import { getWorldState } from '../../../../../../selectors'
import { MarkerType, TimelineEntity } from '../../../../../../types'
import { HoveredTimelineEvents } from './HoveredTimelineEvents'
import { Label, LabelContainer, Marker } from './styles'

type Props = {
	entity: TimelineEntity<MarkerType>
	highlighted: boolean
}

export const TimelineEventComponent = ({ entity, highlighted }: Props) => {
	const [isInfoVisible, setIsInfoVisible] = useState(false)

	const dispatch = useDispatch()
	const { addEventToSelection, removeEventFromSelection, openTimelineContextMenu } = worldSlice.actions

	const { selectedEvents } = useSelector(getWorldState)
	const { stateOf, navigateToEventEditor, navigateToEventDeltaEditor } = useWorldRouter()
	const { eventId } = stateOf(worldRoutes.eventEditor)
	const { getIconPath } = useEventIcons()

	const { triggerClick } = useDoubleClick<{ multiselect: boolean }>({
		onClick: ({ multiselect }) => {
			if (selectedEvents.includes(entity.eventId)) {
				dispatch(removeEventFromSelection(entity.eventId))
			} else {
				dispatch(addEventToSelection({ id: entity.eventId, multiselect }))
			}
		},
		onDoubleClick: () => {
			if (entity.markerType === 'ghostEvent' || entity.markerType === 'ghostDelta') {
				return
			}

			dispatch(removeEventFromSelection(entity.eventId))

			if (entity.markerType === 'deltaState') {
				navigateToEventDeltaEditor({
					eventId: entity.eventId,
					deltaId: entity.id,
				})
			} else {
				navigateToEventEditor(entity.eventId)
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
				selectedTime: entity.markerType === 'revokedAt' ? (entity.revokedAt as number) : entity.timestamp,
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

	const selected = selectedEvents.includes(entity.eventId)

	const labelType =
		entity.markerType === 'issuedAt' ? (
			<b style={{ color: colors.green[500] }}></b>
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
			$borderColor={color}
			className={classNames({
				selected,
				edited: entity.id === eventId,
				highlighted,
				revoked: entity.markerType === 'revokedAt',
				replace: entity.markerType === 'deltaState' || entity.markerType === 'ghostDelta',
				ghostEvent: entity.markerType === 'ghostEvent',
				ghostDelta: entity.markerType === 'ghostDelta',
			})}
			$iconPath={getIconPath(entity.icon)}
			data-testid="timeline-event-marker"
		>
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
			<div className="icon" />
		</Marker>
	)
}

export const TimelineEvent = memo(TimelineEventComponent)
