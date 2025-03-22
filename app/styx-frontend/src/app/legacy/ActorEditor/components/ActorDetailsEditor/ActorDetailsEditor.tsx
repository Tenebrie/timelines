import { ActorDetails } from '@api/types/worldTypes'
import ArrowBack from '@mui/icons-material/ArrowBack'
import Delete from '@mui/icons-material/Delete'
import LoadingButton from '@mui/lab/LoadingButton'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Tooltip from '@mui/material/Tooltip'
import { useCallback, useState } from 'react'

import { ColorPicker } from '@/app/components/ColorPicker/ColorPicker'
import { OutlinedContainer } from '@/app/components/OutlinedContainer'
import { useEventBusSubscribe } from '@/app/features/eventBus'
import { RichTextEditorSummoner } from '@/app/features/richTextEditor/portals/RichTextEditorPortal'
import { RichTextEditor } from '@/app/features/richTextEditor/RichTextEditor'
import { Shortcut, useShortcut } from '@/app/hooks/useShortcut/useShortcut'

import { useActorFields } from './useActorFields'
import { useEditActor } from './useEditActor'

type Props = {
	actor: ActorDetails
}

export const ActorDetailsEditor = ({ actor }: Props) => {
	const { state } = useActorFields({ actor })

	const {
		name,
		title,
		descriptionRich,
		setName,
		setTitle,
		setColor,
		setMentions,
		setDescription,
		setDescriptionRich,
		loadActor,
	} = state

	const [descriptionKey, setDescriptionKey] = useState(0)

	const { isSaving, manualSave, onDelete, autosaveIcon, autosaveColor } = useEditActor({
		actor,
		state,
	})

	useEventBusSubscribe({
		event: 'richEditor/forceUpdateActor',
		condition: (data) => actor.id === data.actor.id,
		callback: (data) => {
			loadActor(data.actor)
			setDescriptionKey((prev) => prev + 1)
		},
	})

	const onDescriptionChange = useCallback(
		(params: Parameters<Parameters<typeof RichTextEditor>[0]['onChange']>[0]) => {
			setDescription(params.plainText)
			setDescriptionRich(params.richText)
			setMentions(params.mentions)
		},
		[setDescription, setDescriptionRich, setMentions],
	)

	const { largeLabel: shortcutLabel } = useShortcut(Shortcut.CtrlEnter, () => {
		manualSave()
	})

	return (
		<OutlinedContainer label="Edit Actor" gap={3}>
			<Stack spacing={2} direction="column">
				<Stack direction="row" gap={2}>
					<TextField
						fullWidth
						type="text"
						label="Name"
						value={name}
						onChange={(e) => setName(e.target.value)}
						inputProps={{ maxLength: 256 }}
					/>
					<TextField
						fullWidth
						type="text"
						label="Title"
						value={title}
						onChange={(e) => setTitle(e.target.value)}
						inputProps={{ maxLength: 256 }}
					/>
				</Stack>
				<ColorPicker
					key={descriptionKey}
					initialValue={actor.color}
					onChangeHex={(color) => setColor(color)}
				/>
				<RichTextEditorSummoner
					softKey={`${actor.id}/${descriptionKey}`}
					value={descriptionRich}
					onChange={onDescriptionChange}
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
