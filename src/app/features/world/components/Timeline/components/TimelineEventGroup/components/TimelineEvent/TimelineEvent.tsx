import { useState } from 'react'
import { useDispatch } from 'react-redux'

import { worldSlice } from '../../../../../../reducer'
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
	const { setEditorEvent } = worldSlice.actions

	const onClick = () => {
		if (event.type === 'bundle') {
			return
		}

		dispatch(setEditorEvent(event))
	}

	const onMouseEnter = () => {
		setIsInfoVisible(true)
	}

	const onMouseLeave = () => {
		setIsInfoVisible(false)
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
