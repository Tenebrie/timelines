const STORAGE_KEY = 'richTextEditor:scrollPositions'
const MAX_ENTRIES = 10

type ScrollEntry = {
	documentId: string
	scrollTop: number
}

function readEntries(): ScrollEntry[] {
	try {
		const raw = sessionStorage.getItem(STORAGE_KEY)
		return raw ? (JSON.parse(raw) as ScrollEntry[]) : []
	} catch {
		return []
	}
}

function writeEntries(entries: ScrollEntry[]) {
	try {
		sessionStorage.setItem(STORAGE_KEY, JSON.stringify(entries))
	} catch {
		// sessionStorage can not available
	}
}

export function getSavedScrollTop(documentId: string): number | undefined {
	return readEntries().find((entry) => entry.documentId === documentId)?.scrollTop
}

export function saveScrollTop(documentId: string, scrollTop: number) {
	const entries = readEntries().filter((entry) => entry.documentId !== documentId)
	entries.unshift({ documentId, scrollTop })
	writeEntries(entries.slice(0, MAX_ENTRIES))
}
