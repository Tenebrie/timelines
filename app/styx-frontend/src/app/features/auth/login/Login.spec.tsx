import { screen, waitFor, waitForElementToBeRemoved } from '@testing-library/react'

import {
	mockAuthenticatedUser,
	mockGetWorlds,
	mockNonAuthenticatedUser,
	mockPostLogin,
	mockUserModel,
} from '../../../../api/rheaApi.mock'
import { renderWithProviders, renderWithRouter } from '../../../../jest/renderWithProviders'
import { setupTestServer } from '../../../../jest/setupTestServer'
import { appRoutes } from '../../../../router/routes/appRoutes'
import { authInitialState } from '../reducer'
import { Login } from './Login'

const server = setupTestServer()

describe('<Login />', () => {
	it('renders the form', async () => {
		renderWithProviders(<Login />)

		expect(screen.getByLabelText('Email')).toBeInTheDocument()
		expect(screen.getByLabelText('Password')).toBeInTheDocument()
		expect(screen.getByText('Login')).toBeInTheDocument()
		expect(screen.getByText('Create a new account')).toBeInTheDocument()
	})

	it("does not render the 'continue to app' alert", async () => {
		renderWithProviders(<Login />)

		expect(screen.queryByText(/It seems you've already logged in/)).not.toBeInTheDocument()
	})

	it("if logged in, renders the 'continue to app' alert", async () => {
		renderWithProviders(<Login />, {
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
			await renderWithRouter('login')

			expect(screen.getByLabelText('Email')).toBeInTheDocument()
			expect(screen.getByLabelText('Password')).toBeInTheDocument()
			expect(screen.getByText('Login')).toBeInTheDocument()
			expect(screen.getByText('Create a new account')).toBeInTheDocument()
		})

		it('navigates to registration on link click', async () => {
			const { user } = await renderWithRouter('login')

			await user.click(screen.getByText('Create a new account'))
			expect(window.location.pathname).toEqual(appRoutes.register)
		})

		it('sends login request', async () => {
			const { hasBeenCalled } = mockPostLogin(server, {
				response: {
					id: '1111-2222-3333',
					email: 'admin@localhost',
					username: 'admin',
					level: 'Free',
				},
			})
			mockGetWorlds(server, {
				response: {
					ownedWorlds: [],
					contributableWorlds: [],
					visibleWorlds: [],
				},
			})

			const { user } = await renderWithRouter('login')

			await user.type(screen.getByLabelText('Email'), 'admin@localhost')
			await user.type(screen.getByLabelText('Password'), 'securepassword123')
			await user.click(screen.getByText('Login'))

			expect(hasBeenCalled()).toBeTruthy()
		})

		it('is redirected to home on successful login', async () => {
			mockAuthenticatedUser(server)
			mockPostLogin(server, {
				response: {
					id: '1111-2222-3333',
					email: 'admin@localhost',
					username: 'admin',
					level: 'Admin',
				},
			})
			mockGetWorlds(server, {
				response: {
					ownedWorlds: [],
					contributableWorlds: [],
					visibleWorlds: [],
				},
			})

			const { user, store } = await renderWithRouter('login')

			await user.type(screen.getByLabelText('Email'), 'admin@localhost')
			await user.type(screen.getByLabelText('Password'), 'securepassword123')

			await user.click(screen.getByText('Login'))

			await waitFor(() => expect(window.location.pathname).toEqual(appRoutes.home))
			expect(store.getState().auth.user).toEqual({
				id: '1111-2222-3333',
				email: 'admin@localhost',
				username: 'admin',
				level: 'Admin',
			})
		})

		it('prints error when email is missing', async () => {
			const { user } = await renderWithRouter('login')

			await user.type(screen.getByLabelText('Password'), 'securepassword123')
			await user.click(screen.getByText('Login'))

			expect(await screen.findByText('Missing email')).toBeInTheDocument()
		})

		it('prints error when password is missing', async () => {
			const { user } = await renderWithRouter('login')

			await user.type(screen.getByLabelText('Email'), 'admin@localhost')
			await user.click(screen.getByText('Login'))

			expect(await screen.findByText('Missing password')).toBeInTheDocument()
		})

		it('prints error when login fails', async () => {
			mockPostLogin(server, {
				error: {
					status: 400,
					message: 'Password invalid',
				},
			})
			mockGetWorlds(server, {
				response: {
					ownedWorlds: [],
					contributableWorlds: [],
					visibleWorlds: [],
				},
			})

			const { user } = await renderWithRouter('login')

			await user.type(screen.getByLabelText('Email'), 'admin@localhost')
			await user.type(screen.getByLabelText('Password'), 'securepassword123')
			await user.click(screen.getByText('Login'))

			expect(await screen.findByText('Password invalid')).toBeInTheDocument()

			expect(window.location.pathname).toEqual(appRoutes.login)
		})

		it('recovers from error when user starts typing', async () => {
			mockPostLogin(server, {
				error: {
					status: 400,
					message: 'Password invalid',
				},
			})
			mockGetWorlds(server, {
				response: {
					ownedWorlds: [],
					contributableWorlds: [],
					visibleWorlds: [],
				},
			})

			const { user } = await renderWithRouter('login')

			await user.type(screen.getByLabelText('Email'), 'admin@localhost')
			await user.type(screen.getByLabelText('Password'), 'securepassword123')
			await user.click(screen.getByText('Login'))

			await user.type(screen.getByLabelText('Email'), '111')

			await waitForElementToBeRemoved(() => screen.queryByText('Password invalid'))
			expect(screen.queryByText('Password invalid')).not.toBeInTheDocument()
		})
	})
})
