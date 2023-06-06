import { AppRegistrationRounded } from '@mui/icons-material'
import LoadingButton from '@mui/lab/LoadingButton'
import { Alert, Collapse, Link, Stack, TextField } from '@mui/material'
import { KeyboardEvent, useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'
import { NavLink } from 'react-router-dom'
import { TransitionGroup } from 'react-transition-group'

import { useCreateAccountMutation } from '../../../../api/rheaApi'
import { TenebrieLogo } from '../../../components/TenebrieLogo'
import { parseApiResponse } from '../../../utils/parseApiResponse'
import { useErrorState } from '../../../utils/useErrorState'
import { useAppRouter } from '../../world/router'
import { authSlice } from '../reducer'

export const Register = () => {
	const [email, setEmail] = useState('')
	const [username, setUsername] = useState('')
	const [password, setPassword] = useState('')
	const [confirmPassword, setConfirmPassword] = useState('')

	const { error, raiseError, clearError } = useErrorState<{
		MISSING_EMAIL: string
		MISSING_USERNAME: string
		MISSING_PASSWORD: string
		PASSWORDS_DO_NOT_MATCH: string
		SERVER_SIDE_ERROR: string
	}>()

	const { navigateToHome } = useAppRouter()
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
			})
		)
		if (error) {
			raiseError('SERVER_SIDE_ERROR', error.message)
			return
		}
		dispatch(setUser(response))
		navigateToHome()
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
		<Stack spacing={2} justifyContent="center" width="300px">
			<Stack alignItems="center">
				<TenebrieLogo />
			</Stack>
			<TransitionGroup>
				{error && (
					<Collapse>
						<Alert severity="error">{error.data}</Alert>
					</Collapse>
				)}
			</TransitionGroup>
			<TextField
				label="Email"
				type="text"
				value={email}
				onChange={(event) => setEmail(event.target.value)}
				autoFocus
				onKeyDown={onEnterKey}
				error={!!error && error.type === 'MISSING_EMAIL'}
			/>
			<TextField
				label="Username"
				type="text"
				value={username}
				onChange={(event) => setUsername(event.target.value)}
				onKeyDown={onEnterKey}
				error={!!error && error.type === 'MISSING_USERNAME'}
			/>
			<TextField
				label="Password"
				type="password"
				value={password}
				onChange={(event) => setPassword(event.target.value)}
				onKeyDown={onEnterKey}
				error={!!error && (error.type === 'MISSING_PASSWORD' || error.type === 'PASSWORDS_DO_NOT_MATCH')}
			/>
			<TextField
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
				Already have an account? Login instead
			</Link>
		</Stack>
	)
}
