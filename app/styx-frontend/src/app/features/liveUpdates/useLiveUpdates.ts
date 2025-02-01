import { useCallback, useEffect, useMemo, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import { CalliopeToClientMessage } from '@/ts-shared/CalliopeToClientMessage'
import { ClientToCalliopeMessage, ClientToCalliopeMessageType } from '@/ts-shared/ClientToCalliopeMessage'

import { authSlice } from '../auth/reducer'
import { getAuthState } from '../auth/selectors'
import { useEventBusDispatch, useEventBusSubscribe } from '../eventBus'
import { useLiveMessageHandlers } from './useLiveMessageHandlers'

const expBackoffDelays = [50, 1000, 2000, 3000, 4000, 5000, 6000, 7000, 8000, 9000, 10000]

export const useLiveUpdates = () => {
	const { sessionId } = useSelector(getAuthState)

	const currentWebsocket = useRef<WebSocket | null>(null)
	const heartbeatInterval = useRef<number | null>(null)
	const backoffLevel = useRef<number>(-1)
	useEventBusSubscribe({
		event: 'sendCalliopeMessage',
		callback: (message) => {
			if (currentWebsocket.current?.readyState === WebSocket.OPEN) {
				currentWebsocket.current?.send(JSON.stringify(message))
			}
		},
	})
	const notifyAboutReconnect = useEventBusDispatch({ event: 'calliopeReconnected' })

	const { showCalliopeConnectionAlert, hideCalliopeConnectionAlert } = authSlice.actions
	const dispatch = useDispatch()

	const messageHandlers = useLiveMessageHandlers()

	const clearHeartbeat = useCallback(() => {
		if (heartbeatInterval.current !== null) {
			window.clearInterval(heartbeatInterval.current)
		}
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
			const socket = new WebSocket(`${protocol}//${window.location.host}/live/${sessionId}`)

			heartbeatInterval.current = window.setInterval(() => {
				if (currentWebsocket.current?.readyState !== WebSocket.OPEN) {
					return
				}
				const message: ClientToCalliopeMessage = {
					type: ClientToCalliopeMessageType.KEEPALIVE,
					data: {},
				}
				socket.send(JSON.stringify(message))
			}, 15000)

			socket.onopen = function () {
				console.info('[ws] Connection established!')
				dispatch(hideCalliopeConnectionAlert())
				const message: ClientToCalliopeMessage = {
					type: ClientToCalliopeMessageType.INIT,
					data: {},
				}
				socket.send(JSON.stringify(message))
				backoffLevel.current = -1
				notifyAboutReconnect()
			}

			socket.onmessage = function (event) {
				const message = JSON.parse(event.data) as CalliopeToClientMessage
				// TODO: The data is guaranteed to be correct, but fix typings
				if (messageHandlers.current) {
					messageHandlers.current[message.type](message.data as never)
				}
			}

			socket.onclose = function (event) {
				if (event.wasClean) {
					console.info(`[ws] Connection closed cleanly, code=${event.code} reason=${event.reason}`)
				} else {
					console.error('[ws] Connection lost. Reconnecting...')
				}
				dispatch(showCalliopeConnectionAlert())
				clearHeartbeat()
				reconnect()
			}

			socket.onerror = function (error) {
				console.error(`[ws]`, error)
			}

			currentWebsocket.current = socket
		}

		return { initiateConnection }
	}, [
		clearHeartbeat,
		dispatch,
		hideCalliopeConnectionAlert,
		messageHandlers,
		notifyAboutReconnect,
		sessionId,
		showCalliopeConnectionAlert,
	])

	useEffect(() => {
		if (!sessionId) {
			return
		}
		initiateConnection()
	}, [initiateConnection, sessionId])
}
