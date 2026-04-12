import { useTheme } from '@mui/material/styles'
import useMediaQuery from '@mui/material/useMediaQuery'

export function useMobileLayout() {
	const muiTheme = useTheme()
	const isMobile = useMediaQuery(muiTheme.breakpoints.down('md'))
	return {
		isMobile,
	}
}
