import { Button, TextField } from '@mui/material'
import React, { useState } from 'react'
import { useDispatch } from 'react-redux'

import { makeStoryEvent } from '../../../world/creators'
import { worldSlice } from '../../../world/reducer'
import { SidebarContainer } from './styles'

export const Sidebar = () => {
	const [name, setName] = useState('')
	const [timestamp, setTimestamp] = useState(0)

	const dispatch = useDispatch()
	const { createWorldEvent: createEvent } = worldSlice.actions

	const onAddEvent = () => {
		dispatch(
			createEvent(
				makeStoryEvent({
					name,
					timestamp,
				})
			)
		)

		setName('')
		setTimestamp(0)
	}

	return (
		<SidebarContainer>
			<TextField
				value={name}
				onChange={(event) => setName(event.target.value)}
				variant="filled"
				placeholder="Event name"
			></TextField>
			<TextField
				value={timestamp}
				onChange={(event) => setTimestamp(Number(event.target.value))}
				variant="filled"
				placeholder="Timestamp"
				type={'number'}
			></TextField>
			<Button variant="contained" onClick={onAddEvent}>
				Add event
			</Button>
		</SidebarContainer>
	)
}
