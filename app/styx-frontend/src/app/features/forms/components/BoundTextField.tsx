import TextField, { TextFieldProps } from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { useMemo } from 'react'

import { useFieldContext } from '../useAppForm'

type Props = Omit<TextFieldProps, 'value' | 'onChange' | 'defaultValue'>

export function BoundTextField(props: Props) {
	const field = useFieldContext<string>()

	const error = useMemo(() => {
		if (field.state.meta.errors.length === 0) {
			return null
		}
		if ('message' in field.state.meta.errors[0]) {
			return field.state.meta.errors[0].message
		}
		console.warn('Unknown error', field.state.meta.errors)
		return 'Validation error'
	}, [field.state.meta.errors])

	return (
		<TextField
			{...props}
			value={field.state.value}
			onChange={(e) => field.handleChange(e.target.value)}
			error={!!error}
			helperText={<Typography variant="caption">{error}</Typography>}
		/>
	)
}
