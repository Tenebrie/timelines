import { useCallback, useEffect } from 'react'

import { DragDropStateType } from '../DragDropState'
import { AllowedDraggableType } from '../types'

type Props = {
	callback: (data: DragDropStateType<AllowedDraggableType> | null) => unknown
	onCleanup?: () => unknown
}

export const useDragDropBusSubscribe = ({ callback, onCleanup }: Props) => {
	const onEvent = useCallback<EventListener>(
		(event) => {
			const customEvent = event as CustomEvent<{ data: DragDropStateType<AllowedDraggableType> | null }>
			const data = customEvent.detail.data
			callback(data)
		},
		[callback],
	)

	useEffect(() => {
		window.addEventListener('@timelines/dragDropStateUpdated', onEvent)
		return () => {
			window.removeEventListener('@timelines/dragDropStateUpdated', onEvent)
			if (onCleanup) {
				onCleanup()
			}
		}
	}, [onEvent, onCleanup])
}

export const useDragDropBusDispatch = () => {
	return useCallback((data: DragDropStateType<AllowedDraggableType> | null) => {
		window.dispatchEvent(new CustomEvent('@timelines/dragDropStateUpdated', { detail: { data } }))
	}, [])
}
