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
		MuiMenu: {
			styleOverrides: {
				root: ({ ownerState }) => ({
					pointerEvents: ownerState.open ? 'auto' : 'none',
				}),
			},
		},
	},
}

export const lightTheme = createTheme({
	...baseTheme,
	palette: {
		mode: 'light',
		background: {
			paper: '#fff',
			default: 'hsl(200, 0%, 85%)',
		},
		primary: {
			main: 'hsl(118, 28%, 37%)',
			contrastText: '#fff',
		},
		secondary: {
			main: 'hsl(20, 69.20%, 42.00%)',
			contrastText: '#fff',
		},
		error: {
			main: '#9d0000',
			contrastText: '#fff',
		},
	},
})

export const darkTheme = createTheme({
	...baseTheme,
	palette: {
		mode: 'dark',
		background: {
			// default: '#0a0908',
			default: '#22333b',
			paper: 'hsl(199, 27%, 18%)',
		},
		primary: {
			main: 'hsl(118, 38%, 60%)',
			contrastText: '#0a0908',
		},
		secondary: {
			main: 'hsl(20, 49.00%, 60.00%)',
			contrastText: '#0a0908',
		},
		error: {
			main: '#ff7d7d',
			contrastText: '#0a0908',
		},
	},
})

export const customLightTheme = {
	palette: {
		timelineAnchor: {
			text: 'rgb(21, 16, 11)',
		},
		outline: 'rgb(0 0 0 / 23%)',
		outlineStrong: 'rgb(0 0 0 / 50%)',
		background: {
			hard: 'rgb(0 0 0 / 40%)',
			harder: 'rgb(0 0 0 / 50%)',
			hardest: 'rgb(0 0 0 / 70%)',
			soft: 'rgb(0 0 0 / 10%)',
			softer: 'rgb(0 0 0 / 5%)',
			softest: 'rgb(0 0 0 / 2%)',
			textEditor: '#fff',
			timeline: 'hsl(200, 0%, 98%)',
			timelineHeader: '#f3f3f3',
			navigator: '#fff',
			timelineMarker: '#fff',
			timelineMarkerTail: '#ddd',
		},
	},
}

export const customDarkTheme: typeof customLightTheme = {
	palette: {
		timelineAnchor: {
			text: 'white',
		},
		outline: 'rgb(255 255 255 / 23%)',
		outlineStrong: 'rgb(255 255 255 / 50%)',
		background: {
			hard: 'rgb(255 255 255 / 40%)',
			harder: 'rgb(255 255 255 / 50%)',
			hardest: 'rgb(255 255 255 / 70%)',
			soft: 'rgb(255 255 255 / 10%)',
			softer: 'rgb(255 255 255 / 5%)',
			softest: 'rgb(255 255 255 / 2%)',
			textEditor: '#22333b',
			timeline: '#22333b',
			timelineHeader: '#22333b',
			navigator: '#22333b',
			timelineMarker: '#0a0908',
			timelineMarkerTail: '#39484f',
		},
	},
}
