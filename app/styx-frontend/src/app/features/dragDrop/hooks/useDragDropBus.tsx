import { useCallback, useEffect } from 'react'

type Props = {
	callback: () => unknown
}

export const useDragDropBusSubscribe = ({ callback }: Props) => {
	const onEvent = useCallback<EventListener>(
		// @ts-ignore
		() => {
			callback()
		},
		[callback],
	)

	useEffect(() => {
		window.addEventListener('@timelines/dragDropStateUpdated', onEvent)
		return () => {
			window.removeEventListener('@timelines/dragDropStateUpdated', onEvent)
		}
	}, [onEvent])
}

export const useDragDropBusDispatch = () => {
	return useCallback(() => {
		window.dispatchEvent(new CustomEvent('@timelines/dragDropStateUpdated'))
	}, [])
}
