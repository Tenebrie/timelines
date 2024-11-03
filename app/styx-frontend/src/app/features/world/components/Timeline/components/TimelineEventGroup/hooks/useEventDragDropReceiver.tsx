import { useDispatch, useSelector } from 'react-redux'

import { useUpdateWorldEventMutation } from '../../../../../../../../api/rheaApi'
import { parseApiResponse } from '../../../../../../../utils/parseApiResponse'
import { useDragDropReceiver } from '../../../../../../dragDrop/useDragDropReceiver'
import { worldSlice } from '../../../../../reducer'
import { getWorldState } from '../../../../../selectors'
import useEventTracks from '../../../hooks/useEventTracks'

type Props = {
	track: ReturnType<typeof useEventTracks>[number]
}

export const useEventDragDropReceiver = ({ track }: Props) => {
	const { id: worldId } = useSelector(getWorldState)
	const [updateWorldEvent] = useUpdateWorldEventMutation()

	const { updateEvent } = worldSlice.actions
	const dispatch = useDispatch()

	const { ref, getState } = useDragDropReceiver({
		type: 'timelineEvent',
		onDrop: async (state) => {
			dispatch(
				updateEvent({
					id: state.params.event.eventId,
					worldEventTrackId: track.id,
				}),
			)
			const { error } = parseApiResponse(
				await updateWorldEvent({
					body: {
						worldEventTrackId: track.baseModel ? track.id : null,
					},
					worldId,
					eventId: state.params.event.id,
				}),
			)
			if (error) {
				return
			}
		},
	})

	return {
		ref,
		getState,
	}
}
