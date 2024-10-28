import { Search } from '@mui/icons-material'
import { Input, InputAdornment } from '@mui/material'
import debounce from 'lodash.debounce'
import { useRef, useState } from 'react'

type Props = {
	initialQuery: string
	onChange: (query: string) => void
}

export const SearchInput = ({ initialQuery, onChange }: Props) => {
	const [query, setQuery] = useState(initialQuery)

	const onQueryChange = (newQuery: string) => {
		setQuery(newQuery)
		emitQueryDebounced.current(newQuery)
	}

	const emitQueryDebounced = useRef(
		debounce((newQuery: string) => {
			onChange(newQuery)
		}, 500),
	)

	return (
		<Input
			value={query}
			onChange={(event) => onQueryChange(event.target.value)}
			placeholder="Search"
			startAdornment={
				<InputAdornment position="start">
					<Search />
				</InputAdornment>
			}
		/>
	)
}
