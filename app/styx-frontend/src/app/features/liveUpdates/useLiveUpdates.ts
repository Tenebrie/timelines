import { useCallback, useEffect, useMemo, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import { rheaApi } from '../../../api/rheaApi'
import { useEffectOnce } from '../../utils/useEffectOnce'
import { getWorldState } from '../world/selectors'

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

	const processMessage = useCallback(
		(message: string) => {
			const payload = JSON.parse(message) as {
				type: 'worldUpdate'
				data: unknown
			}
			if (payload.type === 'worldUpdate') {
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
				socket.send('poke')
			}, 15000)

			socket.onopen = function () {
				console.info('[ws] Connection established!')
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
				clearHeartbeat()
				reconnect()
			}

			socket.onerror = function (error) {
				console.error(`[ws]`, error)
			}

			currentWebsocket.current = socket
		}

		return { initiateConnection }
	}, [clearHeartbeat, processMessage])

	useEffectOnce(() => initiateConnection())
}
