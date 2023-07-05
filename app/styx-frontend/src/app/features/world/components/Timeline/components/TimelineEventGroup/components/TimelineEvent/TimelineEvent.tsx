import classNames from 'classnames'
import { memo, MouseEvent, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import { useDoubleClick } from '../../../../../../../../../hooks/useDoubleClick'
import { useEventIcons } from '../../../../../../hooks/useEventIcons'
import { worldSlice } from '../../../../../../reducer'
import { useWorldRouter } from '../../../../../../router'
import { getWorldState } from '../../../../../../selectors'
import { WorldEventGroup } from '../../../../../../types'
import { HoveredTimelineEvents } from './HoveredTimelineEvents'
import { Label, LabelContainer, Marker } from './styles'

type Props = {
	event: WorldEventGroup['events'][number]
	groupIndex: number
	expanded: boolean
	highlighted: boolean
}

export const TimelineEventComponent = ({ event, groupIndex, expanded, highlighted }: Props) => {
	const [isInfoVisible, setIsInfoVisible] = useState(false)

	const dispatch = useDispatch()
	const { addEventToSelection, removeEventFromSelection } = worldSlice.actions

	const { selectedEvents } = useSelector(getWorldState)
	const { eventEditorParams, navigateToEventEditor, navigateToOutliner } = useWorldRouter()
	const { getIconPath } = useEventIcons()

	const { triggerClick } = useDoubleClick<{ multiselect: boolean }>({
		onClick: ({ multiselect }) => {
			if (event.markerType === 'bundle') {
				navigateToOutliner(event.events.sort((a, b) => b.timestamp - a.timestamp)[0].timestamp)
				return
			}

			if (selectedEvents.includes(event.id)) {
				dispatch(removeEventFromSelection(event.id))
			} else {
				dispatch(addEventToSelection({ id: event.id, multiselect }))
			}
		},
		onDoubleClick: () => {
			navigateToEventEditor(event.id)
			dispatch(removeEventFromSelection(event.id))
		},
		ignoreDelay: true,
	})

	const onClick = (clickEvent: MouseEvent<HTMLDivElement>) => {
		clickEvent.stopPropagation()
		clickEvent.preventDefault()

		triggerClick(clickEvent, { multiselect: clickEvent.ctrlKey })
	}

	const onMouseEnter = () => {
		setIsInfoVisible(true)
		HoveredTimelineEvents.hoverEvent(event)
	}

	const onMouseLeave = () => {
		setIsInfoVisible(false)
		HoveredTimelineEvents.unhoverEvent(event)
	}

	const selected = selectedEvents.includes(event.id)

	return (
		<Marker
			onClick={onClick}
			onMouseEnter={onMouseEnter}
			onMouseLeave={onMouseLeave}
			className={classNames({
				expanded: groupIndex > 0 && expanded,
				selected,
				edited: event.id === eventEditorParams.eventId,
				highlighted,
				revoked: event.markerType === 'revokedAt',
				ghost: event.markerType === 'ghost',
			})}
			iconPath={getIconPath(event.icon)}
			data-testid="timeline-event-marker"
		>
			{isInfoVisible && (
				<LabelContainer>
					<Label data-hj-suppress>{event.name}</Label>
				</LabelContainer>
			)}
			<div className="icon" />
		</Marker>
	)
}

export const TimelineEvent = memo(TimelineEventComponent)
