import { RefObject, startTransition, useCallback, useLayoutEffect, useRef, useState } from 'react'

import { useEventBusSubscribe } from '@/app/features/eventBus'

type Props = {
	ref: RefObject<HTMLElement | null>
}

export function useOutlinerHeightListener({ ref }: Props) {
	const tracksHeightRef = useRef(300)
	const entityHeightRef = useRef(300)

	const outlinerHeightRef = useRef(300)
	const [outlinerHeight, setOutlinerHeight] = useState(300)
	const [needToScrollBy, setNeedToScrollBy] = useState(0)
	const preResizeScroll = useRef(0)

	const onResize = useCallback(
		(height: number) => {
			const diff = height - outlinerHeightRef.current
			outlinerHeightRef.current = height
			startTransition(() => {
				setOutlinerHeight(height)
				setNeedToScrollBy(diff)
			})
			preResizeScroll.current = ref.current?.scrollTop ?? 0
		},
		[ref],
	)

	useEventBusSubscribe({
		event: 'outliner/tracksDrawerResized',
		callback: ({ height }) => {
			tracksHeightRef.current = height
			onResize(Math.max(entityHeightRef.current, height))
		},
	})

	useEventBusSubscribe({
		event: 'outliner/entityDrawerResized',
		callback: ({ height }) => {
			entityHeightRef.current = height
			onResize(Math.max(tracksHeightRef.current, height))
		},
	})

	useLayoutEffect(() => {
		const timeline = ref.current
		if (!timeline || needToScrollBy === 0) {
			return
		}

		const scrollLost = preResizeScroll.current - timeline.scrollTop

		timeline.scrollBy({ top: Math.round(needToScrollBy + scrollLost) })
		setNeedToScrollBy(0)
	}, [needToScrollBy, ref])

	return { outlinerHeight }
}
