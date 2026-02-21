import { CollaboratorAccess } from '@api/types/worldCollaboratorsTypes'
import { useShareWorldMutation } from '@api/worldCollaboratorsApi'
import Add from '@mui/icons-material/Add'
import Autocomplete, { createFilterOptions } from '@mui/material/Autocomplete'
import Button from '@mui/material/Button'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'
import TextField from '@mui/material/TextField'
import Tooltip from '@mui/material/Tooltip'
import { useState } from 'react'
import { useSelector } from 'react-redux'

import { useModal } from '@/app/features/modals/ModalsSlice'
import { Shortcut, useShortcut } from '@/app/hooks/useShortcut/useShortcut'
import { parseApiResponse } from '@/app/utils/parseApiResponse'
import { useCollaboratorAccess } from '@/app/views/world/views/settings/hooks/useCollaboratorAccess'
import { getWorldIdState } from '@/app/views/world/WorldSliceSelectors'
import Modal, { ModalFooter, ModalHeader, useModalCleanup } from '@/ui-lib/components/Modal'

export const ShareWorldModal = () => {
	const [emails, setEmails] = useState<{ value: string; label: string }[]>([])
	const [access, setAccess] = useState<CollaboratorAccess>('ReadOnly')

	const { listAllLevels } = useCollaboratorAccess()
	const worldId = useSelector(getWorldIdState)

	const { isOpen, close } = useModal('shareWorldModal')

	const [shareWorld, { isLoading }] = useShareWorldMutation()

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

		close()
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
			<Modal visible={isOpen} onClose={close}>
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
						<Button
							loading={isLoading}
							variant="contained"
							onClick={onConfirm}
							loadingPosition="start"
							startIcon={<Add />}
						>
							<span>Confirm</span>
						</Button>
					</Tooltip>
					<Button variant="outlined" onClick={close}>
						Cancel
					</Button>
				</ModalFooter>
			</Modal>
		</>
	)
}
