import { ArrowBack, Delete } from '@mui/icons-material'
import { LoadingButton } from '@mui/lab'
import { Button, FormControl, InputLabel, Select, Stack, TextField, Tooltip } from '@mui/material'
import { useCallback, useEffect, useRef } from 'react'

import { useUpdateActorMutation } from '@/api/actorListApi'
import { useModal } from '@/app/features/modals/reducer'
import { useActorColors } from '@/app/features/world/hooks/useActorColors'
import { Actor, ActorDetails } from '@/app/features/world/types'
import { useAutosave } from '@/app/utils/autosave/useAutosave'
import { parseApiResponse } from '@/app/utils/parseApiResponse'
import { Shortcut, useShortcut } from '@/hooks/useShortcut'
import { useWorldRouter, worldRoutes } from '@/router/routes/worldRoutes'

import { useActorFields } from './useActorFields'

type Props = {
	actor: ActorDetails
}

export const ActorDetailsEditor = ({ actor }: Props) => {
	const { state } = useActorFields({ actor })

	const { isDirty, name, title, color, description, setDirty, setName, setTitle, setColor, setDescription } =
		state

	const lastSavedAt = useRef<Date>(new Date(actor.updatedAt))

	useEffect(() => {
		if (new Date(actor.updatedAt) > lastSavedAt.current) {
			setName(actor.name, { cleanSet: true })
			setTitle(actor.title, { cleanSet: true })
			setColor(actor.color, { cleanSet: true })
			setDescription(actor.description, { cleanSet: true })

			setDirty(false)
			lastSavedAt.current = new Date(actor.updatedAt)
		}
	}, [actor, setColor, setDescription, setDirty, setName, setTitle])

	const { open: openDeleteActorModal } = useModal('deleteActorModal')

	const [updateActor, { isLoading: isSaving }] = useUpdateActorMutation()

	const { stateOf } = useWorldRouter()
	const { worldId } = stateOf(worldRoutes.eventEditor)

	const sendUpdate = useCallback(
		async (delta: Partial<Actor>) => {
			isDirty.current = false
			const { error } = parseApiResponse(
				await updateActor({
					worldId: worldId,
					actorId: actor.id,
					body: delta,
				}),
			)
			if (error) {
				return
			}
			lastSavedAt.current = new Date()
		},
		[actor.id, isDirty, updateActor, worldId],
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

	useEffect(() => {
		if (isDirty.current) {
			autosave()
		}
	}, [state, autosave, isDirty])

	const onDelete = useCallback(() => {
		openDeleteActorModal({ target: actor })
	}, [actor, openDeleteActorModal])

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
			<Stack direction="row-reverse" justifyContent="space-between">
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
				<Button variant="outlined" onClick={() => window.history.back()} startIcon={<ArrowBack />}>
					Back
				</Button>
			</Stack>
		</Stack>
	)
}
