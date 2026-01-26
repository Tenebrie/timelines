import { docs } from '@y/websocket-server/utils'
import * as Y from 'yjs'

import { RedisService } from './RedisService.js'

const attachedDocs = new WeakSet<Y.Doc>()
const UPDATE_MESSAGE_ORIGIN = 'calliope-internal'

export type YjsUpdateMessage = {
	docName: string
	update: string
}

export const YjsSyncService = {
	handleMessage(message: YjsUpdateMessage) {
		const { docName, update } = message
		const doc = docs.get(docName)
		if (doc) {
			Y.applyUpdate(doc, Buffer.from(update, 'base64'), UPDATE_MESSAGE_ORIGIN)
		}
	},

	setupDocumentListener(docName: string) {
		const doc = docs.get(docName)
		if (!doc) {
			console.warn(`Cannot attach Redis sync: document ${docName} not found`)
			return
		}

		if (attachedDocs.has(doc)) {
			console.info('Document ' + docName + ' already has Redis sync listener attached')
			return
		}

		doc.on('update', (update: Uint8Array, origin: unknown) => {
			if (origin === UPDATE_MESSAGE_ORIGIN) {
				return
			}
			RedisService.broadcastYjsDocumentUpdate({
				docName,
				update: Buffer.from(update).toString('base64'),
			})
		})
		attachedDocs.add(doc)
	},
}
