import { Router } from '../../router/Router'
import { OpenApiManager } from '../manager/OpenApiManager'
import { generateOpenApiSpec } from '../generatorModule/generatorModule'

const router = new Router({ skipOpenApiAnalysis: true })

router.get('/api-json', () => {
	return generateOpenApiSpec(OpenApiManager.getInstance())
})

export const OpenApiRouter = router
