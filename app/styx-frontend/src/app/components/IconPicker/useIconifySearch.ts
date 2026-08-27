import { useGetFavoriteIconsQuery } from '@api/favoriteIconsApi'
import { GetIconifyIconsResponse, useGetIconifyIconsQuery } from '@api/iconify/iconifyApi'
import { IconCollection } from '@api/types/iconTypes'
import { useCallback, useEffect, useState } from 'react'

type ParsedResult = {
	collections: (IconCollection & { favorite: boolean })[]
}

type Props = {
	query: string
}

export function useIconifySearch({ query }: Props) {
	const parseResult = useParseResult()
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
	}, [data, parseResult])

	return { results }
}

function useParseResult() {
	const { data: favorites, isLoading } = useGetFavoriteIconsQuery()

	return useCallback(
		(data: GetIconifyIconsResponse): ParsedResult => {
			if (isLoading) {
				return { collections: [] }
			}

			function isFavorite(iconSetId: string) {
				return favorites?.iconSets?.some((set) => set.id === iconSetId) ?? false
			}

			const collections: ParsedResult['collections'] = []

			for (const [key, value] of Object.entries(data.collections)) {
				collections.push({
					...value,
					id: key,
					count: data.icons.length,
					icons: data.icons.filter((icon) => icon.startsWith(`${key}:`)),
					procedural: false,
					favorite: isFavorite(key),
				})
			}
			collections.sort((a, b) => Number(b.favorite) - Number(a.favorite) || b.icons.length - a.icons.length)

			return { collections }
		},
		[favorites?.iconSets, isLoading],
	)
}
