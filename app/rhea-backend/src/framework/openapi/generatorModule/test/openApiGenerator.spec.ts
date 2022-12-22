import { OpenApiManager } from '../../manager/OpenApiManager'
import { EndpointData } from '../../types'
import { generateOpenApiSpec } from '../generatorModule'
import { manyEndpointsData, manyEndpointsResults } from './openApiGenerator.spec.data'

describe('OpenApi Generator', () => {
	const createManager = (endpoints: EndpointData[]): OpenApiManager => {
		return new OpenApiManager(
			{
				title: 'Default title',
				version: '1.0.0',
			},
			endpoints,
			{
				allowOptionalPathParams: false,
			}
		)
	}

	it('does not include responses field if no responses are available', () => {
		const manager = createManager([
			{
				method: 'GET',
				path: '/test/path',
				params: [],
				query: [],
				objectBody: [],
				responses: [
					{
						status: 204,
						signature: 'void',
					},
				],
			},
		])
		const spec = generateOpenApiSpec(manager)

		expect(spec.paths['/test/path'].get?.responses[204].content).toEqual(undefined)
	})
	it('generates correct spec for many endpoints', () => {
		const manager = createManager(manyEndpointsData)
		const spec = generateOpenApiSpec(manager)

		expect(spec).toEqual(manyEndpointsResults)
	})
})
