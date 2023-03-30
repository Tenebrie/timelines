import { Button, Link, Stack, TextField } from '@mui/material'
import { KeyboardEvent, useState } from 'react'

import { useCreateAccountMutation } from '../../../../api/rheaApi'
import { TenebrieLogo } from '../../../components/TenebrieLogo'
import { parseApiError } from '../../../utils/parseApiError'
import { useAppRouter } from '../../world/router'

export const Register = () => {
	const [email, setEmail] = useState('')
	const [username, setUsername] = useState('')
	const [password, setPassword] = useState('')
	const [confirmPassword, setConfirmPassword] = useState('')

	const [emailError, setEmailError] = useState('')
	const [usernameError, setUsernameError] = useState('')
	const [passwordError, setPasswordError] = useState('')
	const [confirmPasswordError, setConfirmPasswordError] = useState('')

	const { navigateToHome } = useAppRouter()
	const [createAccount] = useCreateAccountMutation()

	const onRegister = async () => {
		if (!email) {
			setEmailError('Missing email')
			return
		}
		if (!username) {
			setUsernameError('Missing username')
			return
		}
		if (!password) {
			setPasswordError('Missing password')
			return
		}
		if (!confirmPassword) {
			setConfirmPasswordError('Missing password')
			return
		}
		if (password !== confirmPassword) {
			setConfirmPasswordError('Passwords do not match')
			return
		}

		const response = await createAccount({
			body: {
				email,
				username,
				password,
			},
		})
		const error = parseApiError(response)
		if (error) {
			setEmailError(error.message)
			return
		}
		navigateToHome()
	}

	const onEnterKey = (event: KeyboardEvent) => {
		if (event.key === 'Enter') {
			onRegister()
		}
	}

	return (
		<Stack spacing={2}>
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
				label="Username"
				type="text"
				value={username}
				onChange={(event) => setUsername(event.target.value)}
				onKeyDown={onEnterKey}
				error={!!usernameError}
				helperText={usernameError}
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
			<TextField
				label="Confirm password"
				type="password"
				value={confirmPassword}
				onChange={(event) => setConfirmPassword(event.target.value)}
				onKeyDown={onEnterKey}
				error={!!confirmPasswordError}
				helperText={confirmPasswordError}
			/>
			<Button variant="contained" onClick={onRegister}>
				Register
			</Button>
			<Link href="/login">Already have an account? Login instead</Link>
		</Stack>
	)
}
