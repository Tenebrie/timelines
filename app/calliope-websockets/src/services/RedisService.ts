import { keysOf } from '@src/utils/keysOf'
import { createClient } from 'redis'

import { CalliopeToWebsocketChannel } from '../types/calliopeToWebsocket'
import {
	RheaToCalliopeChannel,
	RheaToCalliopeMessageData,
	RheaToCalliopeMessageReceiver,
} from '../types/rheaToCalliope'
import { WebsocketService } from './WebsocketService'

const client = createClient({
	socket: {
		host: 'redis',
	},
})

client.on('error', (err) => console.error('Redis Client Error', err))

const calliopeMessageHandlers: RheaToCalliopeMessageReceiver = {
	[RheaToCalliopeChannel.WORLD_UPDATED]: (data) => {
		WebsocketService.sendMessage(data.userId, {
			channel: CalliopeToWebsocketChannel.WORLD_UPDATED,
			data: {
				worldId: data.worldId,
				timestamp: data.timestamp,
			},
		})
	},
}

export const initRedisConnection = async () => {
	await client.connect()

	await Promise.all(
		keysOf(calliopeMessageHandlers).map((channel) => {
			client.subscribe(channel, (message) => {
				const parsedMessage = JSON.parse(message) as RheaToCalliopeMessageData[typeof channel]

				calliopeMessageHandlers[channel](parsedMessage)
			})
		})
	)
}
