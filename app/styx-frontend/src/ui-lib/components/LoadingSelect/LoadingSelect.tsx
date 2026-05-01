import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import MenuItem from '@mui/material/MenuItem'
import Select, { SelectProps } from '@mui/material/Select'

export type LoadingSelectProps<Value = unknown> = SelectProps<Value> & {
	/**
	 * If true, show loading placeholder and disable select
	 */
	isLoading?: boolean
}

export function LoadingSelect<Value = unknown>(props: LoadingSelectProps<Value>) {
	const { isLoading, children, disabled, ...rest } = props

	if (isLoading) {
		return (
			<Select disabled displayEmpty {...rest} value={''}>
				<MenuItem disabled></MenuItem>
			</Select>
		)
	}

	return (
		<FormControl>
			<InputLabel>{props.label}</InputLabel>
			<Select disabled={disabled} {...rest}>
				{children}
			</Select>
		</FormControl>
	)
}
