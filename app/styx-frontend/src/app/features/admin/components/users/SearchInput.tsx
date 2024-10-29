import { Clear, Search } from '@mui/icons-material'
import { FormControl, IconButton, InputAdornment, InputLabel, OutlinedInput, Stack } from '@mui/material'

import { useDebouncedState } from '../../../../../hooks/useDebouncedState'

type Props = {
	initialQuery: string
	onChange: (query: string) => void
}

export const SearchInput = ({ initialQuery, onChange }: Props) => {
	const [query, setQuery, setQueryInstant] = useDebouncedState({
		initialValue: initialQuery,
		onDebounce: onChange,
	})

	return (
		<Stack direction="row">
			<FormControl variant="outlined" size="small">
				<InputLabel htmlFor="adminUserListSearch">Search</InputLabel>
				<OutlinedInput
					id="adminUserListSearch"
					label="Search"
					value={query}
					onChange={(event) => setQuery(event.target.value)}
					size="small"
					endAdornment={
						<InputAdornment position="end">
							<IconButton onClick={() => setQueryInstant('')}>
								{query.length > 0 ? <Clear /> : <Search />}
							</IconButton>
						</InputAdornment>
					}
				/>
			</FormControl>
		</Stack>
	)
}
