import { Button, TextField } from '@mui/material'
import React, { useContext, useState } from 'react'
import styled from 'styled-components'

import { GlobalContext } from '../../context/GlobalContext'

const SidebarContainer = styled.div`
	padding: 8px;
	background: rgba(200, 200, 255, 1);
	gap: 8px;
	display: flex;
`

export const Sidebar = () => {
	const [name, setName] = useState('')
	const [timestamp, setTimestamp] = useState(0)

	const { addStoryEvent } = useContext(GlobalContext)

	const onAddEvent = () => {
		console.log(name)
		console.log(timestamp)
		addStoryEvent({
			name,
			timestamp,
		})

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
