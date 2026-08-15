import { useDeleteWorldEventTrackMutation } from '@api/worldEventTracksApi'
import { useSelector } from 'react-redux'

import { getWorldIdState } from '@/app/views/world/WorldSliceSelectors'
import { ConfirmPopoverButton } from '@/ui-lib/components/PopoverButton/ConfirmPopoverButton'

type Props = {
	trackId: string
	trackName: string
	disabled?: boolean
}

export function DeleteTrackButton({ trackId, trackName, disabled }: Props) {
	const worldId = useSelector(getWorldIdState)
	const [deleteTrack] = useDeleteWorldEventTrackMutation()

	const handleDelete = async () => {
		await deleteTrack({
			trackId,
			worldId,
		})
	}

	return (
		<ConfirmPopoverButton
			type="delete"
			prompt={
				<>
					Are you sure you want to delete event track "<b>{trackName}</b>"? <br />
					Events will be safely unassigned.
				</>
			}
			tooltip="Delete track"
			onConfirm={handleDelete}
			disabled={disabled}
		/>
	)
}
