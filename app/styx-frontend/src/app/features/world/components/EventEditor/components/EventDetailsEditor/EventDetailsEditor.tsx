import { Add, ArrowBack, Delete } from '@mui/icons-material'
import { LoadingButton } from '@mui/lab'
import { Autocomplete, Button, Grid, Stack, TextField, Tooltip, Typography } from '@mui/material'
import { bindTrigger, usePopupState } from 'material-ui-popup-state/hooks'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import { UpdateWorldEventApiArg, useUpdateWorldEventMutation } from '../../../../../../../api/rheaApi'
import { Shortcut, useShortcut } from '../../../../../../../hooks/useShortcut'
import { OverlayingLabel } from '../../../../../../components/OverlayingLabel'
import { arraysEqual } from '../../../../../../utils/arraysEqual'
import { useAutosave } from '../../../../../../utils/autosave/useAutosave'
import { parseApiResponse } from '../../../../../../utils/parseApiResponse'
import { useIsFirstRender } from '../../../../../../utils/useIsFirstRender'
import { TimestampField } from '../../../../../time/components/TimestampField'
import { worldSlice } from '../../../../reducer'
import { useWorldRouter } from '../../../../router'
import { getWorldState } from '../../../../selectors'
import { Actor, WorldEvent, WorldEventModule } from '../../../../types'
import { useAutocompleteActorList } from '../../../ActorSelector/useAutocompleteActorList'
import { useMapActorsToOptions } from '../../../ActorSelector/useMapActorsToOptions'
import { StatementsUnit } from '../../styles'
import { EventIconDropdown } from '../EventIconDropdown/EventIconDropdown'
import { NewEventFieldPopup } from './NewEventFieldPopup'

type Props = {
	event: WorldEvent
}

type SavedEvent = Pick<
	WorldEvent,
	| 'extraFields'
	| 'name'
	| 'icon'
	| 'timestamp'
	| 'revokedAt'
	| 'description'
	| 'targetActors'
	| 'mentionedActors'
>

export const EventDetailsEditor = ({ event }: Props) => {
	const { mapActorsToOptions } = useMapActorsToOptions()

	const [modules, setModules] = useState<WorldEventModule[]>(event.extraFields)
	const [name, setName] = useState<string>(event.name)
	const [icon, setIcon] = useState<string>(event.icon)
	const [timestamp, setTimestamp] = useState<number>(event.timestamp)
	const [revokedAt, setRevokedAt] = useState<number | undefined>(event.revokedAt)
	const [selectedActors, setSelectedActors] = useState<Actor[]>(mapActorsToOptions(event.targetActors))
	const [mentionedActors, setMentionedActors] = useState<Actor[]>(mapActorsToOptions(event.mentionedActors))
	const [description, setDescription] = useState<string>(event.description)

	const { actors } = useSelector(getWorldState)
	const { actorOptions, mentionedActorOptions, renderOption } = useAutocompleteActorList({
		actors,
		selectedActors,
		mentionedActors,
	})

	const savingEnabled = useRef<boolean>(true)
	const lastSaved = useRef<SavedEvent>(event)
	const lastSavedAt = useRef<Date>(new Date(event.updatedAt))

	useEffect(() => {
		if (new Date(event.updatedAt) > lastSavedAt.current) {
			setModules(event.extraFields)
			setName(event.name)
			setIcon(event.icon)
			setTimestamp(event.timestamp)
			setRevokedAt(event.revokedAt)
			setSelectedActors(mapActorsToOptions(event.targetActors))
			setMentionedActors(mapActorsToOptions(event.mentionedActors))
			setDescription(event.description)
			savingEnabled.current = false
		}
	}, [event, mapActorsToOptions])

	const { openDeleteEventModal } = worldSlice.actions
	const dispatch = useDispatch()

	const [updateWorldEvent, { isLoading: isSaving, isError }] = useUpdateWorldEventMutation()

	const { eventEditorParams } = useWorldRouter()
	const { worldId } = eventEditorParams

	const sendUpdate = useCallback(
		async (delta: UpdateWorldEventApiArg['body']) => {
			const { response, error } = parseApiResponse(
				await updateWorldEvent({
					worldId: worldId,
					eventId: event.id,
					body: delta,
				})
			)
			if (error) {
				return
			}
			lastSaved.current = {
				...response,
				timestamp: Number(response.timestamp),
				revokedAt: Number(response.revokedAt),
			}
			lastSavedAt.current = new Date()
		},
		[event.id, updateWorldEvent, worldId]
	)

	const {
		icon: autosaveIcon,
		color: autosaveColor,
		autosave,
		manualSave,
	} = useAutosave({
		onSave: () =>
			sendUpdate({
				modules,
				name,
				icon,
				timestamp: String(timestamp),
				revokedAt: revokedAt ? String(revokedAt) : null,
				description,
				targetActorIds: selectedActors.map((a) => a.id),
				mentionedActorIds: mentionedActors.map((a) => a.id),
			}),
		isSaving,
		isError,
	})

	const { isFirstRender } = useIsFirstRender()
	useEffect(() => {
		if (!savingEnabled.current) {
			savingEnabled.current = true
			return
		}
		if (
			isFirstRender ||
			(arraysEqual(lastSaved.current.extraFields, modules, (a, b) => a === b) &&
				lastSaved.current.name === name &&
				lastSaved.current.icon === icon &&
				lastSaved.current.timestamp === timestamp &&
				lastSaved.current.revokedAt === revokedAt &&
				lastSaved.current.description === description &&
				arraysEqual(lastSaved.current.targetActors, selectedActors, (a, b) => a.id === b.id) &&
				arraysEqual(lastSaved.current.mentionedActors, mentionedActors, (a, b) => a.id === b.id))
		) {
			return
		}

		autosave()
	}, [
		modules,
		name,
		icon,
		timestamp,
		revokedAt,
		description,
		selectedActors,
		mentionedActors,
		sendUpdate,
		isFirstRender,
		autosave,
	])

	const onDelete = useCallback(() => {
		dispatch(openDeleteEventModal(event))
	}, [dispatch, event, openDeleteEventModal])

	const { largeLabel: shortcutLabel } = useShortcut(Shortcut.CtrlEnter, () => {
		manualSave()
	})

	const newModulePopupState = usePopupState({ variant: 'popover', popupId: 'modulePopup' })

	return (
		<>
			<Grid item xs={12} md={6} style={{ maxHeight: '100%' }}>
				<Stack spacing={2} direction="column">
					<TextField
						label="Content"
						value={description}
						onChange={(e) => setDescription(e.target.value)}
						minRows={3}
						maxRows={11}
						multiline
						autoFocus
					/>
					<TimestampField label="Issued at" timestamp={timestamp} onChange={setTimestamp} />
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
			</Grid>
			<Grid item xs={12} md={6} style={{ height: '100%' }}>
				<StatementsUnit>
					<OverlayingLabel>Modules</OverlayingLabel>
					<Stack gap={2} height="100%">
						<Stack
							alignItems="center"
							justifyContent="center"
							height={modules.length === 0 ? '100%' : 'unset'}
							gap={2}
						>
							{modules.length === 0 && (
								<Typography variant="body1" textAlign="center">
									Missing some fields? You can add them here!
								</Typography>
							)}
							<Button
								variant="contained"
								fullWidth={modules.length > 0}
								startIcon={<Add />}
								{...bindTrigger(newModulePopupState)}
							>
								Add field
							</Button>
						</Stack>
						<NewEventFieldPopup popupState={newModulePopupState} modules={modules} onChange={setModules} />
						{modules.includes('CustomName') && (
							<TextField
								type="text"
								label="Custom name"
								value={name}
								onChange={(e) => setName(e.target.value)}
								inputProps={{ maxLength: 256 }}
							/>
						)}
						{modules.includes('RevokedAt') && (
							<TimestampField
								label="Revoked at"
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
								renderOption={renderOption}
								renderInput={(params) => <TextField {...params} label="Actors" />}
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
								renderOption={renderOption}
								renderInput={(params) => <TextField {...params} label="Mentioned actors" />}
							/>
						)}
					</Stack>
				</StatementsUnit>
			</Grid>
		</>
	)
}
