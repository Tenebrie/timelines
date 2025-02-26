import { useSelector } from 'react-redux'

import { useSwapWorldEventTracksMutation } from '@/api/worldEventTracksApi'
import { useDragDropReceiver } from '@/app/features/dragDrop/useDragDropReceiver'
import { getWorldIdState } from '@/app/views/world/WorldSliceSelectors'

import { TimelineTrack } from './useEventTracks'

type Props = {
	track: TimelineTrack
	receiverRef?: React.MutableRefObject<HTMLDivElement | null>
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
