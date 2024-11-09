import { useCallback, useEffect } from 'react'

type Props = {
	callback: (props: { timestamp: number; useRawScroll?: boolean; skipAnim?: boolean }) => unknown
}

export const useTimelineBusSubscribe = ({ callback }: Props) => {
	const onEvent = useCallback<EventListener>(
		// @ts-ignore
		(event: CustomEvent) => {
			callback(event.detail as { timestamp: number; useRawScroll?: boolean; skipAnim?: boolean })
		},
		[callback],
	)

	useEffect(() => {
		window.addEventListener('@timeline/scrollTo', onEvent)
		return () => {
			window.removeEventListener('@timeline/scrollTo', onEvent)
		}
	}, [onEvent])
}

export const useTimelineBusDispatch = () => {
	return useCallback((timestamp: number, useRawScroll?: boolean, skipAnim?: boolean) => {
		window.dispatchEvent(
			new CustomEvent('@timeline/scrollTo', {
				detail: {
					timestamp,
					useRawScroll,
					skipAnim,
				},
			}),
		)
	}, [])
}
