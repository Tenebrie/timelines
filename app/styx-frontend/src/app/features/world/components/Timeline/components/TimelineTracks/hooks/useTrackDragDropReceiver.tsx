import { useSelector } from 'react-redux'

import { useSwapWorldEventTracksMutation } from '../../../../../../../../api/rheaApi'
import { useDragDropReceiver } from '../../../../../../dragDrop/useDragDropReceiver'
import { getWorldState } from '../../../../../selectors'
import { TimelineTrack } from './useEventTracks'

type Props = {
	track: TimelineTrack
	receiverRef?: React.MutableRefObject<HTMLDivElement | null>
}

export const useTrackDragDropReceiver = ({ track, receiverRef }: Props) => {
	const { id: worldId } = useSelector(getWorldState)
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