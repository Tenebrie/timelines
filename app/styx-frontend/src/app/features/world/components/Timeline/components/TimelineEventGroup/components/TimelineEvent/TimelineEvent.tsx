import { MouseEvent, useState } from 'react'
import { useDispatch } from 'react-redux'

import { worldSlice } from '../../../../../../reducer'
import { useWorldRouter } from '../../../../../../router'
import { WorldEvent, WorldEventBundle } from '../../../../../../types'
import { Label, LabelContainer, Marker } from './styles'

type Props = {
	event: WorldEvent | WorldEventBundle
	groupIndex: number
	expanded: boolean
}

export const TimelineEvent = ({ event, groupIndex, expanded }: Props) => {
	const [isInfoVisible, setIsInfoVisible] = useState(false)

	const { eventEditorParams } = useWorldRouter()

	const dispatch = useDispatch()
	const { hoverEventMarker, unhoverEventMarker } = worldSlice.actions

	const { navigateToCurrentWorld: navigateToCurrentWorldRoot, navigateToEventEditor } = useWorldRouter()

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
				event.id === eventEditorParams.eventId ? 'selected' : ''
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
