import Stack from '@mui/material/Stack'
import { memo, RefObject, useEffect, useMemo } from 'react'

import { IsDragDropStateOfType } from '@/app/features/dragDrop/DragDropState'
import { useDragDropStateWithRenders } from '@/app/features/dragDrop/hooks/useDragDropStateWithRenders'

import { TimelineTrack } from '../../hooks/useEventTracks'
import { useEventDragDropReceiver } from './hooks/useEventDragDropReceiver'
import { useTrackDragDropReceiver } from './hooks/useTrackDragDropReceiver'

type Props = {
	track: TimelineTrack
	receiverRef: RefObject<HTMLDivElement | null>
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
