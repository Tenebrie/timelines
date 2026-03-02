import { RefObject } from 'react'
import { useSelector } from 'react-redux'

import { useSwapWorldEventTracksMutation } from '@/api/worldEventTracksApi'
import { useDragDropReceiver } from '@/app/features/dragDrop/hooks/useDragDropReceiver'
import { TimelineTrack } from '@/app/views/world/views/timeline/hooks/useEventTracks'
import { getWorldIdState } from '@/app/views/world/WorldSliceSelectors'

type Props = {
	track: TimelineTrack
	receiverRef?: RefObject<HTMLDivElement | null>
}

export const useTrackDragDropReceiver = ({ track, receiverRef }: Props) => {
	const worldId = useSelector(getWorldIdState)
	const [swapWorldEvents] = useSwapWorldEventTracksMutation()

	useDragDropReceiver({
		type: 'timelineTrack',
		receiverRef,
		onDrop: (state) => {
			if (!track.baseModel) {
				return
			}
			swapWorldEvents({
				worldId,
				body: {
					trackA: track.id,
					trackB: state.params.track.id,
				},
			})
		},
	})
}
