import { useEffect, useState } from 'react'
import { WebsocketProvider } from 'y-websocket'
import * as Y from 'yjs'

import { createCollaborationExtension, createCollaborationProvider } from './CollaborationExtension'

type UseCollaborationParams = {
	worldId: string
	documentId: string
	enabled: boolean
}

/**
 * Hook to manage Yjs collaboration for a document
 * Returns the Collaboration extension to add to Tiptap editor
 */
export const useCollaboration = ({ worldId, documentId, enabled }: UseCollaborationParams) => {
	const [doc, setDoc] = useState<Y.Doc | null>(null)
	const [provider, setProvider] = useState<WebsocketProvider | null>(null)
	const [extension, setExtension] = useState<ReturnType<typeof createCollaborationExtension> | null>(null)
	const [isReady, setIsReady] = useState(false)

	useEffect(() => {
		if (!enabled) {
			setIsReady(true)
			return
		}

		// Create Yjs doc and WebSocket provider
		const { doc: yjsDoc, provider: wsProvider } = createCollaborationProvider(worldId, documentId)
		setDoc(yjsDoc)
		setProvider(wsProvider)

		const onSync = (isSynced: boolean) => {
			if (isSynced) {
				setIsReady(true)
			}
		}

		wsProvider.on('sync', onSync)

		// Create Tiptap extension
		const collaborationExtension = createCollaborationExtension(yjsDoc)
		setExtension(collaborationExtension)

		// Cleanup on unmount
		return () => {
			wsProvider.off('sync', onSync)
			wsProvider.disconnect()
			wsProvider.destroy()
			yjsDoc.destroy()
			setIsReady(false)
		}
	}, [worldId, documentId, enabled])

	return { doc, provider, extension, isReady }
}
