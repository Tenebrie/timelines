import { createTheme, Theme } from '@mui/material/styles'

const commonTheme = createTheme()

const baseTheme: Partial<Theme> = {
	shape: {
		borderRadius: 8,
	},
	components: {
		MuiButton: {
			styleOverrides: {
				root: {
					textTransform: 'none',
				},
				contained: {
					boxShadow: 'none',
					'&:active': {
						boxShadow: 'none',
					},
				},
			},
		},
		MuiTabs: {
			styleOverrides: {
				indicator: {
					height: 3,
					borderTopLeftRadius: 3,
					borderTopRightRadius: 3,
					backgroundColor: commonTheme.palette.common.white,
				},
			},
		},
		MuiTab: {
			styleOverrides: {
				root: {
					textTransform: 'none',
					marginLeft: 0,
					marginRight: commonTheme.spacing(2),
					minWidth: commonTheme.spacing(5),
					padding: 0,
					[commonTheme.breakpoints.up('md')]: {
						padding: '0 8px',
					},
				},
			},
		},
		MuiIconButton: {
			styleOverrides: {
				root: {
					padding: commonTheme.spacing(1),
				},
			},
		},
		MuiTooltip: {
			styleOverrides: {
				tooltip: {
					borderRadius: 4,
				},
			},
		},
		MuiDivider: {
			styleOverrides: {
				root: {
					backgroundColor: 'rgb(255,255,255,0.15)',
				},
			},
		},
		MuiListItemButton: {
			styleOverrides: {
				root: {
					'&.Mui-selected': {
						color: '#4fc3f7',
					},
				},
			},
		},
		MuiListItemText: {
			styleOverrides: {
				primary: {
					fontSize: 14,
					fontWeight: commonTheme.typography.fontWeightMedium,
				},
			},
		},
		MuiListItemIcon: {
			styleOverrides: {
				root: {
					color: 'inherit',
					minWidth: 'auto',
					marginRight: commonTheme.spacing(2),
					'& svg': {
						fontSize: 20,
					},
				},
			},
		},
	},
}

export const lightTheme = createTheme({
	...baseTheme,
	palette: {
		mode: 'light',
		background: {
			paper: '#eee',
			default: 'hsl(119, 0%, 85%)',
		},
		primary: {
			main: 'hsl(118, 28%, 37%)',
			contrastText: '#fff',
		},
		secondary: {
			main: 'hsl(20, 69%, 42%)',
			contrastText: '#fff',
		},
	},
})

export const darkTheme = createTheme({
	...baseTheme,
	palette: {
		mode: 'dark',
		background: {
			default: '#0a0908',
			paper: 'hsl(199, 27%, 18%)',
		},
		primary: {
			main: 'hsl(118, 38%, 60%)',
			contrastText: '#0a0908',
		},
		secondary: {
			main: 'hsl(20, 49%, 60%)',
			contrastText: '#0a0908',
		},
	},
})

export const customLightTheme = {
	palette: {
		timelineAnchor: {
			text: 'rgb(21, 16, 11)',
		},
		background: {
			soft: 'rgb(0 0 0 / 10%)',
			timeline: '#eee',
			navigator: '#eee',
			timelineMarker: '#fff',
		},
	},
}

export const customDarkTheme: typeof customLightTheme = {
	palette: {
		timelineAnchor: {
			text: 'white',
		},
		background: {
			soft: 'rgb(255 255 255 / 10%)',
			timeline: '#22333b',
			navigator: '#22333b',
			timelineMarker: '#0a0908',
		},
	},
}
