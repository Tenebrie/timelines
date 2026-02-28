import LoginRounded from '@mui/icons-material/LoginRounded'
import Button from '@mui/material/Button'
import Container from '@mui/material/Container'
import Divider from '@mui/material/Divider'
import Link from '@mui/material/Link'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { Link as NavLink } from '@tanstack/react-router'
import { useDispatch } from 'react-redux'
import { z } from 'zod'

import { usePostLoginMutation } from '@/api/authApi'
import { ApiErrorBanner } from '@/app/components/ApiErrorBanner'
import { TenebrieLogo } from '@/app/components/TenebrieLogo'
import { BoundTextField } from '@/app/features/forms/components/BoundTextField'
import { useAppForm } from '@/app/features/forms/useAppForm'
import { Shortcut, useShortcut } from '@/app/hooks/useShortcut/useShortcut'
import { getSessionStorageItem, removeSessionStorageItem } from '@/app/utils/sessionStorage'
import { useStableNavigate } from '@/router-utils/hooks/useStableNavigate'

import { authSlice } from '../../features/auth/AuthSlice'
import { AlreadyLoggedInAlert } from '../../features/auth/components/AlreadyLoggedInAlert'

export const Login = () => {
	const navigate = useStableNavigate()
	const [login, loginState] = usePostLoginMutation()

	const { setUser, setSessionId } = authSlice.actions
	const dispatch = useDispatch()

	const loginForm = useAppForm({
		defaultValues: {
			email: '',
			password: '',
		},
		validators: {
			onSubmit: z.object({
				email: z
					.string()
					.min(1, 'Email is required')
					.regex(/^[^\s@]+@[^\s@]+$/, 'Invalid email address'),
				password: z.string().min(1, 'Password is required'),
			}),
		},
		onSubmit: async (data) => {
			const result = await login({
				body: {
					email: data.value.email,
					password: data.value.password,
				},
			})

			if ('data' in result && result.data) {
				dispatch(setUser(result.data.user))
				dispatch(setSessionId(result.data.sessionId))

				const visitedShareLinkSlug = getSessionStorageItem<string>('visitedShareLinkSlug')
				if (visitedShareLinkSlug) {
					removeSessionStorageItem('visitedShareLinkSlug')
					navigate({ to: `/share/${visitedShareLinkSlug}` })
					return
				}
				navigate({ to: '/' })
			}
		},
	})

	useShortcut([Shortcut.Enter, Shortcut.CtrlEnter], loginForm.handleSubmit)

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
							Sign in to Neverkin
						</Typography>
						<AlreadyLoggedInAlert parentSpacing={2} />
						<ApiErrorBanner apiState={loginState} />
						<loginForm.AppField name="email">
							{() => (
								<BoundTextField
									id="email"
									autoComplete="username"
									label="Email"
									type="text"
									placeholder="example@neverkin.com"
									autoFocus
									fullWidth
									onChangeCallback={() => {
										if (loginState.isError) {
											loginState.reset()
										}
									}}
								/>
							)}
						</loginForm.AppField>
						<loginForm.AppField name="password">
							{() => (
								<BoundTextField
									id="password"
									autoComplete="current-password"
									label="Password"
									type="password"
									placeholder="Your password"
									fullWidth
									onChangeCallback={() => {
										if (loginState.isError) {
											loginState.reset()
										}
									}}
								/>
							)}
						</loginForm.AppField>
						<Stack spacing={2} alignItems="center">
							<Button
								loading={loginState.isLoading}
								variant="contained"
								onClick={() => {
									loginForm.handleSubmit()
								}}
								loadingPosition="center"
								startIcon={<LoginRounded />}
								fullWidth
							>
								<span>Sign In</span>
							</Button>
							<Link
								component={NavLink}
								from="/"
								to="/create-account"
								variant="body2"
								sx={{ textDecoration: 'none' }}
							>
								Create a new account
							</Link>
						</Stack>
					</Stack>
				</Paper>
			</Container>
		</Stack>
	)
}
