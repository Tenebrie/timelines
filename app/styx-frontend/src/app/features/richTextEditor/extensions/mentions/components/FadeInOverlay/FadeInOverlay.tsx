import { Node as ProseMirrorNode } from '@tiptap/pm/model'
import { useEffect, useRef } from 'react'

import { useEventBusSubscribe } from '@/app/features/eventBus'
import { useCustomTheme } from '@/app/features/theming/hooks/useCustomTheme'

import { createCubicBezier } from './createCubicBezier'
import { ProgressBar } from './ProgressBar'

type Props = {
	content: string
	isReadMode: boolean
}

export const FadeInOverlay = ({ content, isReadMode }: Props) => {
	const theme = useCustomTheme()

	const ref = useRef<HTMLDivElement | null>(null)
	const inProgress = useRef(false)
	const capHitRef = useRef(false)

	const elementsRendering = useRef<ProseMirrorNode[]>([])
	const progressElementsRendering = useRef<ProseMirrorNode[]>([])
	const waitForRenderTimeoutRef = useRef<number | null>(null)

	useEventBusSubscribe({
		event: 'richEditor/mentionRender/onStart',
		callback: ({ node }) => {
			if (!progressElementsRendering.current.includes(node)) {
				progressElementsRendering.current.push(node)
			}
			if (capHitRef.current) {
				return
			}
			if (!elementsRendering.current.includes(node)) {
				elementsRendering.current.push(node)
			}
			if (elementsRendering.current.length > 50) {
				capHitRef.current = true
			}
		},
	})

	useEventBusSubscribe({
		event: 'richEditor/mentionRender/onEnd',
		callback: ({ node }) => {
			elementsRendering.current = elementsRendering.current.filter((element) => element !== node)
			progressElementsRendering.current = progressElementsRendering.current.filter(
				(element) => element !== node,
			)
		},
	})

	useEffect(() => {
		if (inProgress.current) {
			return
		}
		let startTime: number = 0
		const duration = 500 // duration in ms
		const easing = createCubicBezier(0.4, 0, 0.2, 1)

		const animate = (timestamp: number) => {
			if (!startTime) {
				startTime = timestamp
			}

			const elapsed = timestamp - startTime
			const progress = Math.min(elapsed / duration, 1.2)
			const easedProgress = easing(progress)

			ref.current?.style.setProperty('--grad-start', `${Math.max(0, easedProgress - 0.2) * 1.2 * 100}%`)
			ref.current?.style.setProperty('--grad-end', `${easedProgress * 1.4 * 100}%`)

			if (progress < 1.2) {
				requestAnimationFrame(animate)
			} else {
				ref.current?.style.setProperty('--grad-start', `100%`)
				ref.current?.style.setProperty('--grad-end', `100%`)
			}
		}

		const b = requestIdleCallback(
			() => {
				inProgress.current = true
				requestAnimationFrame(animate)
				if (waitForRenderTimeoutRef.current) {
					clearInterval(waitForRenderTimeoutRef.current)
				}
			},
			{ timeout: 500 },
		)

		return () => {
			cancelIdleCallback(b)
		}
	}, [])

	const height = isReadMode ? 'calc(100%)' : 'calc(100% - 52px)'
	const width = isReadMode ? 'calc(100%)' : 'calc(100% - 8px)'

	return (
		<>
			<style>{`
				.overlay {
					--grad-start: 0%;
					--grad-end: 0%;
					 
					background: linear-gradient(
						to bottom,
						transparent var(--grad-start),
						${theme.custom.palette.background.textEditorBackground} var(--grad-end),
						${theme.custom.palette.background.textEditorBackground} 100%
					);
				}
			`}</style>
			<div
				ref={ref}
				className="overlay"
				style={{
					display: content.length === 0 ? 'none' : 'block',
					pointerEvents: 'none',
					position: 'absolute',
					top: 52,
					left: 0,
					width,
					height,
					borderRadius: 6,
				}}
			>
				<ProgressBar elementsRendering={progressElementsRendering} />
			</div>
		</>
	)
}
