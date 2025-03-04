// @ts-nocheck
import { screen, waitFor, waitForElementToBeRemoved } from '@testing-library/react'

import {
	mockAuthenticatedUser,
	mockNonAuthenticatedUser,
	mockPostRegister,
	mockUserModel,
} from '@/api/mock/rheaApi.mock'
import { renderWithProviders, renderWithRouter } from '@/test-utils/renderWithProviders'
import { setupTestServer } from '@/test-utils/setupTestServer'

import { authInitialState } from '../../features/auth/AuthSlice'
import { Register } from './Register'

const server = setupTestServer()

describe.skip('<Register />', () => {
	it('renders the form', async () => {
		renderWithProviders(<Register />)

		expect(screen.getByLabelText('Email')).toBeInTheDocument()
		expect(screen.getByLabelText('Username')).toBeInTheDocument()
		expect(screen.getByLabelText('Password')).toBeInTheDocument()
		expect(screen.getByLabelText('Confirm password')).toBeInTheDocument()
		expect(screen.getByText('Register')).toBeInTheDocument()
		expect(screen.getByText('Already have an account? Sign in instead')).toBeInTheDocument()
	})

	it("does not render the 'continue to app' alert", async () => {
		renderWithProviders(<Register />)

		expect(screen.queryByText(/It seems you've already logged in/)).not.toBeInTheDocument()
	})

	it("if logged in, renders the 'continue to app' alert", async () => {
		renderWithProviders(<Register />, {
			preloadedState: {
				auth: {
					...authInitialState,
					user: mockUserModel(),
				},
			},
		})

		expect(screen.getByText(/It seems you've already logged in/)).toBeInTheDocument()
	})

	describe('with navigation', () => {
		beforeEach(() => {
			mockNonAuthenticatedUser(server)
		})
		it('renders the login form at the correct path', async () => {
			await renderWithRouter('register')

			expect(screen.getByLabelText('Email')).toBeInTheDocument()
			expect(screen.getByLabelText('Username')).toBeInTheDocument()
			expect(screen.getByLabelText('Password')).toBeInTheDocument()
			expect(screen.getByLabelText('Confirm password')).toBeInTheDocument()
			expect(screen.getByText('Register')).toBeInTheDocument()
		})

		it('navigates to registration on link click', async () => {
			const { user } = await renderWithRouter('register')

			await user.click(screen.getByText('Already have an account? Sign in instead'))
			expect(window.location.pathname).toEqual(appRoutes.login)
		})

		it('sends registration request', async () => {
			const { hasBeenCalled } = mockPostRegister(server, {
				response: {
					user: {
						id: '1111-2222-3333',
						email: 'admin@localhost',
						username: 'admin',
						level: 'Free',
					},
					sessionId: 'sessionId',
				},
			})

			const { user } = await renderWithRouter('register')

			await user.type(screen.getByLabelText('Email'), 'admin@localhost')
			await user.type(screen.getByLabelText('Username'), 'admin')
			await user.type(screen.getByLabelText('Password'), 'securepassword123')
			await user.type(screen.getByLabelText('Confirm password'), 'securepassword123')
			await user.click(screen.getByText('Register'))

			expect(hasBeenCalled()).toBeTruthy()
		})

		it('is redirected to home on successful registration', async () => {
			mockAuthenticatedUser(server)
			mockPostRegister(server, {
				response: {
					user: {
						id: '1111-2222-3333',
						email: 'admin@localhost',
						username: 'admin',
						level: 'Admin',
					},
					sessionId: 'sessionId',
				},
			})

			const { user, store } = await renderWithRouter('register')

			await user.type(screen.getByLabelText('Email'), 'admin@localhost')
			await user.type(screen.getByLabelText('Username'), 'admin')
			await user.type(screen.getByLabelText('Password'), 'securepassword123')
			await user.type(screen.getByLabelText('Confirm password'), 'securepassword123')

			await user.click(screen.getByText('Register'))

			await waitFor(() => expect(window.location.pathname).toEqual(appRoutes.home))
			expect(store.getState().auth.user).toEqual({
				id: '1111-2222-3333',
				email: 'admin@localhost',
				username: 'admin',
				level: 'Admin',
			})
		})

		it('prints error when email is missing', async () => {
			const { user } = await renderWithRouter('register')

			await user.type(screen.getByLabelText('Username'), 'admin')
			await user.type(screen.getByLabelText('Password'), 'securepassword123')
			await user.type(screen.getByLabelText('Confirm password'), 'securepassword123')

			await user.click(screen.getByText('Register'))

			expect(await screen.findByText('Missing email')).toBeInTheDocument()
		})

		it('prints error when username is missing', async () => {
			const { user } = await renderWithRouter('register')

			await user.type(screen.getByLabelText('Email'), 'admin@localhost')
			await user.type(screen.getByLabelText('Password'), 'securepassword123')
			await user.type(screen.getByLabelText('Confirm password'), 'securepassword123')

			await user.click(screen.getByText('Register'))

			expect(await screen.findByText('Missing username')).toBeInTheDocument()
		})

		it('prints error when password is missing', async () => {
			const { user } = await renderWithRouter('register')

			await user.type(screen.getByLabelText('Email'), 'admin@localhost')
			await user.type(screen.getByLabelText('Username'), 'admin')
			await user.type(screen.getByLabelText('Confirm password'), 'securepassword123')

			await user.click(screen.getByText('Register'))

			expect(await screen.findByText('Missing password')).toBeInTheDocument()
		})

		it('prints error when passwords are different', async () => {
			const { user } = await renderWithRouter('register')

			await user.type(screen.getByLabelText('Email'), 'admin@localhost')
			await user.type(screen.getByLabelText('Username'), 'admin')
			await user.type(screen.getByLabelText('Password'), 'securepassword111')
			await user.type(screen.getByLabelText('Confirm password'), 'securepassword123')

			await user.click(screen.getByText('Register'))

			expect(await screen.findByText('Passwords do not match')).toBeInTheDocument()
		})

		it('prints error when login fails', async () => {
			mockPostRegister(server, {
				error: {
					status: 400,
					message: 'Unable to create account',
				},
			})

			const { user } = await renderWithRouter('register')

			await user.type(screen.getByLabelText('Email'), 'admin@localhost')
			await user.type(screen.getByLabelText('Username'), 'admin')
			await user.type(screen.getByLabelText('Password'), 'securepassword123')
			await user.type(screen.getByLabelText('Confirm password'), 'securepassword123')

			await user.click(screen.getByText('Register'))

			expect(await screen.findByText('Unable to create account')).toBeInTheDocument()

			expect(window.location.pathname).toEqual(appRoutes.register)
		})

		it('recovers from error when user starts typing', async () => {
			mockPostRegister(server, {
				error: {
					status: 400,
					message: 'Unable to create account',
				},
			})

			const { user } = await renderWithRouter('register')

			await user.type(screen.getByLabelText('Email'), 'admin@localhost')
			await user.type(screen.getByLabelText('Username'), 'admin')
			await user.type(screen.getByLabelText('Password'), 'securepassword123')
			await user.type(screen.getByLabelText('Confirm password'), 'securepassword123')

			await user.click(screen.getByText('Register'))

			await user.type(screen.getByLabelText('Email'), '111')

			await waitForElementToBeRemoved(() => screen.queryByText('Unable to create account'))
			expect(screen.queryByText('Unable to create account')).not.toBeInTheDocument()
		})
	})
})
