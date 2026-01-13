import { Icon } from '@iconify/react'
import { IconifyInfo } from '@iconify/types'
import FavoriteIcon from '@mui/icons-material/Favorite'
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Input from '@mui/material/Input'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { memo, useState } from 'react'
import { useCallback } from 'react'

import { useDebounce } from '@/app/hooks/useDebounce'
import { useEffectOnce } from '@/app/utils/useEffectOnce'

import { useIconifySearch } from './useIconifySearch'

export const IconPicker = memo(IconPickerComponent)

type Props = {
	color: string
	defaultQuery: string
	onSelect: (icon: string) => void
}

export function IconPickerComponent({ defaultQuery, ...props }: Props) {
	const baseQuery =
		defaultQuery === 'default'
			? 'leaf'
			: defaultQuery.includes(':')
				? defaultQuery.split(':')[1]
				: defaultQuery
	const [query, setQuery] = useState(baseQuery)
	const { search, results } = useIconifySearch()

	const debouncedSearch = useDebounce(search, 300)

	const handleSearch = useCallback(
		(value: string) => {
			setQuery(value)
			debouncedSearch(value)
		},
		[debouncedSearch],
	)
	useEffectOnce(() => {
		handleSearch(baseQuery)
	})

	return (
		<Stack gap={2}>
			<Input value={query} onChange={(e) => handleSearch(e.target.value)} placeholder="Search icons..." />
			<Stack gap={1} direction="row" flexWrap="wrap">
				{results?.collections.map((collection) => (
					<Stack key={collection.name} spacing={1} width="calc(50% - 8px)">
						<IconCollection collection={collection} {...props} />
					</Stack>
				))}
			</Stack>
		</Stack>
	)
}

type CollectionProps = Omit<Props, 'defaultQuery'> & {
	collection: IconifyInfo & {
		icons: string[]
	}
}

function IconCollection({ collection, color, onSelect }: CollectionProps) {
	const [favorite, setFavorite] = useState(false)

	return (
		<>
			<Typography variant="h6">
				<span>{collection.name}</span>
				<Button sx={{ p: 0.25, minWidth: 0, marginLeft: 0.25 }} onClick={() => setFavorite(!favorite)}>
					{favorite && <FavoriteIcon />}
					{!favorite && <FavoriteBorderIcon />}
				</Button>
			</Typography>
			<Stack direction="row" flexWrap="wrap" gap={1}>
				{collection.icons.map((icon, index) => (
					<Button key={index} onClick={() => onSelect(icon)} sx={{ padding: 0.25, minWidth: 'auto' }}>
						<Box
							sx={{
								width: 36,
								height: 36,
								display: 'flex',
								alignItems: 'center',
								justifyContent: 'center',
							}}
						>
							<Icon color={color} icon={icon} width={36} height={36} ssr />
						</Box>
					</Button>
				))}
			</Stack>
		</>
	)
}
