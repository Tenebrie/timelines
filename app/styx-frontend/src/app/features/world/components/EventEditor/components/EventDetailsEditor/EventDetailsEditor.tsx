import { Delete } from '@mui/icons-material'
import { LoadingButton } from '@mui/lab'
import { Button, Stack, TextField } from '@mui/material'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useDispatch } from 'react-redux'

import { useUpdateWorldEventMutation } from '../../../../../../../api/rheaApi'
import { useAutosave } from '../../../../../../utils/autosave/useAutosave'
import { parseApiResponse } from '../../../../../../utils/parseApiResponse'
import { useIsFirstRender } from '../../../../../../utils/useIsFirstRender'
import { worldSlice } from '../../../../reducer'
import { useWorldRouter } from '../../../../router'
import { WorldEvent } from '../../../../types'

type Props = {
	event: WorldEvent
}

export const EventDetailsEditor = ({ event }: Props) => {
	const [name, setName] = useState<string>(event.name)
	const [timestamp, setTimestamp] = useState<number>(event.timestamp)
	const [description, setDescription] = useState<string>(event.description)

	const savingEnabled = useRef<boolean>(true)
	const lastSaved = useRef<Pick<WorldEvent, 'name' | 'timestamp' | 'description'>>(event)
	const lastSavedAt = useRef<Date>(new Date(event.updatedAt))

	useEffect(() => {
		if (new Date(event.updatedAt) > lastSavedAt.current) {
			setName(event.name)
			setTimestamp(event.timestamp)
			setDescription(event.description)
			savingEnabled.current = false
		}
	}, [event])

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
			lastSavedAt.current = new Date()
		},
		[event.id, updateWorldEvent, worldId]
	)

	const {
		icon: autosaveIcon,
		color: autosaveColor,
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
		if (!savingEnabled.current) {
			savingEnabled.current = true
			return
		}
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
			<TextField label="Name" value={name} onChange={(e) => setName(e.target.value)} />
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
					color={autosaveColor}
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