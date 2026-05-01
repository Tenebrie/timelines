import Typography, { TypographyProps } from '@mui/material/Typography'
import { ReactNode } from 'react'

type HeaderVariant = 'h1' | 'h2'

type Props = {
	variant: HeaderVariant
	icon?: ReactNode
} & Omit<TypographyProps, 'variant'>

const variantDefaults = {
	h1: {
		typographyVariant: 'h5',
		sx: { fontFamily: 'Inter', fontWeight: 500 },
	},
	h2: {
		typographyVariant: 'h6',
		sx: { display: 'flex', fontFamily: 'Inter', alignItems: 'center', gap: 1, fontSize: 18 },
	},
} as const

export function Header({ variant, icon, sx, children, ...rest }: Props) {
	const defaults = variantDefaults[variant]

	return (
		<Typography variant={defaults.typographyVariant} sx={{ ...defaults.sx, ...sx }} {...rest}>
			{icon} {children}
		</Typography>
	)
}
