import { Button, Stack } from '@mui/material'
import { memo, useCallback } from 'react'

import { useModal } from '../../../../../../../modals/reducer'
import useEventTracks from '../../hooks/useEventTracks'

type Props = {
	track: ReturnType<typeof useEventTracks>[number]
}

export const TimelineEventTrackTitleComponent = ({ track }: Props) => {
	const { open: openEventTrackWizard } = useModal('eventTrackWizard')
	const { open: openEventTrackEdit } = useModal('eventTrackEdit')

	const onOpen = useCallback(() => {
		if (!track.baseModel) {
			openEventTrackWizard({})
			return
		}
		openEventTrackEdit({ target: track.baseModel })
	}, [openEventTrackEdit, openEventTrackWizard, track.baseModel])

	return (
		<Stack
			sx={{
				marginLeft: 1,
				background: 'rgb(10 10 50 / 100%)',
				zIndex: 100,
				borderRadius: 1,
			}}
		>
			<Button sx={{ pointerEvents: 'all' }} onClick={onOpen}>
				{track.baseModel && (
					<span>
						({track.position}) {track.name}
					</span>
				)}
				{!track.baseModel && <span>Create new track...</span>}
			</Button>
		</Stack>
	)
}

export const TimelineEventTrackTitle = memo(
	TimelineEventTrackTitleComponent,
	(prev, next) =>
		prev.track.id === next.track.id &&
		prev.track.baseModel === next.track.baseModel &&
		prev.track.name === next.track.name &&
		prev.track.position === next.track.position,
)
