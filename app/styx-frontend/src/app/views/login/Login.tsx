import LoginRounded from '@mui/icons-material/LoginRounded'
import LoadingButton from '@mui/lab/LoadingButton'
import Container from '@mui/material/Container'
import Divider from '@mui/material/Divider'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { Link, useNavigate } from '@tanstack/react-router'
import { KeyboardEvent, useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'

import { usePostLoginMutation } from '@/api/authApi'
import { FormErrorBanner } from '@/app/components/FormErrorBanner'
import { TenebrieLogo } from '@/app/components/TenebrieLogo'
import { parseApiResponse } from '@/app/utils/parseApiResponse'
import { useErrorState } from '@/app/utils/useErrorState'

import { authSlice } from '../../features/auth/AuthSlice'
import { AlreadyLoggedInAlert } from '../../features/auth/components/AlreadyLoggedInAlert'

export const Login = () => {
	const [email, setEmail] = useState('')
	const [password, setPassword] = useState('')

	const { error, raiseError, clearError, errorState } = useErrorState<{
		MISSING_EMAIL: string
		MISSING_PASSWORD: string
		SERVER_SIDE_ERROR: string
	}>()

	const navigate = useNavigate()
	const [login, { isLoading }] = usePostLoginMutation()

	const { setUser, setSessionId } = authSlice.actions
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
		dispatch(setUser(response.user))
		dispatch(setSessionId(response.sessionId))
		navigate({ to: '/home' })
	}

	const onEnterKey = (event: KeyboardEvent) => {
		if (event.key === 'Enter') {
			onLogin()
		}
	}

	return (
		<Stack justifyContent="center" height="100%">
			<Container maxWidth="xs">
				<Paper elevation={2}>
					<Stack spacing={2} justifyContent="center" padding={4}>
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
						<Link from="/" to="/register">
							Create a new account
						</Link>
					</Stack>
				</Paper>
			</Container>
		</Stack>
	)
}
