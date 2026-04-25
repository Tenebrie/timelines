import LinearProgress from '@mui/material/LinearProgress'
import { Node as ProseMirrorNode } from '@tiptap/pm/model'
import { RefObject, useRef, useState } from 'react'

import { useEventBusSubscribe } from '@/app/features/eventBus'

type Props = {
	elementsRendering: RefObject<Set<ProseMirrorNode>>
}

export const ProgressBar = ({ elementsRendering }: Props) => {
	const [value, setValue] = useState(0)
	const [opacity, setOpacity] = useState(0)
	const triggeredRef = useRef(false)
	const maxValueRef = useRef(0)
	const rafIdRef = useRef(0)

	const scheduleProgressUpdate = () => {
		if (rafIdRef.current) return
		rafIdRef.current = requestAnimationFrame(() => {
			rafIdRef.current = 0
			const size = elementsRendering.current.size
			if (maxValueRef.current === 0) return
			const currentValue = ((maxValueRef.current - size) / maxValueRef.current) * 100
			setValue(currentValue)
			if (size <= 1 && !hideTimeoutRef.current) {
				hideTimeoutRef.current = window.setTimeout(() => {
					setOpacity(0)
				}, 300)
			}
		})
	}

	useEventBusSubscribe['richEditor/mentionRender/onStart']({
		callback: () => {
			maxValueRef.current = Math.max(maxValueRef.current, elementsRendering.current.size)
			if (elementsRendering.current.size > 20 && !triggeredRef.current) {
				triggeredRef.current = true
				requestAnimationFrame(() => {
					setOpacity(1)
				})
			}
			scheduleProgressUpdate()
		},
	})

	const hideTimeoutRef = useRef<number | null>(null)
	useEventBusSubscribe['richEditor/mentionRender/onEnd']({
		callback: () => {
			scheduleProgressUpdate()
		},
	})
	if (elementsRendering.current.size === 0 && !hideTimeoutRef.current && opacity > 0) {
		hideTimeoutRef.current = window.setTimeout(() => {
			setOpacity(0)
		}, 300)
	}

	return (
		<LinearProgress
			value={value}
			variant="determinate"
			sx={{
				marginTop: 0.5,
				marginLeft: 1,
				marginRight: 1,
				borderRadius: 4,
				opacity: opacity,
				transition: 'opacity .2s ease-out',
				'& .MuiLinearProgress-bar': { transition: 'transform .1s linear' },
			}}
		/>
	)
}
