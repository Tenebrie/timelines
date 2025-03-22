import { createSlice, PayloadAction } from '@reduxjs/toolkit'

import { PortalAuthority, PortalTypes } from '../summonable/SummonAuthority'

export const initialState = {
	deliveryTargets: {
		'navigator/contextButton': { key: null as string | null },
	} satisfies Record<PortalTypes, { key: string | null }>,
}

export const portalSlice = createSlice({
	name: 'portal',
	initialState,
	reducers: {
		registerDeliveryTarget: (
			state,
			{ payload }: PayloadAction<{ type: PortalTypes; node: HTMLDivElement }>,
		) => {
			const key = Math.random().toString(36).substring(2, 15)
			PortalAuthority.registerDeliveryTarget(payload.type, payload.node)
			state.deliveryTargets[payload.type].key = key
		},
		unregisterDeliveryTarget: (state, { payload }: PayloadAction<{ type: PortalTypes }>) => {
			PortalAuthority.unregisterDeliveryTarget(payload.type)
			state.deliveryTargets[payload.type].key = null
		},
		findDeliveryTarget: (
			_,
			{ payload }: PayloadAction<{ type: PortalTypes; onFound: (node: HTMLDivElement) => void }>,
		) => {
			const node = PortalAuthority.findDeliveryTarget(payload.type)
			if (node) {
				payload.onFound(node)
			}
		},
	},
})

export type PortalState = typeof initialState
export const portalInitialState = initialState
export const PortalReducer = portalSlice.reducer
