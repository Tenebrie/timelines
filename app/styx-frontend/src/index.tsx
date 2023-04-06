import './index.css'

import { createTheme, ThemeProvider } from '@mui/material'
import { ErrorBoundary, Provider as RollbarProvider } from '@rollbar/react'
import React from 'react'
import { createRoot } from 'react-dom/client'
import { Provider as ReduxProvider } from 'react-redux'
import { RouterProvider } from 'react-router-dom'
import { Configuration } from 'rollbar'

import { store } from './app/store'
import reportWebVitals from './reportWebVitals'
import { router } from './router/router'

const container = document.getElementById('root')
const root = createRoot(container!)

const rollbarConfig: Configuration = {
	accessToken: 'f426a5264860489095a22b56cc8d8e31',
	environment: process.env.NODE_ENV,
	captureUncaught: true,
	captureUnhandledRejections: true,
}

const darkTheme = createTheme({
	palette: {
		mode: 'dark',
	},
})

root.render(
	<React.StrictMode>
		<ThemeProvider theme={darkTheme}>
			<ReduxProvider store={store}>
				<RollbarProvider config={rollbarConfig}>
					<ErrorBoundary>
						<RouterProvider router={router} />
					</ErrorBoundary>
				</RollbarProvider>
			</ReduxProvider>
		</ThemeProvider>
	</React.StrictMode>
)

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.info))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals()
