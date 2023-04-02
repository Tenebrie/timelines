import { Delete } from '@mui/icons-material'
import { LoadingButton } from '@mui/lab'
import { Button, Stack, TextField } from '@mui/material'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useDispatch } from 'react-redux'

import { useUpdateWorldEventMutation } from '../../../../../../../api/rheaApi'
import { parseApiResponse } from '../../../../../../utils/parseApiResponse'
import { useIsFirstRender } from '../../../../../../utils/useIsFirstRender'
import { worldSlice } from '../../../../reducer'
import { useWorldRouter } from '../../../../router'
import { WorldEvent } from '../../../../types'
import { useAutosave } from './useAutosave'

type Props = {
	event: WorldEvent
}

export const EventDetailsEditor = ({ event }: Props) => {
	const [name, setName] = useState<string>(event.name)
	const [timestamp, setTimestamp] = useState<number>(event.timestamp)
	const [description, setDescription] = useState<string>(event.description)

	const lastSaved = useRef<Pick<WorldEvent, 'name' | 'timestamp' | 'description'>>(event)

	const { openDeleteEventModal } = worldSlice.actions
	const dispatch = useDispatch()

	const [updateWorldEvent, { isLoading: isSaving }] = useUpdateWorldEventMutation()

	const { eventEditorParams } = useWorldRouter()
	const { worldId } = eventEditorParams

	const sendUpdate = useCallback(
		async (delta: Partial<WorldEvent>) => {
			const { response, error } = parseApiResponse(
				await updateWorldEvent({
					worldId: worldId,
					eventId: event.id,
					body: delta,
				})
			)
			if (error) {
				return
			}
			lastSaved.current = response
		},
		[event.id, updateWorldEvent, worldId]
	)

	const {
		icon: autosaveIcon,
		autosave,
		manualSave,
	} = useAutosave({
		onSave: () =>
			sendUpdate({
				name,
				timestamp,
				description,
			}),
		isSaving,
	})

	const { isFirstRender } = useIsFirstRender()
	useEffect(() => {
		if (
			isFirstRender ||
			(lastSaved.current.name === name &&
				lastSaved.current.timestamp === timestamp &&
				lastSaved.current.description === description)
		) {
			return
		}

		autosave()
	}, [name, timestamp, description, sendUpdate, isFirstRender, autosave])

	const onDelete = useCallback(() => {
		dispatch(openDeleteEventModal(event))
	}, [dispatch, event, openDeleteEventModal])

	return (
		<Stack spacing={2} direction="column">
			<TextField label="Name" value={name} onChange={(e) => setName(e.target.value)} disabled />
			<TextField
				label="Timestamp"
				value={timestamp}
				onChange={(e) => setTimestamp(Number(e.target.value))}
				type={'number'}
			/>
			<TextField
				label="Description"
				value={description}
				onChange={(e) => setDescription(e.target.value)}
				minRows={3}
				multiline
			/>
			<Stack spacing={2} direction="row-reverse">
				<LoadingButton
					loading={isSaving}
					variant="outlined"
					onClick={manualSave}
					loadingPosition="start"
					startIcon={autosaveIcon}
				>
					Save
				</LoadingButton>
				<Button variant="outlined" onClick={onDelete} startIcon={<Delete />}>
					Delete
				</Button>
			</Stack>
		</Stack>
	)
}
