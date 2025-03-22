// Please forgive me for all the sins I am about to commit

import { ElementType } from 'react'

declare global {
	interface Document {
		summonWaitingList: Record<string, { target: HTMLElement; props: unknown }[]>
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
