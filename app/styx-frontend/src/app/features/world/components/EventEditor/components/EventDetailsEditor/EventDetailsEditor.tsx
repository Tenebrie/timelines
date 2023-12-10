import { ArrowBack, Delete } from '@mui/icons-material'
import { LoadingButton } from '@mui/lab'
import { Autocomplete, Button, Grid, Stack, Switch, TextField, Tooltip } from '@mui/material'
import { useSelector } from 'react-redux'

import { Shortcut, useShortcut } from '../../../../../../../hooks/useShortcut'
import { OverlayingLabel } from '../../../../../../components/OverlayingLabel'
import { TimestampField } from '../../../../../time/components/TimestampField'
import { getWorldState } from '../../../../selectors'
import { WorldEvent } from '../../../../types'
import { useAutocompleteActorList } from '../../../ActorSelector/useAutocompleteActorList'
import { StatementsUnit } from '../../styles'
import { EventIconDropdown } from '../EventIconDropdown/EventIconDropdown'
import { EventModulesControls } from './EventModules/EventModulesControls'
import { useEntityName } from './EventModules/useEntityName'
import { useCreateEvent } from './useCreateEvent'
import { useEditEvent } from './useEditEvent'
import { useEventFields } from './useEventFields'

type Props = {
	event: WorldEvent
	mode: 'create' | 'edit'
}

export const EventDetailsEditor = ({ event, mode }: Props) => {
	const { state } = useEventFields({ event })
	const {
		modules,
		name,
		icon,
		timestamp,
		revokedAt,
		selectedActors,
		mentionedActors,
		description,
		customNameEnabled,
		setName,
		setTimestamp,
		setIcon,
		setRevokedAt,
		setSelectedActors,
		setMentionedActors,
		setDescription,
		setCustomNameEnabled,
	} = state

	const { isCreating, createWorldEvent, createIcon, createIconColor } = useCreateEvent({ state })
	const { isSaving, manualSave, onDelete, autosaveIcon, autosaveColor } = useEditEvent({
		mode,
		event,
		state,
	})

	const { actors } = useSelector(getWorldState)
	const {
		actorOptions,
		mentionedActorOptions,
		renderOption: renderActorOption,
	} = useAutocompleteActorList({
		actors,
		selectedActors,
		mentionedActors,
	})

	const { largeLabel: shortcutLabel } = useShortcut(Shortcut.CtrlEnter, () => {
		if (mode === 'create') {
			createWorldEvent()
		} else {
			manualSave()
		}
	})

	const { name: evaluatedName } = useEntityName({
		textSource: description,
		entityClassName: 'event',
		timestamp: event.timestamp,
		customName: name,
		customNameEnabled,
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
							disabled={!customNameEnabled}
							value={evaluatedName}
							onChange={(e) => setName(e.target.value)}
							inputProps={{ maxLength: 256 }}
							fullWidth
						/>
						<Tooltip title="Use custom event name" arrow placement="top">
							<Button onClick={() => setCustomNameEnabled(!customNameEnabled)}>
								<Stack alignItems="center" justifyContent="center">
									<Switch size="small" checked={customNameEnabled} style={{ pointerEvents: 'none' }} />
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
										onClick={() => createWorldEvent()}
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
			<Grid item xs={12} md={6} style={{ height: '100%' }}>
				<StatementsUnit>
					<OverlayingLabel>Modules</OverlayingLabel>
					<Stack gap={2} height="100%">
						<EventModulesControls modules={modules} state={state} />
						{modules.includes('RevokedAt') && (
							<TimestampField
								label="Retired at"
								timestamp={revokedAt}
								initialTimestamp={timestamp}
								onChange={setRevokedAt}
								clearable
							/>
						)}
						{modules.includes('EventIcon') && (
							<Grid item margin={0} padding={0}>
								<EventIconDropdown icon={icon} onChange={setIcon} />
							</Grid>
						)}
						{modules.includes('TargetActors') && (
							<Autocomplete
								value={selectedActors}
								onChange={(_, value) => setSelectedActors(value)}
								multiple={true}
								options={actorOptions}
								isOptionEqualToValue={(option, value) => option.id === value.id}
								autoHighlight
								renderOption={renderActorOption}
								renderInput={(params) => <TextField {...params} label="Actors" />}
								disableClearable
							/>
						)}
						{modules.includes('MentionedActors') && (
							<Autocomplete
								value={mentionedActors}
								onChange={(_, value) => setMentionedActors(value)}
								multiple={true}
								options={mentionedActorOptions}
								isOptionEqualToValue={(option, value) => option.id === value.id}
								autoHighlight
								renderOption={renderActorOption}
								renderInput={(params) => <TextField {...params} label="Mentioned actors" />}
							/>
						)}
					</Stack>
				</StatementsUnit>
			</Grid>
		</>
	)
}
