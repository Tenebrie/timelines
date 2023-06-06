import { memo, MouseEvent, useState } from 'react'

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
	const [lastClickTimestamp, setLastClickTimestamp] = useState<number>(0)

	const { eventEditorParams, navigateToEventEditor, navigateToOutliner } = useWorldRouter()
	const { getIconPath } = useEventIcons()

	const onClick = (clickEvent: MouseEvent<HTMLDivElement>) => {
		clickEvent.stopPropagation()
		clickEvent.preventDefault()

		const timestamp = Date.now()
		setLastClickTimestamp(timestamp)

		if (timestamp - lastClickTimestamp <= 500) {
			onDoubleClick()
			return
		}

		if (event.type === 'BUNDLE') {
			navigateToOutliner(event.events.sort((a, b) => b.timestamp - a.timestamp)[0].timestamp)
			return
		}

		navigateToOutliner(event.timestamp)
	}

	const onDoubleClick = () => {
		navigateToEventEditor(event.id)
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
