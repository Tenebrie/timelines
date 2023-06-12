import { useCallback, useRef } from 'react'

type Props<ArgsT> = {
	onClick: (args: ArgsT) => void
	onDoubleClick: (args: ArgsT) => void
	ignoreDelay?: boolean
}

export const useDoubleClick = <ArgsT,>({ onClick, onDoubleClick, ignoreDelay }: Props<ArgsT>) => {
	const singleClickTimeout = useRef<number>(0)
	const singleClickArguments = useRef<ArgsT>()
	const lastClickTimestamp = useRef<number>(0)

	const onSingleClickTimeout = useCallback(() => {
		onClick(singleClickArguments.current as ArgsT)
	}, [onClick])

	const triggerClick = useCallback(
		(args: ArgsT) => {
			const time = Date.now()
			const currentTime = lastClickTimestamp.current
			lastClickTimestamp.current = time
			if (time - currentTime < 200) {
				lastClickTimestamp.current = 0
				onDoubleClick(args)
				window.clearTimeout(singleClickTimeout.current)
				return
			}
			if (ignoreDelay) {
				onClick(args)
			} else {
				singleClickTimeout.current = window.setTimeout(onSingleClickTimeout, 200)
				singleClickArguments.current = args
			}
		},
		[ignoreDelay, onClick, onDoubleClick, onSingleClickTimeout]
	)

	return {
		triggerClick,
	}
}
