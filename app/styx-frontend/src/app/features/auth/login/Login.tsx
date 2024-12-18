import LoginRounded from '@mui/icons-material/LoginRounded'
import LoadingButton from '@mui/lab/LoadingButton'
import Divider from '@mui/material/Divider'
import Link from '@mui/material/Link'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { KeyboardEvent, useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'
import { NavLink } from 'react-router-dom'

import { usePostLoginMutation } from '@/api/authApi'
import { FormErrorBanner } from '@/app/components/FormErrorBanner'
import { TenebrieLogo } from '@/app/components/TenebrieLogo'
import { parseApiResponse } from '@/app/utils/parseApiResponse'
import { useErrorState } from '@/app/utils/useErrorState'
import { appRoutes, useAppRouter } from '@/router/routes/appRoutes'

import { AlreadyLoggedInAlert } from '../alreadyLoggedInAlert/AlreadyLoggedInAlert'
import { authSlice } from '../reducer'

export const Login = () => {
	const [email, setEmail] = useState('')
	const [password, setPassword] = useState('')

	const { error, raiseError, clearError, errorState } = useErrorState<{
		MISSING_EMAIL: string
		MISSING_PASSWORD: string
		SERVER_SIDE_ERROR: string
	}>()

	const { navigateTo } = useAppRouter()
	const [login, { isLoading }] = usePostLoginMutation()

	const { setUser } = authSlice.actions
	const dispatch = useDispatch()

	useEffect(() => {
		clearError()
	}, [clearError, email, password])

	const onLogin = async () => {
		if (!email) {
			raiseError('MISSING_EMAIL', 'Missing email')
			return
		}
		if (!password) {
			raiseError('MISSING_PASSWORD', 'Missing password')
			return
		}

		const { response, error } = parseApiResponse(
			await login({
				body: {
					email,
					password,
				},
			}),
		)
		if (error) {
			raiseError('SERVER_SIDE_ERROR', error.message)
			return
		}
		clearError()
		dispatch(setUser(response))
		navigateTo({ target: appRoutes.home })
	}

	const onEnterKey = (event: KeyboardEvent) => {
		if (event.key === 'Enter') {
			onLogin()
		}
	}

	return (
		<Stack justifyContent="center">
			<Paper elevation={2}>
				<Stack spacing={2} justifyContent="center" width="300px" padding={4}>
					<Stack alignItems="center">
						<TenebrieLogo />
					</Stack>
					<Divider />
					<Typography variant="h6" align="center" sx={{ padding: 1 }}>
						Sign in to Timelines
					</Typography>
					<AlreadyLoggedInAlert parentSpacing={2} />
					<FormErrorBanner errorState={errorState} />
					<TextField
						id="email"
						autoComplete="username"
						label="Email"
						type="text"
						value={email}
						placeholder="example@timelines.com"
						onChange={(event) => setEmail(event.target.value)}
						autoFocus
						onKeyDown={onEnterKey}
						error={!!error && error.type === 'MISSING_EMAIL'}
					/>
					<TextField
						id="password"
						autoComplete="current-password"
						label="Password"
						type="password"
						value={password}
						placeholder="Your password"
						onChange={(event) => setPassword(event.target.value)}
						onKeyDown={onEnterKey}
						error={!!error && error.type === 'MISSING_PASSWORD'}
					/>
					<LoadingButton
						loading={isLoading}
						variant="contained"
						onClick={onLogin}
						loadingPosition="center"
						startIcon={<LoginRounded />}
					>
						<span>Sign In</span>
					</LoadingButton>
					<Link component={NavLink} to="/register">
						Create a new account
					</Link>
				</Stack>
			</Paper>
		</Stack>
	)
}
