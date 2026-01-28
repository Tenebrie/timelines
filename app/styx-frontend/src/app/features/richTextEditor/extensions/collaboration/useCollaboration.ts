import { useEffect, useRef, useState } from 'react'
import { useSelector } from 'react-redux'
import { WebsocketProvider } from 'y-websocket'
import * as Y from 'yjs'

import { getWorldIdState } from '@/app/views/world/WorldSliceSelectors'

import { createCollaborationExtension, createCollaborationProvider } from './CollaborationExtension'

type UseCollaborationParams = {
	entityType: 'actor' | 'event' | 'article'
	documentId: string
	enabled: boolean
}

type ConnectionState = {
	doc: Y.Doc
	provider: WebsocketProvider
	extension: ReturnType<typeof createCollaborationExtension>
	key: string
}

export const useCollaboration = ({ entityType, documentId, enabled }: UseCollaborationParams) => {
	const worldId = useSelector(getWorldIdState)
	const [isReady, setIsReady] = useState(!enabled)
	const connectionRef = useRef<ConnectionState | null>(null)
	const cleanupTimeoutRef = useRef<number | null>(null)

	const key = `${worldId}:${entityType}:${documentId}`

	useEffect(() => {
		if (!enabled) {
			setIsReady(true)
			return
		}

		// Cancel pending cleanup from Strict Mode's first unmount
		if (cleanupTimeoutRef.current !== null) {
			clearTimeout(cleanupTimeoutRef.current)
			cleanupTimeoutRef.current = null
		}

		// Reuse existing connection if params haven't changed
		if (connectionRef.current?.key === key) {
			return scheduleCleanup()
		}

		// Tear down old connection if params changed
		if (connectionRef.current) {
			destroyConnection(connectionRef.current)
		}

		// Create new connection
		setIsReady(false)
		const { doc, provider } = createCollaborationProvider(worldId, entityType, documentId)
		const extension = createCollaborationExtension(doc)

		connectionRef.current = { doc, provider, extension, key }
		provider.on('sync', (synced: boolean) => {
			if (synced) {
				setIsReady(true)
			}
		})

		return scheduleCleanup()

		function scheduleCleanup() {
			return () => {
				cleanupTimeoutRef.current = window.setTimeout(() => {
					if (connectionRef.current) {
						destroyConnection(connectionRef.current)
						connectionRef.current = null
						setIsReady(false)
					}
				}, 50)
			}
		}
	}, [key, enabled, worldId, entityType, documentId])

	return {
		doc: connectionRef.current?.doc ?? null,
		provider: connectionRef.current?.provider ?? null,
		extension: connectionRef.current?.extension ?? null,
		isReady,
	}
}

function destroyConnection({ doc, provider }: ConnectionState) {
	provider.disconnect()
	provider.destroy()
	doc.destroy()
}
