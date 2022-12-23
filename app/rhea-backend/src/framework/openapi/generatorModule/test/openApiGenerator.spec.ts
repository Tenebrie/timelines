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

	it('includes record response correctly', () => {
		const manager = createManager([
			{
				method: 'GET',
				path: '/test/path',
				params: [],
				query: [],
				objectBody: [],
				responses: [
					{
						status: 200,
						signature: [
							{
								role: 'record',
								shape: [
									{
										identifier: 'foo',
										optional: false,
										role: 'property',
										shape: 'string',
									},
									{
										identifier: 'bar',
										optional: true,
										role: 'property',
										shape: 'boolean',
									},
								],
								optional: false,
							},
						],
					},
				],
			},
		])
		const spec = generateOpenApiSpec(manager)

		expect(spec.paths['/test/path'].get?.responses[200].content).toEqual({
			'application/json': {
				schema: {
					oneOf: [
						{
							type: 'object',
							additionalProperties: {
								type: 'object',
								properties: { bar: { type: 'boolean' }, foo: { type: 'string' } },
								required: ['foo'],
							},
						},
					],
				},
			},
		})
	})

	it('generates correct spec for many endpoints', () => {
		const manager = createManager(manyEndpointsData)
		const spec = generateOpenApiSpec(manager)

		expect(spec).toEqual(manyEndpointsResults)
	})

	it('generates correct spec for circular dependency', () => {
		const manager = createManager([
			{
				method: 'GET',
				path: '/test/path',
				params: [],
				query: [],
				objectBody: [],
				responses: [
					{
						status: 200,
						signature: [
							{
								role: 'property',
								identifier: 'foo',
								shape: 'circular',
								optional: false,
							},
						],
					},
				],
			},
		])
		const spec = generateOpenApiSpec(manager)

		expect(spec.paths['/test/path'].get?.responses[200].content).toEqual({
			'application/json': {
				schema: {
					oneOf: [
						{
							type: 'object',
							properties: {
								foo: {
									oneOf: [
										{ type: 'string' },
										{ type: 'boolean' },
										{ type: 'number' },
										{ type: 'object' },
										{ type: 'array' },
									],
								},
							},
							required: ['foo'],
						},
					],
				},
			},
		})
	})

	it('generates correct spec for array in responses', () => {
		const manager = createManager([
			{
				method: 'GET',
				path: '/test/path',
				params: [],
				query: [],
				objectBody: [],
				responses: [
					{
						status: 200,
						signature: [
							{
								role: 'array',
								shape: 'string',
								optional: false,
							},
						],
					},
				],
			},
		])
		const spec = generateOpenApiSpec(manager)

		expect(spec.paths['/test/path'].get).toEqual({
			description: '',
			parameters: [],
			responses: {
				'200': {
					description: '',
					content: {
						'application/json': {
							schema: {
								oneOf: [
									{
										type: 'array',
										items: {
											type: 'string',
										},
									},
								],
							},
						},
					},
				},
			},
		})
	})

	it('generates correct spec for any in responses', () => {
		const manager = createManager([
			{
				method: 'GET',
				path: '/test/path',
				params: [],
				query: [],
				objectBody: [],
				responses: [
					{
						status: 200,
						signature: [
							{
								identifier: 'foo',
								role: 'property',
								shape: 'any',
								optional: false,
							},
						],
					},
				],
			},
		])
		const spec = generateOpenApiSpec(manager)

		expect(spec.paths['/test/path'].get?.responses[200].content).toEqual({
			'application/json': {
				schema: {
					oneOf: [
						{
							type: 'object',
							properties: {
								foo: {
									oneOf: [
										{ type: 'string' },
										{ type: 'boolean' },
										{ type: 'number' },
										{ type: 'object' },
										{ type: 'array' },
									],
								},
							},
							required: ['foo'],
						},
					],
				},
			},
		})
	})
})
