import { Node as ProseMirrorNode } from '@tiptap/pm/model'
import { useEffect, useRef } from 'react'

import { useEventBusSubscribe } from '@/app/features/eventBus'

import { createCubicBezier } from './createCubicBezier'
import { ProgressBar } from './ProgressBar'

type Props = {
	color: string
	content: string
	isReadMode: boolean
	isLoading: boolean
}

export const FadeInOverlay = ({ content, isReadMode, color, isLoading }: Props) => {
	content = content ?? ''
	const ref = useRef<HTMLDivElement | null>(null)
	const inProgress = useRef(false)
	const capHitRef = useRef(false)

	const elementsRendering = useRef<Set<ProseMirrorNode>>(new Set())
	const progressElementsRendering = useRef<Set<ProseMirrorNode>>(new Set())
	const waitForRenderTimeoutRef = useRef<number | null>(null)

	useEventBusSubscribe['richEditor/mentionRender/onStart']({
		callback: ({ node }) => {
			progressElementsRendering.current.add(node)
			if (capHitRef.current) {
				return
			}
			elementsRendering.current.add(node)
			if (elementsRendering.current.size > 50) {
				capHitRef.current = true
			}
		},
	})

	useEventBusSubscribe['richEditor/mentionRender/onEnd']({
		callback: ({ node }) => {
			elementsRendering.current.delete(node)
			progressElementsRendering.current.delete(node)
		},
	})

	useEffect(() => {
		if (inProgress.current || isLoading) {
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
			{ timeout: 50 },
		)

		return () => {
			cancelIdleCallback(b)
		}
	}, [isLoading])

	const height = isReadMode ? 'calc(100% - 52px)' : 'calc(100% - 52px)'
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
						${color} var(--grad-end),
						${color} 100%
					);
				}
			`}</style>
			<div
				ref={ref}
				className="overlay"
				style={{
					display: content.length === 0 && !isLoading ? 'none' : 'block',
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
