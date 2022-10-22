import './index.css'

import { createTheme, ThemeProvider } from '@mui/material'
import React from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import { RouterProvider } from 'react-router-dom'

import { store } from './app/store'
import reportWebVitals from './reportWebVitals'
import { router } from './router/router'

const container = document.getElementById('root')
const root = createRoot(container!)

const darkTheme = createTheme({
	palette: {
		mode: 'dark',
	},
})

root.render(
	<React.StrictMode>
		<ThemeProvider theme={darkTheme}>
			<Provider store={store}>
				<RouterProvider router={router} />
			</Provider>
		</ThemeProvider>
	</React.StrictMode>
)

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.info))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals()
