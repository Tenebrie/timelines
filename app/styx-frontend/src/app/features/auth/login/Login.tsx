import { LoginRounded } from '@mui/icons-material'
import LoadingButton from '@mui/lab/LoadingButton'
import { Link, Stack, TextField } from '@mui/material'
import { KeyboardEvent, useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'
import { NavLink } from 'react-router-dom'

import { usePostLoginMutation } from '../../../../api/rheaApi'
import { appRoutes, useAppRouter } from '../../../../router/routes/appRoutes'
import { FormErrorBanner } from '../../../components/FormErrorBanner'
import { TenebrieLogo } from '../../../components/TenebrieLogo'
import { parseApiResponse } from '../../../utils/parseApiResponse'
import { useErrorState } from '../../../utils/useErrorState'
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

		clearError()
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
		dispatch(setUser(response))
		navigateTo({ target: appRoutes.home })
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
			<AlreadyLoggedInAlert parentSpacing={2} />
			<FormErrorBanner errorState={errorState} />
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
