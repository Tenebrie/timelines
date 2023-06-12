import { memo, MouseEvent, useState } from 'react'

import { useDoubleClick } from '../../../../../../../../../hooks/useDoubleClick'
import { useEventIcons } from '../../../../../../hooks/useEventIcons'
import { useWorldRouter } from '../../../../../../router'
import { WorldEvent, WorldEventBundle } from '../../../../../../types'
import { HoveredTimelineEvents } from './HoveredTimelineEvents'
import { Label, LabelContainer, Marker } from './styles'

type Props = {
	event: WorldEvent | WorldEventBundle
	groupIndex: number
	expanded: boolean
	highlighted: boolean
}

export const TimelineEventComponent = ({ event, groupIndex, expanded, highlighted }: Props) => {
	const [isInfoVisible, setIsInfoVisible] = useState(false)

	const { eventEditorParams, navigateToEventEditor, navigateToOutliner } = useWorldRouter()
	const { getIconPath } = useEventIcons()

	const { triggerClick } = useDoubleClick<void>({
		onClick: () => {
			if (event.type === 'BUNDLE') {
				navigateToOutliner(event.events.sort((a, b) => b.timestamp - a.timestamp)[0].timestamp)
				return
			}

			navigateToOutliner(event.timestamp)
		},
		onDoubleClick: () => navigateToEventEditor(event.id),
	})

	const onClick = (clickEvent: MouseEvent<HTMLDivElement>) => {
		clickEvent.stopPropagation()
		clickEvent.preventDefault()

		triggerClick()
	}

	const onMouseEnter = () => {
		setIsInfoVisible(true)
		HoveredTimelineEvents.hoverEvent(event)
	}

	const onMouseLeave = () => {
		setIsInfoVisible(false)
		HoveredTimelineEvents.unhoverEvent(event)
	}

	const className = `${groupIndex > 0 && expanded ? 'expanded' : ''} ${
		event.id === eventEditorParams.eventId ? 'selected' : ''
	} ${isInfoVisible ? 'elevated' : ''} ${highlighted ? 'highlighted' : ''}`

	return (
		<Marker
			onClick={onClick}
			onMouseEnter={onMouseEnter}
			onMouseLeave={onMouseLeave}
			className={className}
			iconPath={getIconPath(event.icon)}
			data-testid="timeline-event-marker"
		>
			{isInfoVisible && (
				<LabelContainer>
					<Label data-hj-suppress>{event.name}</Label>
				</LabelContainer>
			)}
		</Marker>
	)
}

export const TimelineEvent = memo(TimelineEventComponent)
