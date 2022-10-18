import { TextField } from '@mui/material'
import { useDispatch } from 'react-redux'

import { worldSlice } from '../../reducer'
import { StoryEvent } from '../../types'
import { EventEditorContainer } from './styles'

type Props = {
	event: StoryEvent
}

export const EventEditor = ({ event }: Props) => {
	const dispatch = useDispatch()
	const { updateEvent } = worldSlice.actions

	const { name, timestamp, description } = event

	const onNameChange = (value: string) => {
		dispatch(
			updateEvent({
				...event,
				name: value,
			})
		)
	}

	const onTimestampChange = (value: number) => {
		dispatch(
			updateEvent({
				...event,
				timestamp: value,
			})
		)
	}

	const onDescriptionChange = (value: string) => {
		dispatch(
			updateEvent({
				...event,
				description: value,
			})
		)
	}

	return (
		<EventEditorContainer>
			<TextField value={name} onChange={(e) => onNameChange(e.target.value)} variant="filled" />
			<TextField
				value={timestamp}
				onChange={(e) => onTimestampChange(Number(e.target.value))}
				variant="filled"
				type={'number'}
			/>
			<TextField
				value={description}
				onChange={(e) => onDescriptionChange(e.target.value)}
				variant="filled"
				rows={10}
			/>
		</EventEditorContainer>
	)
}
