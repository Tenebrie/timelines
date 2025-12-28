import AppRegistrationRounded from '@mui/icons-material/AppRegistrationRounded'
import LoadingButton from '@mui/lab/LoadingButton'
import Container from '@mui/material/Container'
import Divider from '@mui/material/Divider'
import Link from '@mui/material/Link'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { Link as NavLink, useNavigate } from '@tanstack/react-router'
import { KeyboardEvent, useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'

import { useCreateAccountMutation } from '@/api/authApi'
import { FormErrorBanner } from '@/app/components/FormErrorBanner'
import { TenebrieLogo } from '@/app/components/TenebrieLogo'
import { parseApiResponse } from '@/app/utils/parseApiResponse'
import { useErrorState } from '@/app/utils/useErrorState'

import { authSlice } from '../../features/auth/AuthSlice'
import { AlreadyLoggedInAlert } from '../../features/auth/components/AlreadyLoggedInAlert'

export const Register = () => {
	const [email, setEmail] = useState('')
	const [username, setUsername] = useState('')
	const [password, setPassword] = useState('')
	const [confirmPassword, setConfirmPassword] = useState('')

	const { error, raiseError, clearError, errorState } = useErrorState<{
		MISSING_EMAIL: string
		MISSING_USERNAME: string
		MISSING_PASSWORD: string
		PASSWORDS_DO_NOT_MATCH: string
		SERVER_SIDE_ERROR: string
	}>()

	const navigate = useNavigate()
	const [createAccount, { isLoading }] = useCreateAccountMutation()

	const { setUser, setSessionId } = authSlice.actions
	const dispatch = useDispatch()

	const onRegister = async () => {
		if (!email) {
			raiseError('MISSING_EMAIL', 'Missing email')
			return
		}
		if (!username) {
			raiseError('MISSING_USERNAME', 'Missing username')
			return
		}
		if (!password) {
			raiseError('MISSING_PASSWORD', 'Missing password')
			return
		}
		if (!confirmPassword || password !== confirmPassword) {
			raiseError('PASSWORDS_DO_NOT_MATCH', 'Passwords do not match')
			return
		}

		clearError()
		const { response, error } = parseApiResponse(
			await createAccount({
				body: {
					email,
					username,
					password,
				},
			}),
		)
		if (error) {
			raiseError('SERVER_SIDE_ERROR', error.message)
			return
		}
		dispatch(setUser(response.user))
		dispatch(setSessionId(response.sessionId))
		navigate({ to: '/home' })
	}

	useEffect(() => {
		clearError()
	}, [email, username, password, confirmPassword, clearError])

	const onEnterKey = (event: KeyboardEvent) => {
		if (event.key === 'Enter') {
			onRegister()
		}
	}

	return (
		<Stack justifyContent="center" height="100%">
			<Container maxWidth="xs">
				<Paper elevation={2}>
					<Stack spacing={2} justifyContent="center" width="300px" padding={4}>
						<Stack alignItems="center">
							<TenebrieLogo />
						</Stack>
						<Divider />
						<Typography variant="h6" align="center" sx={{ padding: 1 }}>
							Create an Account
						</Typography>
						<AlreadyLoggedInAlert parentSpacing={2} />
						<FormErrorBanner errorState={errorState} />
						<TextField
							id="username"
							autoComplete="username"
							label="Email"
							type="text"
							value={email}
							onChange={(event) => setEmail(event.target.value)}
							autoFocus
							onKeyDown={onEnterKey}
							error={!!error && error.type === 'MISSING_EMAIL'}
						/>
						<TextField
							id="display-name"
							autoComplete="display-name"
							label="Username"
							type="text"
							value={username}
							onChange={(event) => setUsername(event.target.value)}
							onKeyDown={onEnterKey}
							error={!!error && error.type === 'MISSING_USERNAME'}
						/>
						<TextField
							id="password"
							autoComplete="new-password"
							label="Password"
							type="password"
							value={password}
							onChange={(event) => setPassword(event.target.value)}
							onKeyDown={onEnterKey}
							error={
								!!error && (error.type === 'MISSING_PASSWORD' || error.type === 'PASSWORDS_DO_NOT_MATCH')
							}
						/>
						<TextField
							id="confirm-password"
							autoComplete="new-password"
							label="Confirm password"
							type="password"
							value={confirmPassword}
							onChange={(event) => setConfirmPassword(event.target.value)}
							onKeyDown={onEnterKey}
							error={!!error && error.type === 'PASSWORDS_DO_NOT_MATCH'}
						/>
						<LoadingButton
							loading={isLoading}
							variant="contained"
							onClick={onRegister}
							loadingPosition="center"
							startIcon={<AppRegistrationRounded />}
						>
							<span>Register</span>
						</LoadingButton>
						<Link component={NavLink} to="/login">
							Already have an account? Sign in instead
						</Link>
					</Stack>
				</Paper>
			</Container>
		</Stack>
	)
}

export default Register
