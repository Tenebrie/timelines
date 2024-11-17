import { ArrowBack, Delete } from '@mui/icons-material'
import { LoadingButton } from '@mui/lab'
import { Button, Grid, Stack, TextField, Tooltip } from '@mui/material'
import { useCallback } from 'react'

import { FormErrorBanner } from '@/app/components/FormErrorBanner'
import { OutlinedContainer } from '@/app/components/OutlinedContainer'
import { TimestampField } from '@/app/features/time/components/TimestampField'
import { WorldEventDelta } from '@/app/features/world/types'
import { applyEventDelta } from '@/app/utils/applyEventDelta'
import { useDeltaStateEvent } from '@/app/utils/useDeltaStateEvent'
import { useErrorState } from '@/app/utils/useErrorState'
import { Shortcut, useShortcut } from '@/hooks/useShortcut'

import { useEntityName } from '../../components/EventDetailsEditor/EventModules/useEntityName'
import { useCreateEventDelta } from './useCreateEventDelta'
import { useEditEventDelta } from './useEditEventDelta'
import { useEventDeltaFields } from './useEventDeltaFields'

type Props = {
	delta: WorldEventDelta
	mode: 'create' | 'edit'
}

export type EventDeltaDetailsEditorErrors = {
	CONTENT_EMPTY: string
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

	const event = applyEventDelta({ event: useDeltaStateEvent(delta), timestamp: delta.timestamp - 1 })

	const onCopySource = useCallback(() => {
		setDescription(event.description)
	}, [event.description, setDescription])

	const { largeLabel: shortcutLabel } = useShortcut(Shortcut.CtrlEnter, () => {
		if (mode === 'create') {
			createDeltaState()
		} else {
			manualSave()
		}
	})

	const name = (() => {
		if (event.customName) {
			return event.name
		} else if (delta.name && delta.name.length > 0) {
			return delta.name
		}
		return ''
	})()

	const { name: evaluatedName } = useEntityName({
		textSource: description && description.length > 0 ? description : event.description,
		entityClassName: 'data point',
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
				<OutlinedContainer label={mode === 'create' ? 'Create Data Point' : 'Edit Data Point'} gap={3}>
					<Stack spacing={2} direction="column">
						<TimestampField label="Started at" timestamp={timestamp} onChange={setTimestamp} />
						<Stack direction="row" gap={1} width="100%">
							<TextField
								type="text"
								label="Name"
								disabled
								value={evaluatedName}
								inputProps={{ maxLength: 256 }}
								fullWidth
							/>
						</Stack>
						<TextField
							label="Content"
							value={description ?? ''}
							placeholder={event.description}
							onChange={(e) => setDescription(e.target.value ?? null)}
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
									<Button variant="outlined" onClick={onCopySource} startIcon={<Delete />}>
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
				</OutlinedContainer>
			</Grid>
		</>
	)
}
