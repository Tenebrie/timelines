import ArrowBack from '@mui/icons-material/ArrowBack'
import Delete from '@mui/icons-material/Delete'
import LoadingButton from '@mui/lab/LoadingButton'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Tooltip from '@mui/material/Tooltip'
import { useCallback, useEffect, useRef } from 'react'
import { useSelector } from 'react-redux'

import { useUpdateActorMutation } from '@/api/actorListApi'
import { ColorPicker } from '@/app/components/ColorPicker'
import { OutlinedContainer } from '@/app/components/OutlinedContainer'
import { useModal } from '@/app/features/modals/reducer'
import { getWorldIdState } from '@/app/features/worldTimeline/selectors'
import { Actor, ActorDetails } from '@/app/features/worldTimeline/types'
import { useAutosave } from '@/app/utils/autosave/useAutosave'
import { parseApiResponse } from '@/app/utils/parseApiResponse'
import { Shortcut, useShortcut } from '@/hooks/useShortcut'

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

	const worldId = useSelector(getWorldIdState)

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

	return (
		<OutlinedContainer label="Edit Actor" gap={3}>
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
				<ColorPicker initialValue={actor.color} onChangeHex={(color) => setColor(color)} />
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
		</OutlinedContainer>
	)
}
