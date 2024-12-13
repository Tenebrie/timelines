import { ArrowBack, Delete } from '@mui/icons-material'
import { LoadingButton } from '@mui/lab'
import { Button, Grid, Stack, Switch, TextField, Tooltip } from '@mui/material'
import { useCallback, useEffect, useState } from 'react'

import { OutlinedContainer } from '@/app/components/OutlinedContainer'
import { RichTextEditor } from '@/app/features/richTextEditor/RichTextEditor'
import { TimestampField } from '@/app/features/time/components/TimestampField'
import { WorldEvent } from '@/app/features/worldTimeline/types'
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
		description,
		descriptionRich,
		customNameEnabled,
		externalLink,
		setName,
		setTimestamp,
		setIcon,
		setRevokedAt,
		setMentionedActors,
		setDescription,
		setDescriptionRich,
		setCustomNameEnabled,
		setExternalLink,
	} = state

	const [createEventKey, setCreateEventKey] = useState(0)

	const { isCreating, createWorldEvent, createIcon, createIconColor } = useCreateEvent({
		state,
		onCreated: () => {
			if (mode !== 'edit') {
				setName('')
				setDescription('')
				setDescriptionRich('')
				setMentionedActors([])
				setCustomNameEnabled(false)
				setCreateEventKey((prev) => prev + 1)
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

	const onDescriptionChange = useCallback(
		(params: Parameters<Parameters<typeof RichTextEditor>[0]['onChange']>[0]) => {
			setDescription(params.plainText)
			setDescriptionRich(params.richText)
			setMentionedActors(params.mentions)
		},
		[setDescription, setDescriptionRich, setMentionedActors],
	)

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
				<RichTextEditor key={createEventKey} value={descriptionRich} onChange={onDescriptionChange} />
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