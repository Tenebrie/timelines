import { Theme } from '@emotion/react'
import Box from '@mui/material/Box'
import { SxProps } from '@mui/material/styles'
import { JSX } from 'react'

import { useCustomTheme } from '../hooks/useCustomTheme'

type Props = {
	children: JSX.Element | JSX.Element[]
}

export const CustomThemeOverrides = ({ children }: Props) => {
	const theme = useCustomTheme()

	const themeOverrides: SxProps<Theme> = {
		color: theme.material.palette.text.secondary,
		bgcolor: theme.material.palette.background.default,
		'* .MuiTabs-indicator': {
			borderRadius: 1,
			backgroundColor: theme.material.palette.primary.main,
		},
		'a:not(.MuiButtonBase-root):not(.navigation-link)': {
			color: theme.material.palette.primary.main,
			transition: 'color 0.5s',
		},
		'a:not(.MuiButtonBase-root):not(.navigation-link):hover': {
			color: theme.material.palette.secondary.main,
			transition: 'color 0s',
		},
		transition: 'background 0.3s',
	}

	return <Box sx={themeOverrides}>{children}</Box>
}
