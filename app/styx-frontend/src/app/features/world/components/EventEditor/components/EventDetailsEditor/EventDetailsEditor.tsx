import { Delete } from '@mui/icons-material'
import { LoadingButton } from '@mui/lab'
import { Button, Grid, Stack, TextField, Tooltip } from '@mui/material'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useDispatch } from 'react-redux'

import { useUpdateWorldEventMutation } from '../../../../../../../api/rheaApi'
import { Shortcut, useShortcut } from '../../../../../../../hooks/useShortcut'
import { useAutosave } from '../../../../../../utils/autosave/useAutosave'
import { parseApiResponse } from '../../../../../../utils/parseApiResponse'
import { useIsFirstRender } from '../../../../../../utils/useIsFirstRender'
import { TimestampField } from '../../../../../time/components/TimestampField'
import { worldSlice } from '../../../../reducer'
import { useWorldRouter } from '../../../../router'
import { WorldEvent } from '../../../../types'
import { EventIconDropdown } from '../EventIconDropdown/EventIconDropdown'

type Props = {
	event: WorldEvent
}

export const EventDetailsEditor = ({ event }: Props) => {
	const [name, setName] = useState<string>(event.name)
	const [icon, setIcon] = useState<string>(event.icon)
	const [timestamp, setTimestamp] = useState<number>(event.timestamp)
	const [description, setDescription] = useState<string>(event.description)

	const savingEnabled = useRef<boolean>(true)
	const lastSaved = useRef<Pick<WorldEvent, 'name' | 'icon' | 'timestamp' | 'description'>>(event)
	const lastSavedAt = useRef<Date>(new Date(event.updatedAt))

	useEffect(() => {
		if (new Date(event.updatedAt) > lastSavedAt.current) {
			setName(event.name)
			setIcon(event.icon)
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
			lastSaved.current = {
				...response,
				timestamp: Number(response.timestamp),
			}
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
				icon,
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
				lastSaved.current.icon === icon &&
				lastSaved.current.timestamp === timestamp &&
				lastSaved.current.description === description)
		) {
			return
		}

		autosave()
	}, [name, icon, timestamp, description, sendUpdate, isFirstRender, autosave])

	const onDelete = useCallback(() => {
		dispatch(openDeleteEventModal(event))
	}, [dispatch, event, openDeleteEventModal])

	const { largeLabel: shortcutLabel } = useShortcut(Shortcut.CtrlEnter, () => {
		manualSave()
	})

	return (
		<Stack spacing={2} direction="column">
			<TextField
				type="text"
				label="Name"
				value={name}
				onChange={(e) => setName(e.target.value)}
				inputProps={{ maxLength: 256 }}
			/>
			<Grid container direction="row" gap={2}>
				<Grid item margin={0} padding={0} flexGrow={1}>
					<TimestampField timestamp={timestamp} onChange={setTimestamp} />
				</Grid>
				<Grid item margin={0} padding={0}>
					<EventIconDropdown icon={icon} onChange={setIcon} />
				</Grid>
			</Grid>
			<TextField
				label="Description"
				value={description}
				onChange={(e) => setDescription(e.target.value)}
				minRows={3}
				maxRows={11}
				multiline
			/>
			<Stack spacing={2} direction="row-reverse">
				<Tooltip title={shortcutLabel} arrow placement="top">
					<span>
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
					</span>
				</Tooltip>
				<Button variant="outlined" onClick={onDelete} startIcon={<Delete />}>
					Delete
				</Button>
			</Stack>
		</Stack>
	)
}
