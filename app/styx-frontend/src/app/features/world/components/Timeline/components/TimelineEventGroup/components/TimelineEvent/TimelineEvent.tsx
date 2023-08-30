import { colors } from '@mui/material'
import classNames from 'classnames'
import { memo, MouseEvent, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import { useDoubleClick } from '../../../../../../../../../hooks/useDoubleClick'
import { isMultiselectClick } from '../../../../../../../../utils/isMultiselectClick'
import { useEventIcons } from '../../../../../../hooks/useEventIcons'
import { worldSlice } from '../../../../../../reducer'
import { useWorldRouter } from '../../../../../../router'
import { getWorldState } from '../../../../../../selectors'
import { TimelineEntity } from '../../../../../../types'
import { HoveredTimelineEvents } from './HoveredTimelineEvents'
import { Label, LabelContainer, Marker } from './styles'

type Props = {
	entity: TimelineEntity
	groupIndex: number
	expanded: boolean
	highlighted: boolean
}

export const TimelineEventComponent = ({ entity, groupIndex, expanded, highlighted }: Props) => {
	const [isInfoVisible, setIsInfoVisible] = useState(false)

	const dispatch = useDispatch()
	const { addEventToSelection, removeEventFromSelection, openTimelineContextMenu } = worldSlice.actions

	const { selectedEvents } = useSelector(getWorldState)
	const { eventEditorParams, navigateToEventEditor, navigateToOutliner } = useWorldRouter()
	const { getIconPath } = useEventIcons()

	const { triggerClick } = useDoubleClick<{ multiselect: boolean }>({
		onClick: ({ multiselect }) => {
			if (entity.markerType === 'bundle') {
				navigateToOutliner(entity.events.sort((a, b) => b.timestamp - a.timestamp)[0].timestamp)
				return
			}

			if (selectedEvents.includes(entity.eventId)) {
				dispatch(removeEventFromSelection(entity.eventId))
			} else {
				dispatch(addEventToSelection({ id: entity.eventId, multiselect }))
			}
		},
		onDoubleClick: () => {
			if (entity.markerType === 'bundle') {
				return
			}
			navigateToEventEditor(entity.eventId)
			dispatch(removeEventFromSelection(entity.eventId))
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
			})
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

	const selected = entity.markerType !== 'bundle' && selectedEvents.includes(entity.eventId)

	const labelType =
		entity.markerType === 'issuedAt' ? (
			<b style={{ color: colors.green[500] }}>Issue:</b>
		) : entity.markerType === 'revokedAt' ? (
			<b style={{ color: colors.red[500] }}>Revoke:</b>
		) : entity.markerType === 'deltaState' ? (
			<b style={{ color: colors.yellow[500] }}>Delta:</b>
		) : (
			''
		)

	return (
		<Marker
			onClick={onClick}
			onContextMenu={onContextMenu}
			onMouseEnter={onMouseEnter}
			onMouseLeave={onMouseLeave}
			className={classNames({
				expanded: groupIndex > 0 && expanded,
				selected,
				edited: entity.id === eventEditorParams.eventId,
				highlighted,
				revoked: entity.markerType === 'revokedAt',
				replace: entity.markerType === 'deltaState' || entity.markerType === 'ghostDelta',
				ghostEvent: entity.markerType === 'ghostEvent',
				ghostDelta: entity.markerType === 'ghostDelta',
			})}
			iconPath={getIconPath(entity.icon)}
			data-testid="timeline-event-marker"
		>
			{isInfoVisible && (
				<LabelContainer>
					<Label data-hj-suppress>
						<span>
							{labelType}
							{labelType ? ' ' : ''}
							{entity.name}
						</span>
					</Label>
				</LabelContainer>
			)}
			<div className="icon" />
		</Marker>
	)
}

export const TimelineEvent = memo(TimelineEventComponent)
