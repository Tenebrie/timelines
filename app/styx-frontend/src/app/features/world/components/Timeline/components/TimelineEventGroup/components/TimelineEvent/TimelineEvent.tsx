import { MouseEvent, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import { worldSlice } from '../../../../../../reducer'
import { useWorldRouter } from '../../../../../../router'
import { getEventEditorState } from '../../../../../../selectors'
import { StoryEvent, StoryEventBundle } from '../../../../../../types'
import { Label, LabelContainer, Marker } from './styles'

type Props = {
	event: StoryEvent | StoryEventBundle
	groupIndex: number
	expanded: boolean
}

export const TimelineEvent = ({ event, groupIndex, expanded }: Props) => {
	const [isInfoVisible, setIsInfoVisible] = useState(false)

	const { eventId: editorEventId } = useSelector(getEventEditorState)

	const dispatch = useDispatch()
	const { hoverEventMarker, unhoverEventMarker } = worldSlice.actions

	const { navigateToCurrentWorld: navigateToCurrentWorldRoot, navigateToEventEditor } = useWorldRouter()

	const onClick = (clickEvent: MouseEvent<HTMLDivElement>) => {
		clickEvent.stopPropagation()
		clickEvent.preventDefault()

		if (event.type === 'bundle') {
			return
		}

		if (editorEventId === event.id) {
			navigateToCurrentWorldRoot()
		} else {
			navigateToEventEditor(event)
		}
	}

	const onMouseEnter = () => {
		setIsInfoVisible(true)
		dispatch(hoverEventMarker(event))
	}

	const onMouseLeave = () => {
		setIsInfoVisible(false)
		dispatch(unhoverEventMarker(event))
	}

	return (
		<Marker
			onClick={onClick}
			onMouseEnter={onMouseEnter}
			onMouseLeave={onMouseLeave}
			className={`${groupIndex > 0 && expanded ? 'expanded' : ''} ${
				event.id === editorEventId ? 'selected' : ''
			}`}
		>
			{isInfoVisible && (
				<LabelContainer>
					<Label>{event.name}</Label>
				</LabelContainer>
			)}
		</Marker>
	)
}
