import { LoginRounded } from '@mui/icons-material'
import LoadingButton from '@mui/lab/LoadingButton'
import { Alert, Collapse, Link, Stack, TextField } from '@mui/material'
import { KeyboardEvent, useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'
import { NavLink } from 'react-router-dom'
import { TransitionGroup } from 'react-transition-group'

import { usePostLoginMutation } from '../../../../api/rheaApi'
import { TenebrieLogo } from '../../../components/TenebrieLogo'
import { parseApiResponse } from '../../../utils/parseApiResponse'
import { useErrorState } from '../../../utils/useErrorState'
import { useAppRouter } from '../../world/router'
import { authSlice } from '../reducer'

export const Login = () => {
	const [email, setEmail] = useState('')
	const [password, setPassword] = useState('')

	const { error, raiseError, clearError } = useErrorState<{
		MISSING_EMAIL: string
		MISSING_PASSWORD: string
		SERVER_SIDE_ERROR: string
	}>()

	const { navigateToHome } = useAppRouter()
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

		clearError()
		const { response, error } = parseApiResponse(
			await login({
				body: {
					email,
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

	const onEnterKey = (event: KeyboardEvent) => {
		if (event.key === 'Enter') {
			onLogin()
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
				label="Password"
				type="password"
				value={password}
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
				<span>Login</span>
			</LoadingButton>
			<Link component={NavLink} to="/register">
				Create a new account
			</Link>
		</Stack>
	)
}
