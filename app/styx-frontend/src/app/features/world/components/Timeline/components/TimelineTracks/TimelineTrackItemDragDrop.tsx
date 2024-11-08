import { Stack } from '@mui/material'
import { memo, useEffect, useMemo } from 'react'

import { IsDragDropStateOfType, useDragDropStateWithRenders } from '../../../../../dragDrop/DragDropState'
import { useEventDragDropReceiver } from './hooks/useEventDragDropReceiver'
import { TimelineTrack } from './hooks/useEventTracks'
import { useTrackDragDropReceiver } from './hooks/useTrackDragDropReceiver'

type Props = {
	track: TimelineTrack
	receiverRef: React.MutableRefObject<HTMLDivElement | null>
	onDragChanged: (isDragging: boolean) => void
}

const TimelineTrackItemDragDropComponent = ({ track, receiverRef, onDragChanged }: Props) => {
	const { isDragging, state } = useDragDropStateWithRenders()

	const isHighlighted = useMemo(
		() =>
			isDragging &&
			state &&
			(state.type === 'timelineEvent' ||
				(IsDragDropStateOfType(state, 'timelineTrack') && !!track.baseModel)),
		[isDragging, state, track.baseModel],
	)

	useEventDragDropReceiver({
		track,
		receiverRef,
	})
	useTrackDragDropReceiver({
		track,
		receiverRef,
	})

	useEffect(() => {
		onDragChanged(isHighlighted ?? false)
	}, [isHighlighted, onDragChanged])

	return (
		<Stack
			sx={{
				position: 'absolute',
				width: '100%',
				height: '100%',
				pointerEvents: isHighlighted ? 'auto' : 'none',
			}}
		/>
	)
}

export const TimelineTrackItemDragDrop = memo(TimelineTrackItemDragDropComponent)
