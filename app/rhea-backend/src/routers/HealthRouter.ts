import { Router, ServiceUnavailableError, useApiEndpoint } from 'moonflower'

const router = new Router()

router.get('/health', async (ctx) => {
	useApiEndpoint({
		name: 'getHealth',
		description: 'Check the health of the server.',
	})

	if (!HealthStatus.initCompleted) {
		throw new ServiceUnavailableError('Rhea is still initializing')
	}

	ctx.set('Content-Type', 'text/plain; charset=utf-8')
	return 'OK'
})

export const HealthRouter = router

export const HealthStatus = {
	initCompleted: false,
	markRheaAsReady: () => {
		HealthStatus.initCompleted = true
	},
}
