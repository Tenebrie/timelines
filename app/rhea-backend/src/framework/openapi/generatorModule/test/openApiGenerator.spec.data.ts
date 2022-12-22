import { EndpointData } from '../../types'

export const firstTestData: EndpointData[] = [
	{
		method: 'POST',
		path: '/user/:userId/:username?',
		params: [
			{ identifier: 'username', signature: 'boolean', optional: true },
			{ identifier: 'userId', signature: 'string', optional: false },
		],
		query: [
			{
				identifier: 'addDragons',
				signature: [
					{
						role: 'property',
						identifier: 'foo',
						shape: 'string',
						optional: true,
					},
					{
						role: 'property',
						identifier: 'bar',
						shape: 'string',
						optional: true,
					},
				],
				optional: true,
			},
			{
				identifier: 'addGriffins',
				signature: 'boolean',
				optional: true,
			},
			{
				identifier: 'addBloopers',
				signature: 'boolean',
				optional: true,
			},
		],
		rawBody: {
			signature: [
				{
					role: 'property',
					identifier: 'foo',
					shape: 'string',
					optional: false,
				},
			],
			optional: true,
		},
		objectBody: [
			{
				identifier: 'addDragons',
				signature: 'boolean',
				optional: false,
			},
			{
				identifier: 'addGriffins',
				signature: [
					{
						role: 'property',
						identifier: 'foo',
						shape: 'string',
						optional: false,
					},
				],
				optional: true,
			},
		],
		responses: [
			{
				status: 200,
				signature: [
					{
						role: 'property',
						identifier: 'test',
						shape: 'boolean',
						optional: false,
					},
				],
			},
			{
				status: 200,
				signature: [
					{
						role: 'property',
						identifier: 'test',
						shape: 'boolean',
						optional: false,
					},
					{
						role: 'property',
						identifier: 'addDragons',
						shape: [
							{
								role: 'property',
								identifier: 'foo',
								shape: 'string',
								optional: true,
							},
							{
								role: 'property',
								identifier: 'bar',
								shape: 'string',
								optional: true,
							},
						],
						optional: true,
					},
					{
						role: 'property',
						identifier: 'addGriffins',
						shape: 'boolean',
						optional: true,
					},
					{
						role: 'property',
						identifier: 'addBloopers',
						shape: 'boolean',
						optional: true,
					},
				],
			},
		],
		name: undefined,
		summary: undefined,
		description: undefined,
	},
	{
		method: 'GET',
		path: '/api',
		params: [],
		query: [],
		rawBody: undefined,
		objectBody: [],
		responses: [{ status: 200, signature: 'string' }],
		name: undefined,
		summary: undefined,
		description: undefined,
	},
	{
		method: 'GET',
		path: '/api-json',
		params: [],
		query: [],
		rawBody: undefined,
		objectBody: [],
		responses: [
			{
				status: 200,
				signature: [
					{
						role: 'property',
						identifier: 'openapi',
						shape: 'string',
						optional: false,
					},
					{
						role: 'property',
						identifier: 'info',
						shape: [
							{
								role: 'property',
								identifier: 'title',
								shape: 'string',
								optional: false,
							},
							{
								role: 'property',
								identifier: 'description',
								shape: 'string',
								optional: true,
							},
							{
								role: 'property',
								identifier: 'termsOfService',
								shape: 'string',
								optional: true,
							},
							{
								role: 'property',
								identifier: 'contact',
								shape: [
									{
										role: 'property',
										identifier: 'name',
										shape: 'string',
										optional: true,
									},
									{
										role: 'property',
										identifier: 'url',
										shape: 'string',
										optional: true,
									},
									{
										role: 'property',
										identifier: 'email',
										shape: 'string',
										optional: true,
									},
								],
								optional: true,
							},
							{
								role: 'property',
								identifier: 'license',
								shape: [
									{
										role: 'property',
										identifier: 'name',
										shape: 'string',
										optional: true,
									},
									{
										role: 'property',
										identifier: 'url',
										shape: 'string',
										optional: true,
									},
								],
								optional: true,
							},
							{
								role: 'property',
								identifier: 'version',
								shape: 'string',
								optional: false,
							},
						],
						optional: false,
					},
					{
						role: 'property',
						identifier: 'paths',
						shape: 'object',
						optional: false,
					},
				],
			},
		],
		name: undefined,
		summary: undefined,
		description: undefined,
	},
]

export const firstTestResults = {
	openapi: '3.0.3',
	info: {
		title: 'Default title',
		description: undefined,
		termsOfService: undefined,
		contact: undefined,
		license: undefined,
		version: '1.0.0',
	},
	paths: {
		'/user/{userId}/{username}': {
			post: {
				operationId: undefined,
				summary: undefined,
				description: '',
				parameters: [
					{
						name: 'username',
						in: 'path',
						description: 'Optional parameter',
						required: true,
						schema: { type: 'boolean' },
					},
					{
						name: 'userId',
						in: 'path',
						description: '',
						required: true,
						schema: { type: 'string' },
					},
					{
						name: 'addDragons',
						in: 'query',
						description: '',
						required: false,
						schema: {
							type: 'object',
							properties: { foo: { type: 'string' }, bar: { type: 'string' } },
							required: undefined,
						},
					},
					{
						name: 'addGriffins',
						in: 'query',
						description: '',
						required: false,
						schema: { type: 'boolean' },
					},
					{
						name: 'addBloopers',
						in: 'query',
						description: '',
						required: false,
						schema: { type: 'boolean' },
					},
				],
				requestBody: {
					content: {
						'text/plain': {
							schema: {
								type: 'object',
								properties: { foo: { type: 'string' } },
								required: ['foo'],
							},
						},
						'application/json': {
							schema: {
								type: 'object',
								properties: {
									addDragons: { type: 'boolean' },
									addGriffins: {
										type: 'object',
										properties: { foo: { type: 'string' } },
										required: ['foo'],
									},
								},
								required: ['addDragons'],
							},
						},
						'application/x-www-form-urlencoded': {
							schema: {
								type: 'object',
								properties: {
									addDragons: { type: 'boolean' },
									addGriffins: {
										type: 'object',
										properties: { foo: { type: 'string' } },
										required: ['foo'],
									},
								},
								required: ['addDragons'],
							},
						},
					},
				},
				responses: {
					'200': {
						description: '',
						content: {
							'application/json': {
								schema: {
									oneOf: [
										{
											type: 'object',
											properties: { test: { type: 'boolean' } },
											required: ['test'],
										},
										{
											type: 'object',
											properties: {
												test: { type: 'boolean' },
												addDragons: {
													type: 'object',
													properties: {
														foo: { type: 'string' },
														bar: { type: 'string' },
													},
													required: undefined,
												},
												addGriffins: { type: 'boolean' },
												addBloopers: { type: 'boolean' },
											},
											required: ['test'],
										},
									],
								},
							},
						},
					},
				},
			},
		},
		'/api': {
			get: {
				operationId: undefined,
				summary: undefined,
				description: '',
				parameters: [],
				requestBody: undefined,
				responses: {
					'200': {
						description: '',
						content: {
							'application/json': {
								schema: { oneOf: [{ type: 'string' }] },
							},
						},
					},
				},
			},
		},
		'/api-json': {
			get: {
				operationId: undefined,
				summary: undefined,
				description: '',
				parameters: [],
				requestBody: undefined,
				responses: {
					'200': {
						description: '',
						content: {
							'application/json': {
								schema: {
									oneOf: [
										{
											type: 'object',
											properties: {
												openapi: { type: 'string' },
												info: {
													type: 'object',
													properties: {
														title: { type: 'string' },
														description: { type: 'string' },
														termsOfService: { type: 'string' },
														contact: {
															type: 'object',
															properties: {
																name: { type: 'string' },
																url: { type: 'string' },
																email: { type: 'string' },
															},
															required: undefined,
														},
														license: {
															type: 'object',
															properties: {
																name: { type: 'string' },
																url: { type: 'string' },
															},
															required: undefined,
														},
														version: { type: 'string' },
													},
													required: ['title', 'version'],
												},
												paths: { type: 'object' },
											},
											required: ['openapi', 'info', 'paths'],
										},
									],
								},
							},
						},
					},
				},
			},
		},
	},
}
