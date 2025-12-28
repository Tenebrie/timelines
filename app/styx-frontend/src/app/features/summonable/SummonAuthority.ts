// Please forgive me for all the sins I am about to commit

declare global {
	interface Document {
		summonWaitingList: Record<string, { target: HTMLElement; props: unknown }[]>
		summonRepository: Record<
			string,
			{
				target: HTMLElement | null
				status: 'busy' | 'parked'
			}[]
		>
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
