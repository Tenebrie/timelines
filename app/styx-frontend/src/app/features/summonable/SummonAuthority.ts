export type SummonWaitingList = Record<
	string,
	{
		id: string
		target: HTMLElement
		props: unknown
	}[]
>

export type SummonRepository = Record<
	string,
	{
		id: string
		target: HTMLElement | null
		status: 'busy' | 'parked'
	}[]
>

declare global {
	interface Document {
		summonRepository: SummonRepository
		summonWaitingList: SummonWaitingList
	}
}

export function invokeSummonRepository() {
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
