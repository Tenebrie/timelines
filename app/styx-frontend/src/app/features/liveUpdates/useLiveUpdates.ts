import { useCallback, useEffect, useMemo, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import type { CalliopeToWebsocketMessage } from '../../../../../calliope-websockets/src/types/calliopeToWebsocket'
import {
	WebsocketToCalliopeChannel,
	WebsocketToCalliopeMessage,
} from '../../../../../shared/src/types/websocketToCalliope'
import { useEffectOnce } from '../../utils/useEffectOnce'
import { getWorldState } from '../world/selectors'
import { getMessageReceiver } from './messageReceivers'

const expBackoffDelays = [5, 100, 1000, 5000]

export const useLiveUpdates = () => {
	const currentWebsocket = useRef<WebSocket>()
	const heartbeatInterval = useRef<number | null>(null)
	const backoffLevel = useRef<number>(-1)
	const updatedAtRef = useRef<string>('0')
	const dispatch = useDispatch()

	const { updatedAt: currentUpdatedAt } = useSelector(getWorldState)

	useEffect(() => {
		updatedAtRef.current = currentUpdatedAt
	}, [currentUpdatedAt])

	const { processMessage } = useMemo(() => {
		const messageReceiver = getMessageReceiver({ dispatch, updatedAtRef })

		const processMessage = (message: string) => {
			const payload = JSON.parse(message) as CalliopeToWebsocketMessage
			messageReceiver[payload.channel](payload.data)
		}

		return {
			processMessage,
		}
	}, [dispatch])

	const clearHeartbeat = useCallback(() => {
		if (heartbeatInterval.current !== null) {
			window.clearInterval(heartbeatInterval.current)
		}
	}, [])

	const send = useCallback((message: WebsocketToCalliopeMessage) => {
		if (currentWebsocket.current?.readyState !== WebSocket.OPEN) {
			return
		}

		currentWebsocket.current.send(JSON.stringify(message))
	}, [])

	const { initiateConnection } = useMemo(() => {
		const reconnect = () => {
			backoffLevel.current += 1
			const delay = expBackoffDelays[backoffLevel.current] ?? 10000
			console.info(`[ws] Waiting ${delay}ms before attempting to reconnect...`)
			setTimeout(() => {
				initiateConnection()
			}, delay)
		}

		const initiateConnection = () => {
			if (
				currentWebsocket.current &&
				(currentWebsocket.current.readyState === currentWebsocket.current.CONNECTING ||
					currentWebsocket.current.readyState === currentWebsocket.current.OPEN)
			) {
				return
			}

			console.info('[ws] Attempting connection...')
			clearHeartbeat()

			const protocol = window.location.protocol === 'http:' ? 'ws:' : 'wss:'
			const socket = new WebSocket(`${protocol}//${window.location.host}/live`)

			heartbeatInterval.current = window.setInterval(() => {
				send({
					channel: WebsocketToCalliopeChannel.KEEPALIVE,
					data: null,
				})
			}, 15000)

			socket.onopen = function () {
				console.info('[ws] Connection established!')
				send({
					channel: WebsocketToCalliopeChannel.INIT,
					data: null,
				})
				backoffLevel.current = -1
			}

			socket.onmessage = function (event) {
				processMessage(event.data)
			}

			socket.onclose = function (event) {
				if (event.wasClean) {
					console.info(`[ws] Connection closed cleanly, code=${event.code} reason=${event.reason}`)
				} else {
					console.error('[ws] Connection lost. Reconnecting...')
				}
				clearHeartbeat()
				reconnect()
			}

			socket.onerror = function (error) {
				console.error(`[ws]`, error)
			}

			currentWebsocket.current = socket
		}

		return { initiateConnection }
	}, [clearHeartbeat, processMessage, send])

	useEffectOnce(() => initiateConnection())

	return {
		send,
	}
}
