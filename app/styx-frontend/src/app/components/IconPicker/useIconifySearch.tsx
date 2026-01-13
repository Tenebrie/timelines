import { IconifyInfo } from '@iconify/types'
import { useCallback, useState } from 'react'

type IconifyResult = {
	icons: string[]
	limit: number
	start: number
	total: number
	request: Record<string, string>
	collections: Record<string, IconifyInfo>
}

type ParsedResult = {
	collections: (IconifyInfo & { icons: string[] })[]
}

export function useIconifySearch() {
	const [results, setResults] = useState<ParsedResult | null>(null)

	const search = useCallback(async (query: string) => {
		if (!query || !query.trim()) {
			setResults(null)
			return
		}
		const apiTarget = 'https://api.iconify.design/'
		const t = new URL('/search', apiTarget)
		t.searchParams.set('query', query)

		const res = await fetch(t.toString())
		const data = (await res.json()) as IconifyResult

		setResults(parseResult(data))
	}, [])

	return { search, results }
}

function parseResult(data: IconifyResult): ParsedResult {
	const collections: ParsedResult['collections'] = []

	for (const [key, value] of Object.entries(data.collections)) {
		collections.push({
			...value,
			icons: data.icons.filter((icon) => icon.startsWith(`${key}:`)),
		})
	}

	collections.sort((a, b) => b.icons.length - a.icons.length)

	return { collections }
}
