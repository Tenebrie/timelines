import React from 'react'
import { useDispatch } from 'react-redux'

import type { CalliopeToWebsocketMessageReceiver } from '../../../../../calliope-websockets/src/types/calliopeToWebsocket'
import { rheaApi } from '../../../api/rheaApi'

type Props = {
	dispatch: ReturnType<typeof useDispatch>
	updatedAtRef: React.MutableRefObject<string>
}

export const getMessageReceiver = ({
	dispatch,
	updatedAtRef,
}: Props): CalliopeToWebsocketMessageReceiver => ({
	worldUpdate: (data) => {
		if (new Date(updatedAtRef.current) < new Date(data.timestamp)) {
			dispatch(rheaApi.util.invalidateTags(['worldDetails']))
		}
	},
})
