import { screen, waitFor, waitForElementToBeRemoved } from '@testing-library/react'
import { setupServer } from 'msw/lib/node'

import {
	mockAuthenticatedUser,
	mockGetWorlds,
	mockNonAuthenticatedUser,
	mockPostLogin,
	mockUserModel,
} from '../../../../api/rheaApi.mock'
import { renderWithProviders, renderWithRouter } from '../../../../jest/renderWithProviders'
import { appRoutes } from '../../world/router'
import { authInitialState } from '../reducer'
import { Login } from './Login'

const server = setupServer()

describe('<Login />', () => {
	beforeAll(() => server.listen())
	afterEach(() => server.resetHandlers())
	afterAll(() => server.close())

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
			renderWithRouter('login')

			expect(screen.getByLabelText('Email')).toBeInTheDocument()
			expect(screen.getByLabelText('Password')).toBeInTheDocument()
			expect(screen.getByText('Login')).toBeInTheDocument()
			expect(screen.getByText('Create a new account')).toBeInTheDocument()
		})

		it('navigates to registration on link click', async () => {
			const { user } = renderWithRouter('login')

			await user.click(screen.getByText('Create a new account'))
			expect(window.location.pathname).toEqual(appRoutes.register)
		})

		it('sends login request', async () => {
			const { user } = renderWithRouter('login')

			const { hasBeenCalled } = mockPostLogin(server, {
				response: {
					id: '1111-2222-3333',
					email: 'admin@localhost',
					username: 'admin',
				},
			})
			mockGetWorlds(server, { response: [] })

			await user.type(screen.getByLabelText('Email'), 'admin@localhost')
			await user.type(screen.getByLabelText('Password'), 'securepassword123')
			await user.click(screen.getByText('Login'))

			expect(hasBeenCalled()).toBeTruthy()
		})

		it('is redirected to home on successful login', async () => {
			const { user, store } = renderWithRouter('login')

			mockAuthenticatedUser(server)
			mockPostLogin(server, {
				response: {
					id: '1111-2222-3333',
					email: 'admin@localhost',
					username: 'admin',
				},
			})
			mockGetWorlds(server, { response: [] })

			await user.type(screen.getByLabelText('Email'), 'admin@localhost')
			await user.type(screen.getByLabelText('Password'), 'securepassword123')

			await user.click(screen.getByText('Login'))

			await waitFor(() => expect(window.location.pathname).toEqual(appRoutes.home))
			expect(store.getState().auth.user).toEqual({
				id: '1111-2222-3333',
				email: 'admin@localhost',
				username: 'admin',
			})
		})

		it('prints error when email is missing', async () => {
			const { user } = renderWithRouter('login')

			await user.type(screen.getByLabelText('Password'), 'securepassword123')
			await user.click(screen.getByText('Login'))

			expect(await screen.findByText('Missing email')).toBeInTheDocument()
		})

		it('prints error when password is missing', async () => {
			const { user } = renderWithRouter('login')

			await user.type(screen.getByLabelText('Email'), 'admin@localhost')
			await user.click(screen.getByText('Login'))

			expect(await screen.findByText('Missing password')).toBeInTheDocument()
		})

		it('prints error when login fails', async () => {
			const { user } = renderWithRouter('login')

			mockPostLogin(server, {
				error: {
					status: 400,
					message: 'Password invalid',
				},
			})
			mockGetWorlds(server, { response: [] })

			await user.type(screen.getByLabelText('Email'), 'admin@localhost')
			await user.type(screen.getByLabelText('Password'), 'securepassword123')
			await user.click(screen.getByText('Login'))

			expect(await screen.findByText('Password invalid')).toBeInTheDocument()

			expect(window.location.pathname).toEqual(appRoutes.login)
		})

		it('recovers from error when user starts typing', async () => {
			const { user } = renderWithRouter('login')

			mockPostLogin(server, {
				error: {
					status: 400,
					message: 'Password invalid',
				},
			})
			mockGetWorlds(server, { response: [] })

			await user.type(screen.getByLabelText('Email'), 'admin@localhost')
			await user.type(screen.getByLabelText('Password'), 'securepassword123')
			await user.click(screen.getByText('Login'))

			await user.type(screen.getByLabelText('Email'), '111')

			await waitForElementToBeRemoved(() => screen.queryByText('Password invalid'))
			expect(screen.queryByText('Password invalid')).not.toBeInTheDocument()
		})
	})
})
