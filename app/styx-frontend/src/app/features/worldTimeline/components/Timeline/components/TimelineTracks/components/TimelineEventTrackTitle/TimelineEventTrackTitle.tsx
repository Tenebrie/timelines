import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import { memo, useCallback } from 'react'

import { useDragDrop } from '@/app/features/dragDrop/useDragDrop'
import { useModal } from '@/app/features/modals/reducer'

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

	const { ref, ghostElement } = useDragDrop({
		type: 'timelineTrack',
		params: { track },
		ghostFactory: () => (
			<Button variant="contained" color="secondary" style={{ opacity: 0.5 }}>
				{track.baseModel && (
					<span>
						({track.position}) {track.name}
					</span>
				)}
			</Button>
		),
		disabled: !track.baseModel,
	})

	return (
		<Stack height="100%" justifyContent="center">
			<Stack
				ref={ref}
				sx={{
					position: 'relative',
					marginLeft: 1,
					zIndex: 100,
					borderRadius: 1,
				}}
			>
				<Button variant="contained" color="secondary" sx={{ pointerEvents: 'all' }} onClick={onOpen}>
					{track.baseModel && (
						<span>
							({track.position}) {track.name}
						</span>
					)}
					{!track.baseModel && <span>Create new track...</span>}
				</Button>
				{ghostElement}
			</Stack>
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
