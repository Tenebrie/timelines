// Please forgive me for all the sins I am about to commit

export type PortalTypes = 'navigator/contextButton'

export type EventParams = {
	['navigator/contextButton']: void
}

declare global {
	interface Document {
		deliveryRepository: Partial<Record<PortalTypes, HTMLDivElement>>
		summoningRepository: Record<string, HTMLDivElement[]>
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

	registerSummonable: (type: PortalTypes, node: HTMLDivElement) => {
		const repository = invokeSummoningRepository()
		if (!repository[type]) {
			repository[type] = []
		}
		repository[type].push(node)
	},
	unregisterSummonable: (type: PortalTypes, node: HTMLDivElement) => {
		const repository = invokeSummoningRepository()
		if (!repository[type]) {
			return
		}
		repository[type] = repository[type].filter((n) => n !== node)
	},
	summon: (type: PortalTypes) => {
		const repository = invokeSummoningRepository()
		if (!repository[type]) {
			return
		}
		return repository[type].pop()
	},
}

function invokeDeliveryRepository() {
	if (!document.deliveryRepository) {
		document.deliveryRepository = {}
	}

	return document.deliveryRepository
}

function invokeSummoningRepository() {
	if (!document.summoningRepository) {
		document.summoningRepository = {}
	}

	return document.summoningRepository
}
