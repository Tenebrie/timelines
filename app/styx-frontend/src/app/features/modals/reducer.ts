import type { PayloadAction } from '@reduxjs/toolkit'
import { createSlice } from '@reduxjs/toolkit'
import { useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import { isEventObject } from '@/app/utils/isEventObject'

import { User } from '../auth/reducer'
import { ActorDetails, WorldEvent, WorldEventDelta, WorldEventTrack } from '../worldTimeline/types'

const modals = {
	/* Admin */
	deleteUserModal: {
		isOpen: false as boolean,
		targetUser: null as User | null,
	},

	/* Event Tracks */
	eventTrackWizard: {
		isOpen: false as boolean,
	},
	eventTrackEdit: {
		isOpen: false as boolean,
		target: null as WorldEventTrack | null,
	},

	/* World */
	actorWizard: {
		isOpen: false as boolean,
	},
	eventWizard: {
		isOpen: false as boolean,
		timestamp: 0 as number,
	},
	deleteActorModal: {
		isOpen: false as boolean,
		target: null as ActorDetails | null,
	},
	deleteEventModal: {
		isOpen: false as boolean,
		target: null as WorldEvent | null,
	},
	deleteEventDeltaModal: {
		isOpen: false as boolean,
		target: null as WorldEventDelta | null,
	},
	revokedStatementWizard: {
		isOpen: false as boolean,
		preselectedEventId: '' as string,
	},
	issuedActorStatementWizard: {
		isOpen: false as boolean,
		actor: null as ActorDetails | null,
	},
	timeTravelModal: {
		isOpen: false as boolean,
	},

	/* WorldList */
	worldWizardModal: {
		isOpen: false as boolean,
	},
	shareWorldModal: {
		isOpen: false as boolean,
		worldId: '' as string,
	},
	deleteWorldModal: {
		isOpen: false as boolean,
		worldId: '' as string,
		worldName: '' as string,
	},

	/* WorldWiki */
	articleWizard: {
		isOpen: false as boolean,
	},
	deleteArticleModal: {
		isOpen: false as boolean,
		articles: [] as string[],
	},
} as const

export const initialState = modals

type ValidModals = keyof typeof modals

export const modalsSlice = createSlice({
	name: 'modals',
	initialState,
	reducers: {
		openModal: <T extends StrongEntryOf<typeof modals>>(
			state: ModalsState,
			{ payload }: PayloadAction<{ id: T['id']; data: T['data'] }>,
		) => {
			state[payload.id] = {
				...state[payload.id],
				...payload.data,
				isOpen: true,
			}
		},

		closeModal: (state, { payload }: PayloadAction<{ id: ValidModals }>) => {
			state[payload.id].isOpen = false
		},
	},
})

export const useModal = <T extends ValidModals>(id: T) => {
	const state = useSelector((state: { modals: ModalsState }) => state.modals[id])
	const dispatch = useDispatch()
	const open = useCallback(
		(data: Omit<(typeof modals)[T], 'isOpen'>) => {
			const modalData = isEventObject(data) ? {} : data
			dispatch(
				modalsSlice.actions.openModal({
					id,
					data: {
						...modalData,
						isOpen: true,
					},
				}),
			)
		},
		[dispatch, id],
	)
	const close = useCallback(() => {
		dispatch(modalsSlice.actions.closeModal({ id }))
	}, [dispatch, id])

	return {
		open,
		close,
		...state,
	}
}

type StrongEntryOf<T> = {
	[K in keyof T]: {
		id: K
		data: T[K]
	}
}[keyof T]

export type ModalsState = typeof initialState
export const modalsInitialState = initialState
export default modalsSlice.reducer
