import { screen } from '@testing-library/react'
import { rest } from 'msw'
import { setupServer } from 'msw/node'

import { renderWithProviders, renderWithRouter } from '../../../../jest/renderWithProviders'
import { appRoutes } from '../../world/router'
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

	describe('with navigation', () => {
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

			let hasReceivedRequest = false
			server.use(
				rest.post('/api/auth/login', (req, res, ctx) => {
					hasReceivedRequest = true
					return res(ctx.status(200))
				})
			)

			await user.type(screen.getByLabelText('Email'), 'admin@localhost')
			await user.type(screen.getByLabelText('Password'), 'securepassword123')
			await user.click(screen.getByText('Login'))

			expect(hasReceivedRequest).toBeTruthy()
		})

		it('is redirected to home on successful login', async () => {
			const { user } = renderWithRouter('login')

			server.use(
				rest.post('/api/auth/login', (req, res, ctx) => {
					return res(ctx.status(200))
				}),
				rest.get('/api/worlds', (req, res, ctx) => {
					return res(ctx.status(200))
				})
			)

			await user.type(screen.getByLabelText('Email'), 'admin@localhost')
			await user.type(screen.getByLabelText('Password'), 'securepassword123')
			await user.click(screen.getByText('Login'))

			expect(window.location.pathname).toEqual(appRoutes.home)
		})
	})
})
