import { AppRegistrationRounded } from '@mui/icons-material'
import LoadingButton from '@mui/lab/LoadingButton'
import { Divider, Link, Paper, Stack, TextField, Typography } from '@mui/material'
import { KeyboardEvent, useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'
import { NavLink } from 'react-router-dom'

import { useCreateAccountMutation } from '@/api/authApi'
import { FormErrorBanner } from '@/app/components/FormErrorBanner'
import { TenebrieLogo } from '@/app/components/TenebrieLogo'
import { parseApiResponse } from '@/app/utils/parseApiResponse'
import { useErrorState } from '@/app/utils/useErrorState'
import { appRoutes, useAppRouter } from '@/router/routes/appRoutes'

import { AlreadyLoggedInAlert } from '../alreadyLoggedInAlert/AlreadyLoggedInAlert'
import { authSlice } from '../reducer'

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

	const { navigateTo } = useAppRouter()
	const [createAccount, { isLoading }] = useCreateAccountMutation()

	const { setUser } = authSlice.actions
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
		dispatch(setUser(response))
		navigateTo({ target: appRoutes.home })
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
		<Stack justifyContent="center">
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
						error={!!error && (error.type === 'MISSING_PASSWORD' || error.type === 'PASSWORDS_DO_NOT_MATCH')}
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
		</Stack>
	)
}

export default Register
