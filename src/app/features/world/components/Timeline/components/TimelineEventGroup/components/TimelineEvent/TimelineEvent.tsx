import { MouseEvent, useState } from 'react'
import { useDispatch } from 'react-redux'

import { worldSlice } from '../../../../../../reducer'
import { useWorldRouter } from '../../../../../../router'
import { StoryEvent, StoryEventBundle } from '../../../../../../types'
import { Label, LabelContainer, Marker } from './styles'

type Props = {
	event: StoryEvent | StoryEventBundle
	groupIndex: number
	expanded: boolean
}

export const TimelineEvent = ({ event, groupIndex, expanded }: Props) => {
	const [isInfoVisible, setIsInfoVisible] = useState(false)

	const dispatch = useDispatch()
	const { hoverEventMarker, unhoverEventMarker } = worldSlice.actions

	const { navigateToEventEditor } = useWorldRouter()

	const onClick = (clickEvent: MouseEvent<HTMLDivElement>) => {
		if (event.type === 'bundle') {
			return
		}

		clickEvent.stopPropagation()
		clickEvent.preventDefault()
		navigateToEventEditor(event)
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
			className={groupIndex > 0 && expanded ? 'expanded' : ''}
		>
			{isInfoVisible && (
				<LabelContainer>
					<Label>{event.name}</Label>
				</LabelContainer>
			)}
		</Marker>
	)
}
