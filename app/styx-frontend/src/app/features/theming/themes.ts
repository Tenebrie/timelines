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
			default: 'hsl(250, 25%, 93%)',
		},
		primary: {
			main: 'hsl(258, 45%, 48%)',
			contrastText: '#fff',
		},
		secondary: {
			main: 'hsl(200, 50%, 42%)',
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
			default: '#0f0e1a',
			paper: 'hsl(252, 25%, 14%)',
		},
		primary: {
			main: 'hsl(258, 55%, 65%)',
			contrastText: '#f0ecff',
		},
		secondary: {
			main: 'hsl(200, 55%, 55%)',
			contrastText: '#0f0e1a',
		},
		error: {
			main: '#f07070',
			contrastText: '#0f0e1a',
		},
	},
})

export const customLightTheme = {
	palette: {
		timelineAnchor: {
			text: 'rgb(21, 16, 11)',
		},
		outline: 'rgb(60 40 120 / 18%)',
		outlineStrong: 'rgb(60 40 120 / 40%)',
		background: {
			hard: 'rgb(60 40 120 / 30%)',
			harder: 'rgb(60 40 120 / 40%)',
			hardest: 'rgb(60 40 120 / 60%)',
			soft: 'rgb(60 40 120 / 8%)',
			softer: 'rgb(60 40 120 / 4%)',
			softest: 'rgb(60 40 120 / 2%)',
			textEditor: '#fff',
			timeline: 'hsl(250, 25%, 97%)',
			timelineHeader: 'hsl(250, 20%, 93%)',
			navigator: '#fff',
			timelineMarker: '#fff',
			timelineMarkerTail: 'hsl(250, 15%, 82%)',
		},
	},
}

export const customDarkTheme: typeof customLightTheme = {
	palette: {
		timelineAnchor: {
			text: 'white',
		},
		outline: 'rgb(180 170 220 / 18%)',
		outlineStrong: 'rgb(180 170 220 / 40%)',
		background: {
			hard: 'rgb(180 170 220 / 30%)',
			harder: 'rgb(180 170 220 / 40%)',
			hardest: 'rgb(180 170 220 / 60%)',
			soft: 'rgb(180 170 220 / 8%)',
			softer: 'rgb(180 170 220 / 4%)',
			softest: 'rgb(180 170 220 / 2%)',
			textEditor: 'hsl(252, 25%, 14%)',
			timeline: '#0f0e1a',
			timelineHeader: '#16142a',
			navigator: '#16142a',
			timelineMarker: '#0f0e1a',
			timelineMarkerTail: 'hsl(252, 20%, 28%)',
		},
	},
}
