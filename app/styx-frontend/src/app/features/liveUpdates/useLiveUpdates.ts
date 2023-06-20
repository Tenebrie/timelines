import { useCallback, useEffect, useMemo, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import { rheaApi } from '../../../api/rheaApi'
import { WORLD_UPDATE_NAME } from '../../../ts-shared/socketdef'
import { useEffectOnce } from '../../utils/useEffectOnce'
import { authSlice } from '../auth/reducer'
import { getWorldState } from '../world/selectors'

const expBackoffDelays = [50, 1000, 10000, 30000]

export const useLiveUpdates = () => {
	const currentWebsocket = useRef<WebSocket>()
	const heartbeatInterval = useRef<number | null>(null)
	const backoffLevel = useRef<number>(-1)
	const updatedAtRef = useRef<string>('0')

	const { showCalliopeConnectionAlert, hideCalliopeConnectionAlert } = authSlice.actions
	const dispatch = useDispatch()

	const { updatedAt: currentUpdatedAt } = useSelector(getWorldState)

	useEffect(() => {
		updatedAtRef.current = currentUpdatedAt
	}, [currentUpdatedAt])

	const processMessage = useCallback(
		(message: string) => {
			const payload = JSON.parse(message) as {
				type: typeof WORLD_UPDATE_NAME
				data: unknown
			}
			if (payload.type === WORLD_UPDATE_NAME) {
				const data = payload.data as {
					worldId: string
					timestamp: string
				}

				if (new Date(updatedAtRef.current) < new Date(data.timestamp)) {
					dispatch(rheaApi.util.invalidateTags(['worldDetails']))
				}
			}
		},
		[dispatch]
	)

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
				// console.info(`[ws] Data received from server: ${event.data}`)
				processMessage(event.data)
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
	}, [clearHeartbeat, dispatch, hideCalliopeConnectionAlert, processMessage, showCalliopeConnectionAlert])

	useEffectOnce(() => initiateConnection())
}
