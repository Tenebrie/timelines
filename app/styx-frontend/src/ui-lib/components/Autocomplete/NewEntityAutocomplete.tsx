import Autocomplete from '@mui/material/Autocomplete'
import TextField from '@mui/material/TextField'

type Props<T> = {
	label?: string
	placeholder?: string
	value?: T | null
	options: T[]
	disabled?: boolean
	getOptionLabel: (option: T) => string
	onAdd: (unit: T | null) => void
	sx?: Parameters<typeof Autocomplete>['0']['sx']
}

export function NewEntityAutocomplete<T>({
	label,
	placeholder,
	options,
	disabled,
	onAdd,
	value,
	getOptionLabel,
	sx,
}: Props<T>) {
	return (
		<Autocomplete
			options={options}
			getOptionLabel={getOptionLabel}
			renderInput={(params) => (
				<TextField {...params} size="small" label={label} placeholder={placeholder}></TextField>
			)}
			onChange={(_, value) => {
				onAdd(value)
			}}
			value={value ?? null}
			blurOnSelect
			clearOnBlur
			sx={sx}
			disabled={disabled || options.length === 0}
		/>
	)
}
