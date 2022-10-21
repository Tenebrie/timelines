import { TextField } from '@mui/material'
import { useDispatch, useSelector } from 'react-redux'

import { worldSlice } from '../../reducer'
import { useWorldRouter } from '../../router'
import { getEventEditorState } from '../../selectors'
import { StoryEvent } from '../../types'
import { EventEditorContainer } from './styles'

export const EventEditor = () => {
	const { event } = useSelector(getEventEditorState)

	const dispatch = useDispatch()
	const { setEditorEvent, flushEditorEvent } = worldSlice.actions

	const { navigateToRoot } = useWorldRouter()

	if (!event) {
		navigateToRoot()
		return <></>
	}

	const { name, timestamp, description } = event

	const updateEvent = (delta: Partial<StoryEvent>) => {
		dispatch(
			setEditorEvent({
				...event,
				...delta,
			})
		)
	}

	const onNameChange = (value: string) => updateEvent({ name: value })
	const onTimestampChange = (value: number) => updateEvent({ timestamp: value })
	const onDescriptionChange = (value: string) => updateEvent({ description: value })

	const onSave = () => {
		dispatch(flushEditorEvent())
		navigateToRoot()
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
			<button onClick={onSave}>Save</button>
		</EventEditorContainer>
	)
}
