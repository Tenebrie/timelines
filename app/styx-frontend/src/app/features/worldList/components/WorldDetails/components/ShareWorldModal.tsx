import { Add } from '@mui/icons-material'
import { LoadingButton } from '@mui/lab'
import {
	Autocomplete,
	Button,
	FormControl,
	InputLabel,
	MenuItem,
	Select,
	TextField,
	Tooltip,
} from '@mui/material'
import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import { useShareWorldMutation } from '../../../../../../api/rheaApi'
import { CollaboratorAccess } from '../../../../../../api/types'
import { Shortcut, useShortcut } from '../../../../../../hooks/useShortcut'
import Modal, { ModalFooter, ModalHeader, useModalCleanup } from '../../../../../../ui-lib/components/Modal'
import { parseApiResponse } from '../../../../../utils/parseApiResponse'
import { useCollaboratorAccess } from '../../../../../utils/useCollaboratorAccess'
import { useWorldRouter } from '../../../../world/router'
import { worldListSlice } from '../../../reducer'
import { getShareWorldModalState } from '../../../selectors'

export const ShareWorldModal = () => {
	const [emails, setEmails] = useState<string[]>([])
	const [access, setAccess] = useState<CollaboratorAccess>('ReadOnly')

	const { listAllLevels } = useCollaboratorAccess()
	const { worldParams } = useWorldRouter()
	const { worldId } = worldParams

	const { isOpen } = useSelector(getShareWorldModalState)

	const [shareWorld, { isLoading }] = useShareWorldMutation()

	const dispatch = useDispatch()
	const { closeShareWorldModal } = worldListSlice.actions

	useModalCleanup({
		isOpen,
		onCleanup: () => {
			setEmails([])
			setAccess('ReadOnly')
		},
	})

	const onConfirm = async () => {
		if (!isOpen) {
			return
		}

		const { error } = parseApiResponse(
			await shareWorld({
				worldId,
				body: {
					userEmails: emails,
					access,
				},
			})
		)
		if (error) {
			return
		}

		dispatch(closeShareWorldModal())
	}

	const { largeLabel: shortcutLabel } = useShortcut(Shortcut.CtrlEnter, () => {
		onConfirm()
	})

	return (
		<>
			<Modal visible={isOpen} onClose={() => dispatch(closeShareWorldModal())}>
				<ModalHeader>Share world</ModalHeader>
				<Autocomplete
					multiple
					value={emails}
					onChange={(_, newValue) => setEmails(newValue)}
					options={[]}
					freeSolo
					data-hj-suppress
					renderInput={(params) => <TextField {...params} label="Emails" />}
				/>
				<FormControl fullWidth>
					<InputLabel id="share-access-label">Access</InputLabel>
					<Select
						value={access}
						label="Access"
						labelId="share-access-label"
						onChange={(event) => {
							setAccess(event.target.value as CollaboratorAccess)
						}}
					>
						{listAllLevels().map((option) => (
							<MenuItem key={option} value={option}>
								{option}
							</MenuItem>
						))}
					</Select>
				</FormControl>
				<ModalFooter>
					<Tooltip title={shortcutLabel} arrow placement="top">
						<span>
							<LoadingButton
								loading={isLoading}
								variant="contained"
								onClick={onConfirm}
								loadingPosition="start"
								startIcon={<Add />}
							>
								<span>Confirm</span>
							</LoadingButton>
						</span>
					</Tooltip>
					<Button variant="outlined" onClick={() => dispatch(closeShareWorldModal())}>
						Cancel
					</Button>
				</ModalFooter>
			</Modal>
		</>
	)
}
