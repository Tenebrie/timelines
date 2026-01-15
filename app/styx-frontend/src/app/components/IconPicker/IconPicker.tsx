import { useGetCommonWorldEventIconsQuery } from '@api/worldDetailsApi'
import Input from '@mui/material/Input'
import Stack from '@mui/material/Stack'
import { memo } from 'react'
import { useSelector } from 'react-redux'

import { useDebouncedState } from '@/app/hooks/useDebouncedState'
import { getWorldIdState } from '@/app/views/world/WorldSliceSelectors'

import { IconCollection } from './components/IconCollection'
import { useIconifySearch } from './useIconifySearch'

export const IconPicker = memo(IconPickerComponent)

type Props = {
	color: string
	defaultQuery: string
	onSelect: (icon: string) => void
}

export function IconPickerComponent(props: Props) {
	const worldId = useSelector(getWorldIdState)
	const [query, currentQuery, setQuery] = useDebouncedState({
		initialValue: '',
	})
	const { results } = useIconifySearch({ query })
	const { data: commonEventIcons } = useGetCommonWorldEventIconsQuery({ worldId })
	const shownIcons = query.length > 0 ? results : commonEventIcons

	return (
		<Stack gap={2}>
			<Input value={currentQuery} onChange={(e) => setQuery(e.target.value)} placeholder="Search icons..." />
			<Stack gap={1} direction="row" flexWrap="wrap">
				{shownIcons?.collections.map((collection) => (
					<Stack key={collection.name} spacing={1} width="calc(50% - 8px)">
						<IconCollection collection={collection} {...props} />
					</Stack>
				))}
			</Stack>
		</Stack>
	)
}
