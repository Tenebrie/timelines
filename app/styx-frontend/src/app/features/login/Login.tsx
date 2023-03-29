import { Button, TextField } from '@mui/material'
import { useState } from 'react'

import { useCreateAccountMutation, usePostLoginMutation } from '../../../api/rheaApi'

export const Login = () => {
	const [email, setEmail] = useState('')
	const [username, setUsername] = useState('')
	const [password, setPassword] = useState('')

	const [createAccount] = useCreateAccountMutation()
	const [login] = usePostLoginMutation()

	const onRegister = async () => {
		const response = await createAccount({
			body: {
				email,
				username,
				password,
			},
		})
		if ('error' in response) {
			return
		}
	}

	const onLogin = async () => {
		await login({
			body: {
				email,
				password,
			},
		})
	}

	return (
		<div>
			<TextField
				label="Email"
				type="text"
				value={email}
				onChange={(event) => setEmail(event.target.value)}
				autoFocus
			/>
			<TextField
				label="Username"
				type="text"
				value={username}
				onChange={(event) => setUsername(event.target.value)}
			/>
			<TextField
				label="Password"
				type="password"
				value={password}
				onChange={(event) => setPassword(event.target.value)}
			/>
			<Button onClick={onRegister}>Register</Button>
			<Button onClick={onLogin}>Login</Button>
		</div>
	)
}
