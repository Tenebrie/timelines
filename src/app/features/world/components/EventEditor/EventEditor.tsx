import { TextField } from '@mui/material'

import { StoryEvent } from '../../types'
import { EventEditorContainer } from './styles'

type Props = {
	event: StoryEvent
	onUpdate: (event: StoryEvent) => void
}

export const EventEditor = ({ event, onUpdate }: Props) => {
	const { name, timestamp, description } = event

	const onNameChange = (value: string) => {
		onUpdate({
			...event,
			name: value,
		})
	}

	const onTimestampChange = (value: number) => {
		onUpdate({
			...event,
			timestamp: value,
		})
	}

	const onDescriptionChange = (value: string) => {
		onUpdate({
			...event,
			description: value,
		})
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
