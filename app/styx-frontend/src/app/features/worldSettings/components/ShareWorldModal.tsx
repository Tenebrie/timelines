import { useShareWorldMutation } from '@api/worldCollaboratorsApi'
import Add from '@mui/icons-material/Add'
import LoadingButton from '@mui/lab/LoadingButton'
import { createFilterOptions } from '@mui/material'
import Autocomplete from '@mui/material/Autocomplete'
import Button from '@mui/material/Button'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'
import TextField from '@mui/material/TextField'
import Tooltip from '@mui/material/Tooltip'
import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import { CollaboratorAccess } from '@/api/types'
import { getWorldIdState } from '@/app/features/world/selectors'
import { worldListSlice } from '@/app/features/worldList/reducer'
import { getShareWorldModalState } from '@/app/features/worldList/selectors'
import { Shortcut, useShortcut } from '@/app/hooks/useShortcut'
import { parseApiResponse } from '@/app/utils/parseApiResponse'
import { useCollaboratorAccess } from '@/app/utils/useCollaboratorAccess'
import Modal, { ModalFooter, ModalHeader, useModalCleanup } from '@/ui-lib/components/Modal'

export const ShareWorldModal = () => {
	const [emails, setEmails] = useState<{ value: string; label: string }[]>([])
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
					userEmails: emails.map((email) => email.value),
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

	const filter = createFilterOptions<{ value: string; label: string }>()

	return (
		<>
			<Modal visible={isOpen} onClose={() => dispatch(closeShareWorldModal())}>
				<ModalHeader>Share world</ModalHeader>
				<Autocomplete
					multiple
					value={emails}
					onChange={(_, newValue) => {
						setEmails(
							newValue.map((email) => {
								if (typeof email === 'string') {
									return {
										value: email,
										label: email,
									}
								}
								return email
							}),
						)
					}}
					options={[]}
					freeSolo
					data-hj-suppress
					filterOptions={(options, params) => {
						const filtered = filter(options, params)

						const { inputValue } = params
						// Suggest the creation of a new value
						const isExisting = options.some((option) => inputValue === option.label)
						if (inputValue !== '' && !isExisting) {
							filtered.push({
								value: inputValue,
								label: `Add "${inputValue}"`,
							})
						}

						return filtered
					}}
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
