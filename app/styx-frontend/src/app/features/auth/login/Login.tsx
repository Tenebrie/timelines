import { Button, Link, Stack, TextField } from '@mui/material'
import { KeyboardEvent, useEffect, useState } from 'react'
import { NavLink } from 'react-router-dom'

import { usePostLoginMutation } from '../../../../api/rheaApi'
import { TenebrieLogo } from '../../../components/TenebrieLogo'
import { parseApiResponse } from '../../../utils/parseApiResponse'
import { useAppRouter } from '../../world/router'

export const Login = () => {
	const [email, setEmail] = useState('')
	const [password, setPassword] = useState('')

	const [emailError, setEmailError] = useState('')
	const [passwordError, setPasswordError] = useState('')

	const { navigateToHome } = useAppRouter()
	const [login] = usePostLoginMutation()

	useEffect(() => {
		setEmailError('')
		setPasswordError('')
	}, [email, password])

	const onLogin = async () => {
		if (!email) {
			setEmailError('Missing email')
			return
		}
		if (!password) {
			setPasswordError('Missing password')
			return
		}
		const { error } = parseApiResponse(
			await login({
				body: {
					email,
					password,
				},
			})
		)
		if (error) {
			setEmailError(error.message)
			return
		}
		navigateToHome()
	}

	const onEnterKey = (event: KeyboardEvent) => {
		if (event.key === 'Enter') {
			onLogin()
		}
	}

	return (
		<Stack spacing={2} justifyContent="center">
			<Stack alignItems="center">
				<TenebrieLogo />
			</Stack>
			<TextField
				label="Email"
				type="text"
				value={email}
				onChange={(event) => setEmail(event.target.value)}
				autoFocus
				onKeyDown={onEnterKey}
				error={!!emailError}
				helperText={emailError}
			/>
			<TextField
				label="Password"
				type="password"
				value={password}
				onChange={(event) => setPassword(event.target.value)}
				onKeyDown={onEnterKey}
				error={!!passwordError}
				helperText={passwordError}
			/>
			<Button variant="contained" onClick={onLogin}>
				Login
			</Button>
			<Link component={NavLink} to="/register">
				Create a new account
			</Link>
		</Stack>
	)
}
