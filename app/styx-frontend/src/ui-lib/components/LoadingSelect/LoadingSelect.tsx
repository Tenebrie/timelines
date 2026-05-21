import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import MenuItem from '@mui/material/MenuItem'
import Select, { SelectProps } from '@mui/material/Select'
import { useId } from 'react'

export type LoadingSelectProps<Value = unknown> = SelectProps<Value> & {
	/**
	 * If true, show loading placeholder and disable select
	 */
	isLoading?: boolean
}

export function LoadingSelect<Value = unknown>(props: LoadingSelectProps<Value>) {
	const { isLoading, children, disabled, labelId: externalLabelId, ...rest } = props

	const generatedLabelId = useId()
	const labelId = externalLabelId ?? generatedLabelId
	if (isLoading) {
		return (
			<Select disabled displayEmpty {...rest} value={''}>
				<MenuItem disabled></MenuItem>
			</Select>
		)
	}

	return (
		<FormControl>
			<InputLabel id={labelId}>{props.label}</InputLabel>
			<Select disabled={disabled} labelId={labelId} {...rest}>
				{children}
			</Select>
		</FormControl>
	)
}
