import Clear from '@mui/icons-material/Clear'
import Search from '@mui/icons-material/Search'
import FormControl from '@mui/material/FormControl'
import IconButton from '@mui/material/IconButton'
import InputAdornment from '@mui/material/InputAdornment'
import InputLabel from '@mui/material/InputLabel'
import OutlinedInput from '@mui/material/OutlinedInput'
import Stack from '@mui/material/Stack'

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
			<FormControl variant="outlined" size="small">
				<InputLabel htmlFor="searchInput">Search</InputLabel>
				<OutlinedInput
					id="searchInput"
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
