import AddIcon from '@mui/icons-material/Add'
import Autocomplete from '@mui/material/Autocomplete'
import TextField from '@mui/material/TextField'

type Props<T> = {
	label: string
	value?: T | null
	options: T[]
	getOptionLabel: (option: T) => string
	onAdd: (unit: T | null) => void
	sx?: Parameters<typeof Autocomplete>['0']['sx']
}

export function NewEntityAutocomplete<T>({ label, options, onAdd, value, getOptionLabel, sx }: Props<T>) {
	return (
		<Autocomplete
			options={options}
			getOptionLabel={getOptionLabel}
			renderInput={(params) => (
				<TextField
					{...params}
					size="small"
					placeholder={label}
					InputProps={{
						...params.InputProps,
						startAdornment: <AddIcon fontSize="small" sx={{ ml: 1, mr: 0.5, color: 'text.secondary' }} />,
					}}
				/>
			)}
			onChange={(_, value) => {
				onAdd(value)
			}}
			value={value ?? null}
			blurOnSelect
			clearOnBlur
			sx={sx}
			disabled={options.length === 0}
		/>
	)
}
