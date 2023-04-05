import { useCallback, useMemo, useRef } from 'react'
import { useDispatch } from 'react-redux'

import { rheaApi } from '../../../api/rheaApi'
import { useEffectOnce } from '../../utils/useEffectOnce'

const expBackoffDelays = [5, 25, 100, 500, 1000, 2000, 5000]

export const useLiveUpdates = () => {
	const currentWebsocket = useRef<WebSocket>()
	const heartbeatInterval = useRef<number | null>(null)
	const backoffLevel = useRef<number>(-1)
	const dispatch = useDispatch()

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
				console.info('[ws] Attempting to reconnect...')
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
				console.info(`[ws] Data received from server: ${event.data}`)

				const payload = JSON.parse(event.data) as {
					type: 'worldUpdate'
					data: unknown
				}
				if (payload.type === 'worldUpdate') {
					const _data = payload.data as {
						worldId: string
						timestamp: string
					}

					dispatch(rheaApi.util.invalidateTags(['world']))
				}
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
	}, [clearHeartbeat, dispatch])
	console.log(currentWebsocket.current)

	useEffectOnce(() => initiateConnection())
}
