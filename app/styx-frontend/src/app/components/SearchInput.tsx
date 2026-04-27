import Clear from '@mui/icons-material/Clear'
import Search from '@mui/icons-material/Search'
import IconButton from '@mui/material/IconButton'
import InputAdornment from '@mui/material/InputAdornment'
import Stack from '@mui/material/Stack'

import { TextField } from '@/ui-lib/components/TextField/TextField'

import { useStateWithDebounceCallback } from '../hooks/useStateWithDebounceCallback'

type Props = {
	initialQuery?: string
	onChange?: (query: string) => void
}

export const SearchInput = ({ initialQuery, onChange }: Props) => {
	const [query, setQuery, setQueryInstant] = useStateWithDebounceCallback({
		initialValue: initialQuery ?? '',
		onDebounce: onChange ?? (() => {}),
	})

	return (
		<Stack direction="row" sx={{ paddingTop: 0.5 }}>
			<TextField
				id="searchInput"
				label="Search"
				variant="outlined"
				size="small"
				value={query}
				onChange={(event) => setQuery(event.target.value)}
				slotProps={{
					input: {
						endAdornment: (
							<InputAdornment position="end">
								<IconButton onClick={() => setQueryInstant('')}>
									{query.length > 0 ? <Clear /> : <Search />}
								</IconButton>
							</InputAdornment>
						),
					},
				}}
			/>
		</Stack>
	)
}
