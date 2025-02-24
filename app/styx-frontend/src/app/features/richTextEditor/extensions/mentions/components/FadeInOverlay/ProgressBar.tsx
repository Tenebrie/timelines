import LinearProgress from '@mui/material/LinearProgress'
import { Node as ProseMirrorNode } from '@tiptap/pm/model'
import { RefObject, useRef, useState } from 'react'
import { flushSync } from 'react-dom'

import { useEventBusSubscribe } from '@/app/features/eventBus'

type Props = {
	elementsRendering: RefObject<ProseMirrorNode[]>
}

export const ProgressBar = ({ elementsRendering }: Props) => {
	const [value, setValue] = useState(0)
	const [opacity, setOpacity] = useState(0)
	const triggeredRef = useRef(false)
	const maxValueRef = useRef(0)

	useEventBusSubscribe({
		event: 'richEditor/mentionRender/start',
		callback: ({ node }) => {
			maxValueRef.current = Math.max(maxValueRef.current, elementsRendering.current.length)
			if (maxValueRef.current === 0) {
				return
			}
			const currentValue =
				((maxValueRef.current - elementsRendering.current.length) / maxValueRef.current) * 100
			requestAnimationFrame(() =>
				flushSync(() => {
					setValue(currentValue)
				}),
			)
			if (elementsRendering.current.length > 20 && !triggeredRef.current) {
				triggeredRef.current = true
				requestAnimationFrame(() => {
					setOpacity(1)
				})
			}
		},
	})

	useEventBusSubscribe({
		event: 'richEditor/mentionRender/end',
		callback: ({ node }) => {
			if (maxValueRef.current === 0) {
				return
			}
			const currentValue =
				((maxValueRef.current - elementsRendering.current.length) / maxValueRef.current) * 100
			requestAnimationFrame(() => flushSync(() => setValue(currentValue)))
			if (elementsRendering.current.length === 0) {
				setTimeout(() => {
					setOpacity(0)
				}, 300)
			}
		},
	})

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
