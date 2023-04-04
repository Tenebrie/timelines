import { useRef } from 'react'
import { useDispatch } from 'react-redux'

import { rheaApi } from '../../../api/rheaApi'
import { useEffectOnce } from '../../utils/useEffectOnce'

export const useLiveUpdates = () => {
	const currentWebsocket = useRef<WebSocket>()
	const dispatch = useDispatch()

	useEffectOnce(() => {
		const socket = new WebSocket(`ws://${window.location.host}/live`)

		socket.onopen = function (e) {
			console.log('[open] Connection established')
			console.log('Sending to server')
			socket.send('init')
		}

		socket.onmessage = function (event) {
			console.log(`[message] Data received from server: ${event.data}`)

			const payload = JSON.parse(event.data) as {
				type: 'worldUpdate'
				data: unknown
			}
			if (payload.type === 'worldUpdate') {
				const data = payload.data as {
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
			console.log(`[error]`)
		}

		currentWebsocket.current = socket
	})
}
