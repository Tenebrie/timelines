import { ArrowBack, Delete } from '@mui/icons-material'
import { LoadingButton } from '@mui/lab'
import { Autocomplete, Button, Grid, Stack, Switch, TextField, Tooltip } from '@mui/material'
import { useEffect } from 'react'
import { useSelector } from 'react-redux'

import { OutlinedContainer } from '@/app/components/OutlinedContainer'
import { TimestampField } from '@/app/features/time/components/TimestampField'
import { useAutocompleteActorList } from '@/app/features/world/components/ActorSelector/useAutocompleteActorList'
import { getWorldState } from '@/app/features/world/selectors'
import { WorldEvent } from '@/app/features/world/types'
import { Shortcut, useShortcut } from '@/hooks/useShortcut'

import { EventIconDropdown } from '../EventIconDropdown/EventIconDropdown'
import { EventModulesControls } from './controls/EventModulesControls'
import { useEntityName } from './hooks/useEntityName'
import { ExternalLinkModule } from './modules/ExternalLinkModule'
import { useCreateEvent } from './useCreateEvent'
import { useEditEvent } from './useEditEvent'
import { useEventFields } from './useEventFields'

type Props = {
	event: WorldEvent
	mode: 'create' | 'create-compact' | 'edit'
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
		externalLink,
		setName,
		setTimestamp,
		setIcon,
		setRevokedAt,
		setSelectedActors,
		setMentionedActors,
		setDescription,
		setCustomNameEnabled,
		setExternalLink,
	} = state

	const { isCreating, createWorldEvent, createIcon, createIconColor } = useCreateEvent({
		state,
		onCreated: () => {
			if (mode !== 'edit') {
				setName('')
				setDescription('')
				setCustomNameEnabled(false)
			}
		},
	})
	const { isSaving, manualSave, onDelete, autosaveIcon, autosaveColor } = useEditEvent({
		mode,
		event,
		state,
	})

	useEffect(() => {
		setTimestamp(event.timestamp, { cleanSet: true })
	}, [event, setTimestamp])

	const { actors } = useSelector(getWorldState, (a, b) => a.actors === b.actors)
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
		if (mode !== 'edit') {
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
			setName(value, { cleanSet: true })
		},
	})

	const leftColumn = (
		<OutlinedContainer label={mode === 'edit' ? 'Edit Event' : 'Create Event'} gap={3}>
			<Stack spacing={2} direction="column">
				<TimestampField label="Started at" timestamp={timestamp} onChange={setTimestamp} />
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
					{mode !== 'edit' && (
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
					{mode !== 'create-compact' && (
						<Button variant="outlined" onClick={() => window.history.back()} startIcon={<ArrowBack />}>
							Back
						</Button>
					)}
				</Stack>
			</Stack>
		</OutlinedContainer>
	)

	return (
		<>
			{mode === 'create-compact' && <>{leftColumn}</>}
			{mode !== 'create-compact' && (
				<Grid item xs={12} md={6} style={{ maxHeight: '100%' }}>
					{leftColumn}
				</Grid>
			)}
			{mode !== 'create-compact' && (
				<Grid item xs={12} md={6} style={{ height: '100%' }}>
					<OutlinedContainer label="Modules" gap={2}>
						<Stack gap={2} height="100%">
							<EventModulesControls modules={modules} state={state} />
							<TimestampField
								label="Resolved at"
								timestamp={revokedAt}
								initialTimestamp={timestamp}
								onChange={setRevokedAt}
								clearable
							/>
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
							{modules.includes('ExternalLink') && (
								<ExternalLinkModule externalLink={externalLink} onChange={setExternalLink} />
							)}
						</Stack>
					</OutlinedContainer>
				</Grid>
			)}
		</>
	)
}
