import { OpenApiManager } from '../../manager/OpenApiManager'
import { generateOpenApiSpec } from '../generatorModule'
import { firstTestData, firstTestResults } from './openApiGenerator.spec.data'

describe('OpenApi Generator', () => {
	it('generates correct spec with default settings', () => {
		const manager = new OpenApiManager(
			{
				title: 'Default title',
				version: '1.0.0',
			},
			firstTestData,
			{
				allowOptionalPathParams: false,
			}
		)
		const spec = generateOpenApiSpec(manager)

		expect(spec).toEqual(firstTestResults)
	})
})
