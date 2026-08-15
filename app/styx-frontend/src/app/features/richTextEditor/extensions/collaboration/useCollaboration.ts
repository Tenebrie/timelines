import { useCallback, useEffect, useRef, useState } from 'react'
import { useSelector } from 'react-redux'
import { WebsocketProvider } from 'y-websocket'
import * as Y from 'yjs'

import { useEventBusSubscribe } from '@/app/features/eventBus'
import { getWorldIdState } from '@/app/views/world/WorldSliceSelectors'

import { createCollaborationExtension, createCollaborationProvider } from './CollaborationExtension'

type UseCollaborationParams = {
	entityType: 'actor' | 'event' | 'article'
	documentId: string
	enabled: boolean
}

type DocState = {
	key: string
	doc: Y.Doc | null
	extension: ReturnType<typeof createCollaborationExtension> | null
}

type ConnectionState = {
	doc: Y.Doc
	provider: WebsocketProvider
	key: string
	disableReconnect: () => void
}

export const useCollaboration = ({ entityType, documentId, enabled }: UseCollaborationParams) => {
	const worldId = useSelector(getWorldIdState)
	const [isReady, setIsReady] = useState(!enabled)
	const connectionRef = useRef<ConnectionState | null>(null)
	const cleanupTimeoutRef = useRef<number | null>(null)
	const [generation, setGeneration] = useState(0)

	const key = enabled ? `${worldId}:${entityType}:${documentId}:${generation}` : ''

	// Create the doc and extension synchronously so the editor mounts with collaboration already attached
	const [docState, setDocState] = useState<DocState>(() => createDocState(key))
	if (docState.key !== key) {
		setDocState(createDocState(key))
		if (isReady) {
			setIsReady(false)
		}
	}

	const resetConnection = useCallback(() => {
		if (connectionRef.current) {
			destroyConnection(connectionRef.current)
			connectionRef.current = null
			setIsReady(false)
		}
		setGeneration((c) => c + 1)
	}, [])

	useEventBusSubscribe['calliope/documentReset']({
		condition: (data) => data.entityId === documentId,
		callback: resetConnection,
	})

	useEffect(() => {
		const doc = docState.doc
		if (!enabled || !doc) {
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
		const { provider, disableReconnect } = createCollaborationProvider({
			doc,
			worldId,
			entityType,
			documentId,
			onReconnect: resetConnection,
		})

		connectionRef.current = { doc, provider, key, disableReconnect }
		provider.on('sync', (synced: boolean) => {
			if (synced) {
				setIsReady(true)
			}
		})
		provider.on('status', (data) => {
			if (data.status === 'disconnected') {
				setIsReady(false)
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
	}, [key, enabled, worldId, entityType, documentId, resetConnection, docState])

	return {
		doc: docState.doc,
		provider: connectionRef.current?.provider ?? null,
		extension: docState.extension,
		isReady,
	}
}

function createDocState(key: string): DocState {
	if (!key) {
		return { key, doc: null, extension: null }
	}
	const doc = new Y.Doc()
	return { key, doc, extension: createCollaborationExtension(doc) }
}

function destroyConnection({ doc, provider, disableReconnect }: ConnectionState) {
	console.info('[yjs] Destroying document')
	disableReconnect()
	provider.disconnect()
	provider.destroy()
	doc.destroy()
}
