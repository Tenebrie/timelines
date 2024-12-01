import { useShareWorldMutation } from '@api/worldCollaboratorsApi'
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

import { CollaboratorAccess } from '@/api/types'
import { worldListSlice } from '@/app/features/worldList/reducer'
import { getShareWorldModalState } from '@/app/features/worldList/selectors'
import { getWorldIdState } from '@/app/features/worldTimeline/selectors'
import { parseApiResponse } from '@/app/utils/parseApiResponse'
import { useCollaboratorAccess } from '@/app/utils/useCollaboratorAccess'
import { Shortcut, useShortcut } from '@/hooks/useShortcut'
import Modal, { ModalFooter, ModalHeader, useModalCleanup } from '@/ui-lib/components/Modal'

export const ShareWorldModal = () => {
	const [emails, setEmails] = useState<string[]>([])
	const [access, setAccess] = useState<CollaboratorAccess>('ReadOnly')

	const { listAllLevels } = useCollaboratorAccess()
	const worldId = useSelector(getWorldIdState)

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
			}),
		)
		if (error) {
			return
		}

		dispatch(closeShareWorldModal())
	}

	const { largeLabel: shortcutLabel } = useShortcut(
		Shortcut.CtrlEnter,
		() => {
			onConfirm()
		},
		isOpen ? 1 : -1,
	)

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
						aria-label="Collaborator access level"
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
