import { Stack } from '@mui/material'
import { memo, useEffect } from 'react'

import { useDragDropStateWithRenders } from '../../../../../dragDrop/DragDropState'
import { useEventDragDropReceiver } from './hooks/useEventDragDropReceiver'
import { TimelineTrack } from './hooks/useEventTracks'

type Props = {
	track: TimelineTrack
	receiverRef: React.MutableRefObject<HTMLDivElement | null>
	onDragChanged: (isDragging: boolean) => void
}

const TimelineTrackItemDragDropComponent = ({ track, receiverRef, onDragChanged }: Props) => {
	const { isDragging } = useDragDropStateWithRenders()
	useEventDragDropReceiver({
		track,
		receiverRef,
	})

	useEffect(() => {
		onDragChanged(isDragging)
	}, [isDragging, onDragChanged])

	return (
		<Stack
			sx={{
				position: 'absolute',
				width: '100%',
				height: '100%',
				pointerEvents: isDragging ? 'auto' : 'none',
			}}
		/>
	)
}

export const TimelineTrackItemDragDrop = memo(TimelineTrackItemDragDropComponent)
