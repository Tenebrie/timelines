import { useCallback, useEffect } from 'react'

type Props = {
	callback: (timestamp: number) => unknown
}

export const useTimelineBusSubscribe = ({ callback }: Props) => {
	const onEvent = useCallback<EventListener>(
		// @ts-ignore
		(event: CustomEvent) => {
			callback(event.detail as number)
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
	return (timestamp: number) => {
		window.dispatchEvent(
			new CustomEvent('@timeline/scrollTo', {
				detail: timestamp,
			}),
		)
	}
}
