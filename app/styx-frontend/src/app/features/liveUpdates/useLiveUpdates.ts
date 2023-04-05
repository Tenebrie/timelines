import { useRef } from 'react'
import { useDispatch } from 'react-redux'

import { rheaApi } from '../../../api/rheaApi'
import { useEffectOnce } from '../../utils/useEffectOnce'

export const useLiveUpdates = () => {
	const currentWebsocket = useRef<WebSocket>()
	const heartbeatInterval = useRef<number | null>(null)
	const dispatch = useDispatch()

	useEffectOnce(() => {
		if (
			currentWebsocket.current &&
			(currentWebsocket.current.readyState === currentWebsocket.current.CONNECTING ||
				currentWebsocket.current.readyState === currentWebsocket.current.OPEN)
		) {
			return
		}

		if (heartbeatInterval.current !== null) {
			window.clearInterval(heartbeatInterval.current)
		}

		const socket = new WebSocket(`ws://${window.location.host}/live`)

		heartbeatInterval.current = window.setInterval(() => {
			console.log('poke')
			socket.send('poke')
		}, 15000)

		socket.onopen = function () {
			console.log('[ws] Connection established')
			socket.send('init')
		}

		socket.onmessage = function (event) {
			console.log(`[message] Data received from server: ${event.data}`)

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
				console.log(`[close] Connection closed cleanly, code=${event.code} reason=${event.reason}`)
			} else {
				// e.g. server process killed or network down
				// event.code is usually 1006 in this case
				console.log('[close] Connection died')
			}
		}

		socket.onerror = function (error) {
			console.log(`[error]`, error)
		}

		currentWebsocket.current = socket
	})
}
