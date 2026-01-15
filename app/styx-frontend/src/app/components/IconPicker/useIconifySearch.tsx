import { GetIconifyIconsResponse, useGetIconifyIconsQuery } from '@api/iconify/iconifyApi'
import { IconifyInfo } from '@iconify/types'
import { useEffect, useState } from 'react'

type ParsedResult = {
	collections: (IconifyInfo & { icons: string[] })[]
}

type Props = {
	query: string
}

export function useIconifySearch({ query }: Props) {
	const [results, setResults] = useState<ParsedResult | null>(null)
	const { data } = useGetIconifyIconsQuery(
		{
			query,
		},
		{
			skip: query.trim().length === 0,
		},
	)

	useEffect(() => {
		if (data) {
			setResults(parseResult(data))
		}
	}, [data])

	return { results }
}

function parseResult(data: GetIconifyIconsResponse): ParsedResult {
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
