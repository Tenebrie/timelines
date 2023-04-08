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

	const {
		eventEditorParams,
		navigateToCurrentWorld: navigateToCurrentWorldRoot,
		navigateToEventEditor,
	} = useWorldRouter()
	const { getIconPath } = useEventIcons()

	const onClick = (clickEvent: MouseEvent<HTMLDivElement>) => {
		clickEvent.stopPropagation()
		clickEvent.preventDefault()

		if (event.type === 'BUNDLE') {
			return
		}

		if (eventEditorParams.eventId === event.id) {
			navigateToCurrentWorldRoot()
		} else {
			navigateToEventEditor(event.id)
		}
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
		>
			{isInfoVisible && (
				<LabelContainer>
					<Label>{event.name}</Label>
				</LabelContainer>
			)}
		</Marker>
	)
}

export const TimelineEvent = memo(TimelineEventComponent)
