import Collaboration from '@tiptap/extension-collaboration'
import { WebsocketProvider } from 'y-websocket'
import * as Y from 'yjs'

/**
 * Create Yjs WebSocket provider for real-time collaboration
 */
export function createCollaborationProvider({
	worldId,
	entityType,
	documentId,
	onReconnect,
}: {
	worldId: string
	entityType: string
	documentId: string
	onReconnect: () => void
}) {
	const doc = new Y.Doc()

	// Connect to Calliope WebSocket server
	const provider = new WebsocketProvider(
		`${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}/live/yjs/${worldId}/${entityType}`,
		documentId,
		doc,
		{
			connect: false,
		},
	)

	const reconnectState = {
		timeout: null as number | null,
		reconnectCounter: 0,
		shouldReconnect: true,
	}
	provider.on('status', (event: { status: string }) => {
		if (event.status === 'connected' && reconnectState.timeout) {
			window.clearTimeout(reconnectState.timeout)
			reconnectState.timeout = null
			console.info('[yjs] Connection established!')
		}

		if (event.status === 'connecting' || event.status === 'disconnected') {
			if (!reconnectState.shouldReconnect) {
				return
			}
			if (reconnectState.timeout) {
				window.clearTimeout(reconnectState.timeout)
			}
			reconnectState.reconnectCounter += 1
			const delay = 500 * reconnectState.reconnectCounter + 500 + Math.random() * 1000
			reconnectState.timeout = window.setTimeout(() => {
				console.info(`[yjs] Waited ${Math.round(delay)}ms before reconnecting`)
				onReconnect()
				reconnectState.reconnectCounter = 0
			}, delay)
		}
	})

	console.info(`[yjs] Attempting connection to ${provider.url}...`)
	provider.connect()
	provider.shouldConnect = false

	function disableReconnect() {
		reconnectState.shouldReconnect = false
		if (reconnectState.timeout) {
			window.clearTimeout(reconnectState.timeout)
			reconnectState.timeout = null
		}
	}

	return { doc, provider, disableReconnect }
}

/**
 * Create Tiptap Collaboration extension with Yjs document
 */
export const createCollaborationExtension = (doc: Y.Doc) => {
	return Collaboration.configure({
		document: doc,
	})
}
