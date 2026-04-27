import MuiTextField, { TextFieldProps as MuiTextFieldProps } from '@mui/material/TextField'

export type TextFieldProps = MuiTextFieldProps

export function TextField({ sx, ...props }: TextFieldProps) {
	return (
		<MuiTextField
			{...(props as MuiTextFieldProps)}
			sx={{
				'& .MuiInputBase-root': {
					backgroundColor: (theme) =>
						theme.palette.mode === 'dark' ? 'rgba(0, 0, 0, 0.2)' : 'rgba(0, 0, 0, 0.04)',
				},
				...sx,
			}}
		/>
	)
}
