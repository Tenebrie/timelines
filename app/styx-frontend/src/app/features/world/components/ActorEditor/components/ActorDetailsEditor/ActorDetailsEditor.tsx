import { Delete } from '@mui/icons-material'
import { LoadingButton } from '@mui/lab'
import { Button, FormControl, InputLabel, Select, Stack, TextField, Tooltip } from '@mui/material'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useDispatch } from 'react-redux'

import { useUpdateActorMutation } from '../../../../../../../api/rheaApi'
import { Shortcut, useShortcut } from '../../../../../../../hooks/useShortcut'
import { useAutosave } from '../../../../../../utils/autosave/useAutosave'
import { parseApiResponse } from '../../../../../../utils/parseApiResponse'
import { useIsFirstRender } from '../../../../../../utils/useIsFirstRender'
import { useActorColors } from '../../../../hooks/useActorColors'
import { worldSlice } from '../../../../reducer'
import { useWorldRouter } from '../../../../router'
import { Actor, ActorDetails } from '../../../../types'

type Props = {
	actor: ActorDetails
}

export const ActorDetailsEditor = ({ actor }: Props) => {
	const [name, setName] = useState<string>(actor.name)
	const [title, setTitle] = useState<string>(actor.title)
	const [color, setColor] = useState<string>(actor.color)
	const [description, setDescription] = useState<string>(actor.description)

	const savingEnabled = useRef<boolean>(true)
	const lastSaved = useRef<Actor>(actor)
	const lastSavedAt = useRef<Date>(new Date(actor.updatedAt))

	useEffect(() => {
		if (new Date(actor.updatedAt) > lastSavedAt.current) {
			setName(actor.name)
			setTitle(actor.title)
			setDescription(actor.description)
			savingEnabled.current = false
		}
	}, [actor])

	const { openDeleteActorModal } = worldSlice.actions
	const dispatch = useDispatch()

	const [updateActor, { isLoading: isSaving }] = useUpdateActorMutation()

	const { eventEditorParams } = useWorldRouter()
	const { worldId } = eventEditorParams

	const sendUpdate = useCallback(
		async (delta: Partial<Actor>) => {
			const { response, error } = parseApiResponse(
				await updateActor({
					worldId: worldId,
					actorId: actor.id,
					body: delta,
				})
			)
			if (error) {
				return
			}
			lastSaved.current = response
			lastSavedAt.current = new Date()
		},
		[actor.id, updateActor, worldId]
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
				title,
				color,
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
				lastSaved.current.title === title &&
				lastSaved.current.color === color &&
				lastSaved.current.description === description)
		) {
			return
		}

		autosave()
	}, [name, title, color, description, sendUpdate, isFirstRender, autosave])

	const onDelete = useCallback(() => {
		dispatch(openDeleteActorModal(actor))
	}, [dispatch, actor, openDeleteActorModal])

	const { largeLabel: shortcutLabel } = useShortcut(Shortcut.CtrlEnter, () => {
		manualSave()
	})

	const { getColorOptions, renderOption, renderValue } = useActorColors()

	return (
		<Stack spacing={2} direction="column">
			<TextField
				type="text"
				label="Name"
				value={name}
				onChange={(e) => setName(e.target.value)}
				inputProps={{ maxLength: 256 }}
			/>
			<TextField
				type="text"
				label="Title"
				value={title}
				onChange={(e) => setTitle(e.target.value)}
				inputProps={{ maxLength: 256 }}
			/>
			<FormControl fullWidth>
				<InputLabel id="actorColorSelectLabel">Color</InputLabel>
				<Select
					MenuProps={{ PaperProps: { sx: { maxHeight: 700 } } }}
					labelId="actorColorSelectLabel"
					value={color}
					onChange={(event) => setColor(event.target.value)}
					label="Color"
					renderValue={renderValue}
				>
					{getColorOptions().map((option) => renderOption(option))}
				</Select>
			</FormControl>
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
