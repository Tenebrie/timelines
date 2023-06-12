import { Add } from '@mui/icons-material'
import { LoadingButton } from '@mui/lab'
import { Alert, Autocomplete, Button, Collapse, TextField, Tooltip } from '@mui/material'
import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { TransitionGroup } from 'react-transition-group'

import { useIssueActorStatementMutation, useIssueWorldStatementMutation } from '../../../../../api/rheaApi'
import { Shortcut, useShortcut } from '../../../../../hooks/useShortcut'
import Modal, { ModalFooter, ModalHeader, useModalCleanup } from '../../../../../ui-lib/components/Modal'
import { parseApiResponse } from '../../../../utils/parseApiResponse'
import { useErrorState } from '../../../../utils/useErrorState'
import { worldSlice } from '../../reducer'
import { useWorldRouter } from '../../router'
import { getIssuedStatementWizardState, getWorldState } from '../../selectors'
import { Actor } from '../../types'
import { useAutocompleteActorList } from '../StatementEditor/ActorSelector/useAutocompleteActorList'

export const IssuedStatementWizard = () => {
	const [title, setTitle] = useState('')
	const [content, setContent] = useState('')
	const [selectedActors, setSelectedActors] = useState<Actor[]>([])
	const [mentionedActors, setMentionedActors] = useState<Actor[]>([])
	const [showAdvanced, setShowAdvanced] = useState<boolean>(false)

	const { error, raiseError, clearError } = useErrorState<{
		MISSING_CONTENT: string
		MISSING_ACTORS: string
		SERVER_SIDE_ERROR: string
	}>()

	const { actors } = useSelector(getWorldState)
	const { worldParams } = useWorldRouter()
	const [issueWorldStatement, { isLoading: isWorldStatementCallLoading }] = useIssueWorldStatementMutation()
	const [issueActorStatement, { isLoading: isActorStatementCallLoading }] = useIssueActorStatementMutation()

	const dispatch = useDispatch()
	const { closeIssuedStatementWizard } = worldSlice.actions

	const { isOpen, scope, eventId } = useSelector(getIssuedStatementWizardState)

	useModalCleanup({
		isOpen,
		onCleanup: () => {
			setTitle('')
			setContent('')
			setSelectedActors([])
			setMentionedActors([])
			clearError()
		},
	})

	useEffect(() => {
		clearError()
	}, [title, content, selectedActors, clearError])

	const onConfirm = async () => {
		if (!isOpen) {
			return
		}

		if (content.trim().length < 3) {
			raiseError('MISSING_CONTENT', 'Content must be at least 3 characters')
			return
		}

		if (scope === 'actor' && selectedActors.length === 0) {
			raiseError('MISSING_ACTORS', 'Actor statements require at least one target actor')
			return
		}

		const { error } = parseApiResponse(
			await (() => {
				if (scope === 'world') {
					return issueWorldStatement({
						worldId: worldParams.worldId,
						body: {
							title: title.trim(),
							content: content.trim(),
							eventId,
						},
					})
				}
				return issueActorStatement({
					worldId: worldParams.worldId,
					body: {
						title: title.trim(),
						content: content.trim(),
						eventId,
						targetActorIds: selectedActors.map((actor) => actor.id),
						mentionedActorIds: mentionedActors.map((actor) => actor.id),
					},
				})
			})()
		)
		if (error) {
			raiseError('SERVER_SIDE_ERROR', error.message)
			return
		}
		dispatch(closeIssuedStatementWizard())
	}

	const onCloseAttempt = () => {
		if (isWorldStatementCallLoading || isActorStatementCallLoading) {
			return
		}
		dispatch(closeIssuedStatementWizard())
	}

	const { actorOptions, mentionedActorOptions, renderOption } = useAutocompleteActorList({
		actors,
		selectedActors,
		mentionedActors,
	})

	const { largeLabel: shortcutLabel } = useShortcut(Shortcut.CtrlEnter, () => {
		onConfirm()
	})

	return (
		<Modal visible={isOpen} onClose={onCloseAttempt}>
			<ModalHeader>Issue Statement</ModalHeader>
			<TransitionGroup>
				{error && (
					<Collapse>
						<Alert severity="error">{error.data}</Alert>
					</Collapse>
				)}
			</TransitionGroup>
			<TextField
				value={content}
				onChange={(e) => setContent(e.target.value)}
				type={'text'}
				label="Content"
				multiline
				autoFocus
				minRows={3}
				error={!!error && error.type === 'MISSING_CONTENT'}
			/>
			<TextField
				label="Title (optional)"
				type="text"
				value={title}
				style={{ color: 'gray' }}
				onChange={(event) => setTitle(event.target.value)}
				inputProps={{ maxLength: 256 }}
			/>
			{scope === 'actor' && (
				<>
					<Autocomplete
						value={selectedActors}
						onChange={(_, value) => setSelectedActors(value)}
						multiple={true}
						options={actorOptions}
						isOptionEqualToValue={(option, value) => option.id === value.id}
						autoHighlight
						renderOption={renderOption}
						renderInput={(params) => (
							<TextField {...params} label="Actors" error={!!error && error.type === 'MISSING_ACTORS'} />
						)}
					/>
					<Button variant="text" onClick={() => setShowAdvanced(!showAdvanced)}>
						{showAdvanced ? 'Hide' : 'Show'} advanced options
					</Button>
					<TransitionGroup>
						{showAdvanced && (
							<Collapse>
								<Autocomplete
									value={mentionedActors}
									onChange={(_, value) => setMentionedActors(value)}
									multiple={true}
									options={mentionedActorOptions}
									isOptionEqualToValue={(option, value) => option.id === value.id}
									autoHighlight
									renderOption={renderOption}
									renderInput={(params) => <TextField {...params} label="Mentioned actors (Optional)" />}
								/>
							</Collapse>
						)}
					</TransitionGroup>
				</>
			)}
			<ModalFooter>
				<Tooltip title={shortcutLabel} arrow placement="top">
					<span>
						<LoadingButton
							loading={isWorldStatementCallLoading || isActorStatementCallLoading}
							variant="contained"
							onClick={onConfirm}
							loadingPosition="start"
							startIcon={<Add />}
						>
							<span>Confirm</span>
						</LoadingButton>
					</span>
				</Tooltip>
				<Button variant="outlined" onClick={onCloseAttempt}>
					Cancel
				</Button>
			</ModalFooter>
		</Modal>
	)
}
