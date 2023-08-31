import { ArrowBack, Delete } from '@mui/icons-material'
import { LoadingButton } from '@mui/lab'
import { Button, Grid, Stack, Switch, TextField, Tooltip } from '@mui/material'

import { Shortcut, useShortcut } from '../../../../../../../hooks/useShortcut'
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

export const EventDeltaDetailsEditor = ({ delta, mode }: Props) => {
	const { state } = useEventDeltaFields({ delta })
	const { name, timestamp, description, customName, setName, setTimestamp, setDescription, setCustomName } =
		state

	const { isCreating, createDeltaState, createIcon, createIconColor } = useCreateEventDelta({ state })
	const { isSaving, manualSave, onDelete, autosaveIcon, autosaveColor } = useEditEventDelta({
		mode,
		state,
		deltaState: delta,
	})

	const { largeLabel: shortcutLabel } = useShortcut(Shortcut.CtrlEnter, () => {
		if (mode === 'create') {
			createDeltaState()
		} else {
			manualSave()
		}
	})

	const { name: evaluatedName } = useEntityName({
		textSource: description ?? '',
		entityClassName: 'event',
		timestamp: delta.timestamp,
		customName: name ?? '',
		customNameEnabled: customName ?? false,
		onChange: (value) => {
			setName(value)
		},
	})

	return (
		<>
			<Grid item xs={12} md={6} style={{ maxHeight: '100%' }}>
				<Stack spacing={2} direction="column">
					<TimestampField label="Issued at" timestamp={timestamp} onChange={setTimestamp} />
					<Stack direction="row" gap={1} width="100%">
						<TextField
							type="text"
							label="Name"
							disabled={!customName}
							value={evaluatedName}
							onChange={(e) => setName(e.target.value)}
							inputProps={{ maxLength: 256 }}
							fullWidth
						/>
						<Tooltip title="Use custom event name" arrow placement="top">
							<Button onClick={() => setCustomName(!customName)}>
								<Stack alignItems="center" justifyContent="center">
									<Switch size="small" checked={customName} style={{ pointerEvents: 'none' }} />
								</Stack>
							</Button>
						</Tooltip>
					</Stack>
					<TextField
						label="Content"
						value={description}
						onChange={(e) => setDescription(e.target.value)}
						minRows={7}
						maxRows={15}
						multiline
						autoFocus
					/>
					<Stack direction="row-reverse" justifyContent="space-between">
						{mode === 'create' && (
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
