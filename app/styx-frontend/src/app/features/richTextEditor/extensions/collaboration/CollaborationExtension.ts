import Collaboration from '@tiptap/extension-collaboration'
import { WebsocketProvider } from 'y-websocket'
import * as Y from 'yjs'

/**
 * Create Yjs WebSocket provider for real-time collaboration
 */
export const createCollaborationProvider = (worldId: string, documentId: string) => {
	const doc = new Y.Doc()

	// Connect to Calliope WebSocket server
	const provider = new WebsocketProvider(
		`${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}/live/yjs/${worldId}`,
		documentId,
		doc,
		{
			connect: true,
		},
	)

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
