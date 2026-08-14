import throttle from 'lodash.throttle'
import { UIEvent, useLayoutEffect, useRef } from 'react'

import { getSavedScrollTop, saveScrollTop } from '../utils/documentScrollMemory'

const SAVE_THROTTLE_MS = 300

export function useDocumentScrollMemory(documentId: string | undefined, restoreKey: unknown) {
	const containerRef = useRef<HTMLDivElement | null>(null)

	const isRestoring = useRef(false)

	useLayoutEffect(() => {
		if (!documentId || !containerRef.current) {
			return
		}
		const target = getSavedScrollTop(documentId) ?? 0
		isRestoring.current = true
		containerRef.current.scrollTop = target

		const rafId = requestAnimationFrame(() => {
			if (containerRef.current) {
				containerRef.current.scrollTop = target
			}
			requestAnimationFrame(() => {
				isRestoring.current = false
			})
		})
		return () => cancelAnimationFrame(rafId)
	}, [documentId, restoreKey])

	const throttledSave = useRef(
		throttle((id: string, scrollTop: number) => {
			saveScrollTop(id, scrollTop)
		}, SAVE_THROTTLE_MS),
	).current

	const onScroll = (event: UIEvent<HTMLDivElement>) => {
		if (!documentId || isRestoring.current) {
			return
		}
		throttledSave(documentId, event.currentTarget.scrollTop)
	}

	return { containerRef, onScroll }
}
