import MuiButton, { ButtonProps as MuiButtonProps } from '@mui/material/Button'

const defaultSx: MuiButtonProps['sx'] = {
	'&:hover': {
		transition: 'none !important',
	},
}

export function Button({ sx, ...props }: MuiButtonProps) {
	return <MuiButton sx={[defaultSx, ...(Array.isArray(sx) ? sx : [sx])]} {...props} />
}
