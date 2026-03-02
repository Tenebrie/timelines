import { useCallback } from 'react'

import { useDragDropBusSubscribe } from '@/app/features/dragDrop/hooks/useDragDropBus'

type Props = {
	onTimeChange: (scrollPosition: number) => void
	onClear: () => void
}

export function useAnchorTimeDragDrop({ onTimeChange, onClear }: Props) {
	const onMouseMove = useCallback(
		(event: MouseEvent) => {
			onTimeChange(event.clientX)
		},
		[onTimeChange],
	)

	useDragDropBusSubscribe({
		callback: (data) => {
			if (!data) {
				document.removeEventListener('mousemove', onMouseMove)
				onClear()
				return
			}
			onTimeChange(data.targetPos.x)
			document.addEventListener('mousemove', onMouseMove)
		},
		onCleanup: () => {
			document.removeEventListener('mousemove', onMouseMove)
		},
	})
}
