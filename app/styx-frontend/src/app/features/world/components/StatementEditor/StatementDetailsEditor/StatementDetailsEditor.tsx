import { Delete } from '@mui/icons-material'
import { LoadingButton } from '@mui/lab'
import { Alert, Autocomplete, Button, Collapse, Stack, TextField, Tooltip } from '@mui/material'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { TransitionGroup } from 'react-transition-group'

import { UpdateWorldStatementApiArg, useUpdateWorldStatementMutation } from '../../../../../../api/rheaApi'
import { Shortcut, useShortcut } from '../../../../../../hooks/useShortcut'
import { arraysEqual } from '../../../../../utils/arraysEqual'
import { useAutosave } from '../../../../../utils/autosave/useAutosave'
import { parseApiResponse } from '../../../../../utils/parseApiResponse'
import { useErrorState } from '../../../../../utils/useErrorState'
import { useIsFirstRender } from '../../../../../utils/useIsFirstRender'
import { worldSlice } from '../../../reducer'
import { useWorldRouter } from '../../../router'
import { getWorldState } from '../../../selectors'
import { Actor, WorldStatement } from '../../../types'
import { useAutocompleteActorList } from '../ActorSelector/useAutocompleteActorList'

type Props = {
	statement: WorldStatement
}

export const StatementDetailsEditor = ({ statement }: Props) => {
	const { actors } = useSelector(getWorldState)
	const { actorOptions, renderOption, mapPreselectedActors } = useAutocompleteActorList({ actors })

	const [title, setTitle] = useState<string>(statement.title)
	const [content, setContent] = useState<string>(statement.content)
	const [selectedActors, setSelectedActors] = useState<Actor[]>(mapPreselectedActors(statement.relatedActors))

	const { error, raiseError, clearError } = useErrorState<{
		SAVING_ERROR: string
	}>()

	const savingEnabled = useRef<boolean>(true)
	const lastSaved = useRef<Pick<WorldStatement, 'title' | 'content' | 'relatedActors'>>(statement)
	const lastSavedAt = useRef<Date>(new Date(statement.updatedAt))

	useEffect(() => {
		if (new Date(statement.updatedAt) > lastSavedAt.current) {
			setTitle(statement.title)
			setContent(statement.content)
			setSelectedActors(mapPreselectedActors(statement.relatedActors))
			savingEnabled.current = false
		}
	}, [statement, actors, mapPreselectedActors])

	const { openDeleteStatementModal } = worldSlice.actions
	const dispatch = useDispatch()

	const [updateWorldStatement, { isLoading: isSaving }] = useUpdateWorldStatementMutation()

	const { eventEditorParams } = useWorldRouter()
	const { worldId } = eventEditorParams

	const sendUpdate = useCallback(
		async (delta: UpdateWorldStatementApiArg['body']) => {
			clearError()
			const { response, error } = parseApiResponse(
				await updateWorldStatement({
					worldId: worldId,
					statementId: statement.id,
					body: delta,
				})
			)
			if (error) {
				raiseError('SAVING_ERROR', error.message)
				return
			}
			lastSaved.current = response
			lastSavedAt.current = new Date()
		},
		[statement.id, updateWorldStatement, worldId, raiseError, clearError]
	)

	const {
		icon: autosaveIcon,
		color: autosaveColor,
		autosave,
		manualSave,
	} = useAutosave({
		onSave: () =>
			sendUpdate({
				title: title.trim(),
				content: content.trim(),
				relatedActorIds: selectedActors.map((a) => a.id),
			}),
		isSaving,
	})

	const { isFirstRender } = useIsFirstRender()
	useEffect(() => {
		if (!savingEnabled.current) {
			savingEnabled.current = true
			return
		}
		if (
			isFirstRender ||
			(lastSaved.current.title === title &&
				lastSaved.current.content === content &&
				arraysEqual(lastSaved.current.relatedActors, selectedActors, (a, b) => a.id === b.id))
		) {
			return
		}

		autosave()
	}, [title, content, selectedActors, sendUpdate, isFirstRender, autosave])

	useEffect(() => {
		clearError()
	}, [title, content, selectedActors, clearError])

	const onDelete = useCallback(() => {
		dispatch(openDeleteStatementModal(statement))
	}, [dispatch, statement, openDeleteStatementModal])

	const { largeLabel: shortcutLabel } = useShortcut(Shortcut.CtrlEnter, () => {
		manualSave()
	})

	return (
		<>
			<TransitionGroup>
				{!!error && (
					<Collapse>
						<Alert severity="error" style={{ marginBottom: '16px' }}>
							{error.data}
						</Alert>
					</Collapse>
				)}
			</TransitionGroup>
			<Stack spacing={2} direction="column">
				<TextField
					label="Content"
					value={content}
					onChange={(e) => setContent(e.target.value)}
					minRows={3}
					maxRows={11}
					multiline
				/>
				<TextField
					type="text"
					label="Title (optional)"
					value={title}
					onChange={(e) => setTitle(e.target.value)}
					inputProps={{ maxLength: 256 }}
				/>
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
			</Stack>
		</>
	)
}
