import { ArrowBack, Delete } from '@mui/icons-material'
import { LoadingButton } from '@mui/lab'
import { Button, Grid, Stack, TextField, Tooltip } from '@mui/material'

import { Shortcut, useShortcut } from '../../../../../../../hooks/useShortcut'
import { FormErrorBanner } from '../../../../../../components/FormErrorBanner'
import { useDeltaStateEvent } from '../../../../../../utils/useDeltaStateEvent'
import { useErrorState } from '../../../../../../utils/useErrorState'
import { TimestampField } from '../../../../../time/components/TimestampField'
import { WorldEventDelta } from '../../../../types'
import { useEntityName } from '../../components/EventDetailsEditor/EventModules/useEntityName'
import { useCreateEventDelta } from './useCreateEventDelta'
import { useEditEventDelta } from './useEditEventDelta'
import { useEventDeltaFields } from './useEventDeltaFields'

type Props = {
	delta: WorldEventDelta
	mode: 'create' | 'edit'
}

export type EventDeltaDetailsEditorErrors = {
	DELTA_CREATION_FAILED: string
	DELTA_EDITING_FAILED: string
}

export const EventDeltaDetailsEditor = ({ delta, mode }: Props) => {
	const { state } = useEventDeltaFields({ delta })
	const { timestamp, description, setName, setTimestamp, setDescription } = state

	const { errorState } = useErrorState<EventDeltaDetailsEditorErrors>()

	const { isCreating, createDeltaState, createIcon, createIconColor } = useCreateEventDelta({
		state,
		errorState,
	})
	const { isSaving, manualSave, onDelete, autosaveIcon, autosaveColor } = useEditEventDelta({
		mode,
		state,
		deltaState: delta,
		errorState,
	})

	const { largeLabel: shortcutLabel } = useShortcut(Shortcut.CtrlEnter, () => {
		if (mode === 'create') {
			createDeltaState()
		} else {
			manualSave()
		}
	})

	const event = useDeltaStateEvent(delta)

	const name = (() => {
		if (event.customName && delta.name && delta.name.length > 0) {
			return delta.name
		} else if (event.customName) {
			return event.name
		}
		return ''
	})()

	const { name: evaluatedName } = useEntityName({
		textSource: description && description.length > 0 ? description : event.description,
		entityClassName: 'event',
		timestamp: delta.timestamp,
		customName: name,
		customNameEnabled: event.customName,
		onChange: (value) => {
			setName(value)
		},
	})

	return (
		<>
			<Grid item xs={0} md={2} />
			<Grid item xs={12} md={8} style={{ maxHeight: '100%' }}>
				<Stack spacing={2} direction="column">
					<TimestampField label="Issued at" timestamp={timestamp} onChange={setTimestamp} />
					<Stack direction="row" gap={1} width="100%">
						<TextField
							type="text"
							label="Name"
							disabled
							value={evaluatedName}
							onChange={(e) => setName(e.target.value)}
							inputProps={{ maxLength: 256 }}
							fullWidth
						/>
					</Stack>
					<TextField
						label="Content"
						value={description ?? ''}
						placeholder={event.description}
						onChange={(e) => setDescription(e.target.value)}
						minRows={7}
						maxRows={15}
						multiline
						autoFocus
					/>
					<FormErrorBanner errorState={errorState} />
					<Stack direction="row-reverse" justifyContent="space-between">
						{mode === 'create' && (
							<Stack spacing={2} direction="row-reverse">
								<Tooltip title={shortcutLabel} arrow placement="top">
									<span>
										<LoadingButton
											loading={isCreating}
											variant="contained"
											onClick={() => createDeltaState()}
											loadingPosition="start"
											color={createIconColor}
											startIcon={createIcon}
										>
											Create
										</LoadingButton>
									</span>
								</Tooltip>
								<Button variant="outlined" onClick={onDelete} startIcon={<Delete />}>
									Copy source text
								</Button>
							</Stack>
						)}
						{mode === 'edit' && (
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
						)}
						<Button variant="outlined" onClick={() => window.history.back()} startIcon={<ArrowBack />}>
							Back
						</Button>
					</Stack>
				</Stack>
			</Grid>
		</>
	)
}
