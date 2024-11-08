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

export const colors = {
	palette: {
		0: '#28410b',
		1: '#3c5c07',
		2: '#4f7703',
		3: '#719a19',
		4: '#92bd2e',
		5: '#a5d534',
		6: '#603720',
		7: '#6c3e23',
		8: '#784426',
		9: '#9c6544',
	},
}

export const lightTheme = createTheme({
	...baseTheme,
	palette: {
		mode: 'light',
		background: {
			default: 'hsl(197, 20%, 90%)',
			paper: 'hsl(197, 20%, 95%)',
		},
		// mode: 'light',
		// primary: {
		// 	main: '#67be23',
		// 	contrastText: '#fff',
		// },
		// secondary: {
		// 	main: '#2A132E',
		// 	contrastText: '#fff',
		// },
		// background: {
		// 	default: '#f0f0f0',
		// 	paper: '#ffffff',
		// },
		// success: {
		// 	main: '#67be23',
		// 	contrastText: '#fff',
		// },
		// error: {
		// 	main: '#fa541c',
		// 	contrastText: '#fff',
		// },
		// warning: {
		// 	main: '#fa8c16',
		// 	contrastText: '#fff',
		// },
		// info: {
		// 	main: '#0b82f0',
		// 	contrastText: '#fff',
		// },
		// divider: 'rgba(0,0,0,0)',
		// text: {
		// 	primary: '#626262',
		// 	secondary: '#9f9f9f',
		// 	disabled: '#c1c1c1',
		// },
	},
})

export const darkTheme = createTheme({
	...baseTheme,
	palette: {
		mode: 'dark',
		background: {
			paper: '#0a1929',
		},
		// mode: 'dark',
		// primary: {
		// 	main: '#77f',
		// 	contrastText: '#fff',
		// },
		// secondary: {
		// 	main: '#d077ff',
		// 	contrastText: '#fff',
		// },
		// background: {
		// 	default: '#212121',
		// 	paper: '#242424',
		// },
		// success: {
		// 	main: '#67be23',
		// 	contrastText: '#fff',
		// },
		// error: {
		// 	main: '#ee2a1e',
		// 	contrastText: '#fff',
		// },
		// warning: {
		// 	main: '#fa8c16',
		// 	contrastText: '#fff',
		// },
		// info: {
		// 	main: '#1890ff',
		// 	contrastText: '#fff',
		// },
		// divider: 'rgba(0,0,0,0)',
		// text: {
		// 	primary: '#fff',
		// 	secondary: 'rgba(255,255,255,0.7)',
		// 	disabled: '#d1d1d1',
		// },
	},
})

export const customLightTheme = {
	palette: {
		timelineAnchor: {
			text: 'rgb(21, 16, 11)',
		},
		background: {
			timeline: 'hsl(197, 20%, 95%)',
			navigator: 'hsl(197, 20%, 95%)',
		},
	},
}

export const customDarkTheme: typeof customLightTheme = {
	palette: {
		timelineAnchor: {
			text: 'white',
		},
		background: {
			timeline: '#0a1929',
			navigator: '#0a1929',
		},
	},
}
