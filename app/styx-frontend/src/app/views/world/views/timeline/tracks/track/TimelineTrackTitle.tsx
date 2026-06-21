import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import { memo, useCallback } from 'react'

import { useDragDrop } from '@/app/features/dragDrop/hooks/useDragDrop'
import { useModal } from '@/app/features/modals/ModalsSlice'

import { TimelineTrack } from '../../hooks/useEventTracks'

type Props = {
	track: TimelineTrack
}

export const TimelineTrackTitle = memo(
	TimelineTrackTitleComponent,
	(prev, next) =>
		prev.track.id === next.track.id &&
		prev.track.baseModel === next.track.baseModel &&
		prev.track.name === next.track.name &&
		prev.track.position === next.track.position,
)

export function TimelineTrackTitleComponent({ track }: Props) {
	const { open: openEventTracks } = useModal('eventTracks')

	const onOpen = useCallback(() => {
		openEventTracks({})
	}, [openEventTracks])

	const { ref, ghostElement } = useDragDrop({
		type: 'timelineTrack',
		params: { track },
		ghostAlign: {
			top: 'center',
			left: 'center',
		},
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
		<Stack height="100%" justifyContent="flex-start">
			<Stack
				ref={ref}
				sx={{
					position: 'relative',
					marginTop: 0.5,
					marginLeft: 3,
					zIndex: 2,
					borderRadius: 1,
				}}
			>
				<Button
					color="secondary"
					sx={{ pointerEvents: 'all', maxWidth: '384px', alignContent: 'start' }}
					onClick={onOpen}
				>
					{track.baseModel && (
						<span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
							{track.name}
						</span>
					)}
					{!track.baseModel && <span>Manage event tracks...</span>}
				</Button>
				{ghostElement}
			</Stack>
		</Stack>
	)
}
