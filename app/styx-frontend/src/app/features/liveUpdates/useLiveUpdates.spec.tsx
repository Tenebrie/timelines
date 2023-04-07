import { rest } from 'msw'
import { setupServer } from 'msw/node'

const server = setupServer(
	rest.get('/live', (req, res, ctx) => {
		console.log('Eqwe')
		return res(
			ctx.delay(1500),
			ctx.status(100, 'Mocked status'),
			ctx.json({
				message: 'Mocked response JSON body',
			})
		)
	})
)

describe('useLiveUpdates', () => {
	beforeAll(() => server.listen())

	afterEach(() => server.resetHandlers())

	afterAll(() => server.close())

	it('works', () => {
		// const view = renderHook(() => useLiveUpdates(), {
		// 	wrapper: renderHookWrapper,
		// })
		// expect(view.result.current).toEqual('1')
	})
})
