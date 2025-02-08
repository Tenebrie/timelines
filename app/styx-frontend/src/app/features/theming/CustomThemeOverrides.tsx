import { Theme } from '@emotion/react'
import { SxProps } from '@mui/material'
import Box from '@mui/material/Box'

import { useBrowserSpecificScrollbars } from '@/app/hooks/useBrowserSpecificScrollbars'
import { useCustomTheme } from '@/app/hooks/useCustomTheme'

type Props = {
	children: JSX.Element | JSX.Element[]
}

export const CustomThemeOverrides = ({ children }: Props) => {
	const theme = useCustomTheme()

	const scrollbarThemes = useBrowserSpecificScrollbars()

	const themeOverrides: SxProps<Theme> = {
		...scrollbarThemes,
		color: theme.material.palette.text.secondary,
		bgcolor: theme.material.palette.background.default,
		'* .MuiTabs-indicator': {
			borderRadius: 1,
			backgroundColor: theme.material.palette.primary.main,
		},
		a: {
			color: theme.material.palette.primary.main,
			transition: 'color 0.5s',
		},
		'a:hover': {
			color: theme.material.palette.secondary.main,
			transition: 'color 0s',
		},
		transition: 'background 0.3s',
	}

	return <Box sx={themeOverrides}>{children}</Box>
}
