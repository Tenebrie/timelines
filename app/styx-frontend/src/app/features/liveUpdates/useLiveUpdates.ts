import { useCallback, useMemo, useRef } from 'react'
import { useDispatch } from 'react-redux'

import { CalliopeToClientMessage } from '../../../ts-shared/CalliopeToClientMessage'
import { useEffectOnce } from '../../utils/useEffectOnce'
import { authSlice } from '../auth/reducer'
import { useLiveMessageHandlers } from './useLiveMessageHandlers'

const expBackoffDelays = [50, 1000, 10000, 30000]

export const useLiveUpdates = () => {
	const currentWebsocket = useRef<WebSocket>()
	const heartbeatInterval = useRef<number | null>(null)
	const backoffLevel = useRef<number>(-1)

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
			const socket = new WebSocket(`${protocol}//${window.location.host}/live`)

			heartbeatInterval.current = window.setInterval(() => {
				if (currentWebsocket.current?.readyState !== WebSocket.OPEN) {
					return
				}
				socket.send('keepalive')
			}, 15000)

			socket.onopen = function () {
				console.info('[ws] Connection established!')
				dispatch(hideCalliopeConnectionAlert())
				socket.send('init')
				backoffLevel.current = -1
			}

			socket.onmessage = function (event) {
				const message = JSON.parse(event.data) as CalliopeToClientMessage
				messageHandlers[message.type](message.data)
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
	}, [clearHeartbeat, dispatch, hideCalliopeConnectionAlert, messageHandlers, showCalliopeConnectionAlert])

	useEffectOnce(() => initiateConnection())
}
