// Please forgive me for all the sins I am about to commit

import { ElementType } from 'react'

export type PortalTypes = 'navigator/contextButton'

export type EventParams = {
	['navigator/contextButton']: void
}

declare global {
	interface Document {
		deliveryRepository: Partial<Record<PortalTypes, HTMLDivElement>>
		summonWaitingList: Record<string, HTMLElement[]>
		summonRepository: Record<
			string,
			{
				id: string
				Component: ElementType<{ id: string }>
				element: HTMLElement | null
				status: 'busy' | 'parked'
				onTouched: () => void
			}[]
		>
	}
}

export const PortalAuthority = {
	registerDeliveryTarget: (type: PortalTypes, node: HTMLDivElement) => {
		const repository = invokeDeliveryRepository()
		repository[type] = node
	},
	unregisterDeliveryTarget: (type: PortalTypes) => {
		const repository = invokeDeliveryRepository()
		delete repository[type]
	},
	findDeliveryTarget: (type: PortalTypes) => {
		const repository = invokeDeliveryRepository()
		return repository[type]
	},
}

function invokeDeliveryRepository() {
	if (!document.deliveryRepository) {
		document.deliveryRepository = {}
	}

	return document.deliveryRepository
}

export function invokeSummoningRepository() {
	if (!document.summonRepository) {
		document.summonRepository = {}
	}

	return document.summonRepository
}

export function invokeSummonWaitingList() {
	if (!document.summonWaitingList) {
		document.summonWaitingList = {}
	}

	return document.summonWaitingList
}
