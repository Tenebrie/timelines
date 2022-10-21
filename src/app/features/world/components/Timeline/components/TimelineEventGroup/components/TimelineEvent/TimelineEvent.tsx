import { useState } from 'react'

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

	const { navigateToEventEditor } = useWorldRouter()

	const onClick = () => {
		if (event.type === 'bundle') {
			return
		}

		navigateToEventEditor(event)
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
