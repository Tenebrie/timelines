import { Delete } from '@mui/icons-material'
import { LoadingButton } from '@mui/lab'
import { Button, Stack, TextField, Tooltip } from '@mui/material'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useDispatch } from 'react-redux'

import { useUpdateWorldStatementMutation } from '../../../../../../api/rheaApi'
import { Shortcut, useShortcut } from '../../../../../../hooks/useShortcut'
import { useAutosave } from '../../../../../utils/autosave/useAutosave'
import { parseApiResponse } from '../../../../../utils/parseApiResponse'
import { useIsFirstRender } from '../../../../../utils/useIsFirstRender'
import { worldSlice } from '../../../reducer'
import { useWorldRouter } from '../../../router'
import { WorldStatement } from '../../../types'

type Props = {
	statement: WorldStatement
}

export const StatementDetailsEditor = ({ statement }: Props) => {
	const [title, setTitle] = useState<string>(statement.title)
	const [content, setContent] = useState<string>(statement.content)

	const savingEnabled = useRef<boolean>(true)
	const lastSaved = useRef<Pick<WorldStatement, 'title' | 'content'>>(statement)
	const lastSavedAt = useRef<Date>(new Date(statement.updatedAt))

	useEffect(() => {
		if (new Date(statement.updatedAt) > lastSavedAt.current) {
			setTitle(statement.title)
			setContent(statement.content)
			savingEnabled.current = false
		}
	}, [statement])

	const { openDeleteStatementModal } = worldSlice.actions
	const dispatch = useDispatch()

	const [updateWorldStatement, { isLoading: isSaving }] = useUpdateWorldStatementMutation()

	const { eventEditorParams } = useWorldRouter()
	const { worldId } = eventEditorParams

	const sendUpdate = useCallback(
		async (delta: Partial<WorldStatement>) => {
			const { response, error } = parseApiResponse(
				await updateWorldStatement({
					worldId: worldId,
					statementId: statement.id,
					body: delta,
				})
			)
			if (error) {
				return
			}
			lastSaved.current = response
			lastSavedAt.current = new Date()
		},
		[statement.id, updateWorldStatement, worldId]
	)

	const {
		icon: autosaveIcon,
		color: autosaveColor,
		autosave,
		manualSave,
	} = useAutosave({
		onSave: () =>
			sendUpdate({
				title,
				content,
			}),
		isSaving,
	})

	const { isFirstRender } = useIsFirstRender()
	useEffect(() => {
		if (!savingEnabled.current) {
			savingEnabled.current = true
			return
		}
		if (isFirstRender || (lastSaved.current.title === title && lastSaved.current.content === content)) {
			return
		}

		autosave()
	}, [title, content, sendUpdate, isFirstRender, autosave])

	const onDelete = useCallback(() => {
		dispatch(openDeleteStatementModal(statement))
	}, [dispatch, statement, openDeleteStatementModal])

	const { largeLabel: shortcutLabel } = useShortcut(Shortcut.CtrlEnter, () => {
		manualSave()
	})

	return (
		<Stack spacing={2} direction="column">
			<TextField
				type="text"
				label="Title"
				value={title}
				onChange={(e) => setTitle(e.target.value)}
				inputProps={{ maxLength: 256 }}
			/>
			<TextField
				label="Content"
				value={content}
				onChange={(e) => setContent(e.target.value)}
				minRows={3}
				maxRows={11}
				multiline
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
	)
}
