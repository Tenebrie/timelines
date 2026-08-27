import Checkbox from '@mui/material/Checkbox'
import FormControlLabel from '@mui/material/FormControlLabel'
import FormGroup from '@mui/material/FormGroup'
import TextField from '@mui/material/TextField'
import { useCallback, useState } from 'react'
import { useSelector } from 'react-redux'

import { useCreateWorldEventTrackMutation } from '@/api/worldEventTracksApi'
import { useModal } from '@/app/features/modals/ModalsSlice'
import { isEntityNameValid } from '@/app/utils/isEntityNameValid'
import { parseApiResponse } from '@/app/utils/parseApiResponse'
import { TimelineTracksMenu } from '@/app/views/world/views/timeline/tracks/track/TimelineTracksMenu'
import { getWorldIdState } from '@/app/views/world/WorldSliceSelectors'
import Modal, { ModalHeader } from '@/ui-lib/components/Modal'
import { CreatePopoverIconButton } from '@/ui-lib/components/PopoverButton/CreatePopoverIconButton'

export function EventTracksModal() {
	const worldId = useSelector(getWorldIdState)

	const { isOpen, close } = useModal('eventTracks')

	const [name, setName] = useState('')
	const [assignOrphans, setAssignOrphans] = useState(false)
	const [nameValidationError, setNameValidationError] = useState<string | null>(null)

	const [createWorldEventTrack] = useCreateWorldEventTrackMutation()

	const onConfirm = useCallback(async () => {
		if (!isOpen) {
			return
		}

		const validationResult = isEntityNameValid(name)
		if (validationResult.error) {
			setNameValidationError(validationResult.error)
			return false
		}

		const { error } = parseApiResponse(
			await createWorldEventTrack({
				worldId,
				body: {
					name: name.trim(),
					assignOrphans,
				},
			}),
		)
		if (error) {
			setNameValidationError(error.message)
			return false
		}
	}, [assignOrphans, createWorldEventTrack, isOpen, name, worldId])

	return (
		<Modal visible={isOpen} onClose={close} closeOnBackdropClick>
			<ModalHeader
				action={
					<CreatePopoverIconButton
						tooltip="Create new track"
						onConfirm={onConfirm}
						onEnterKey={async ({ close }) => {
							const returnValue = await onConfirm()
							if (returnValue !== false) {
								close()
							}
						}}
						onCleanup={() => setName('')}
						popoverBody={() => (
							<>
								<TextField
									size="small"
									label="Name"
									type="text"
									value={name}
									onChange={(event) => setName(event.target.value)}
									error={!!nameValidationError}
									helperText={nameValidationError}
									autoFocus
								/>
								<FormGroup>
									<FormControlLabel
										control={
											<Checkbox
												checked={assignOrphans}
												onChange={(_, checked) => setAssignOrphans(checked)}
											/>
										}
										label="Assign orphan events to new track"
									/>
								</FormGroup>
							</>
						)}
					/>
				}
			>
				Event Tracks
			</ModalHeader>
			<TimelineTracksMenu />
		</Modal>
	)
}
