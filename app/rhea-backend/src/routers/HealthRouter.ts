import { Router, useApiEndpoint } from 'moonflower'

const router = new Router()

router.get('/health', async (ctx) => {
	useApiEndpoint({
		name: 'getHealth',
		description: 'Check the health of the server.',
	})

	ctx.set('Content-Type', 'text/plain; charset=utf-8')
	return 'OK'
})

export const HealthRouter = router
