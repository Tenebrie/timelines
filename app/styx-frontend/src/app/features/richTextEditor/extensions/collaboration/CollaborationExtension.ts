import Collaboration from '@tiptap/extension-collaboration'
import { WebsocketProvider } from 'y-websocket'
import * as Y from 'yjs'

/**
 * Create Yjs WebSocket provider for real-time collaboration
 */
export const createCollaborationProvider = (worldId: string, entityType: string, documentId: string) => {
	const doc = new Y.Doc()

	// Connect to Calliope WebSocket server
	const provider = new WebsocketProvider(
		`${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}/live/yjs/${worldId}/${entityType}`,
		documentId,
		doc,
		{
			connect: true,
		},
	)

	const reconnectState = {
		timeout: null as number | null,
		reconnectCounter: 0,
	}
	provider.on('status', (event: { status: string }) => {
		if (event.status === 'disconnected') {
			// Attempt to reconnect
			reconnectState.reconnectCounter += 1
			if (reconnectState.reconnectCounter <= 3) {
				return
			}

			provider.disconnect()
			if (reconnectState.timeout) {
				window.clearTimeout(reconnectState.timeout)
			}
			reconnectState.timeout = window.setTimeout(() => {
				provider.connect()
				reconnectState.reconnectCounter = 0
			}, 2000)
		}
	})

	return { doc, provider }
}

/**
 * Create Tiptap Collaboration extension with Yjs document
 */
export const createCollaborationExtension = (doc: Y.Doc) => {
	return Collaboration.configure({
		document: doc,
	})
}
