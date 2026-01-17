import { useGetCommonWorldEventIconsQuery } from '@api/worldDetailsApi'
import Divider from '@mui/material/Divider'
import Stack from '@mui/material/Stack'
import { memo, useState } from 'react'
import { useSelector } from 'react-redux'

import { getWorldIdState } from '@/app/views/world/WorldSliceSelectors'

import { IconCollection } from './components/IconCollection'
import { IconSearchInput } from './components/IconSearchInput'
import { useIconifySearch } from './useIconifySearch'

export const IconPicker = memo(IconPickerComponent)

type Props = {
	color: string
	defaultQuery: string
	onSelect: (icon: string) => void
}

export function IconPickerComponent(props: Props) {
	const worldId = useSelector(getWorldIdState)
	const [query, setQuery] = useState('')

	const { results } = useIconifySearch({ query })
	const { data: commonEventIcons } = useGetCommonWorldEventIconsQuery({ worldId })
	const shownFavoriteSets = query.length > 0 ? results?.collections.filter((set) => set.favorite) : []
	const shownOtherSets =
		query.length > 0 ? results?.collections.filter((set) => !set.favorite) : commonEventIcons?.collections

	return (
		<Stack gap={2}>
			<IconSearchInput onQueryChange={setQuery} />
			{shownFavoriteSets && shownFavoriteSets.length > 0 && (
				<>
					<Stack gap={1} direction="row" flexWrap="wrap">
						{shownFavoriteSets?.map((collection) => (
							<Stack key={collection.id} spacing={1} width="calc(50% - 8px)">
								<IconCollection collection={collection} {...props} />
							</Stack>
						))}
					</Stack>
					<Divider />
				</>
			)}
			<Stack gap={1} direction="row" flexWrap="wrap">
				{shownOtherSets?.map((collection) => (
					<Stack key={collection.id} spacing={1} width="calc(50% - 8px)">
						<IconCollection collection={collection} {...props} />
					</Stack>
				))}
			</Stack>
		</Stack>
	)
}
