import { ThemeProvider } from '@mui/material'
import { useMemo } from 'react'
import { useSelector } from 'react-redux'

import { getUserPreferences } from '../preferences/selectors'
import { darkTheme, lightTheme } from './themes'

type Props = {
	children: JSX.Element | JSX.Element[]
}

export const CustomThemeProvider = ({ children }: Props) => {
	const { colorMode } = useSelector(getUserPreferences)
	const theme = useMemo(() => (colorMode === 'light' ? lightTheme : darkTheme), [colorMode])

	return <ThemeProvider theme={theme}>{children}</ThemeProvider>
}
