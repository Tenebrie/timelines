import { EndpointData } from '../../types'

export const manyEndpointsData: EndpointData[] = [
	{
		method: 'GET',
		path: '/test/908c3e74-cf67-4ec7-a281-66a79f95d44d',
		params: [],
		query: [],
		rawBody: undefined,
		objectBody: [],
		responses: [{ status: 200, signature: 'void' }],
		name: 'Test endpoint name',
		summary: 'Test endpoint summary',
		description: 'Test endpoint description',
	},
	{
		method: 'GET',
		path: '/test/bf6147f2-a1dc-4cc2-8327-e6f041f828bf/:firstParam/:secondParam/:optionalParam?',
		params: [
			{
				identifier: 'firstParam',
				signature: 'string',
				optional: false,
			},
			{
				identifier: 'secondParam',
				signature: 'boolean',
				optional: false,
			},
			{
				identifier: 'optionalParam',
				signature: 'number',
				optional: true,
			},
		],
		query: [],
		rawBody: undefined,
		objectBody: [],
		responses: [{ status: 200, signature: 'void' }],
		name: undefined,
		summary: undefined,
		description: undefined,
	},
	{
		method: 'GET',
		path: '/test/ef25ef5e-0f8f-4732-bf59-8825f94a5287/:firstParam/:secondParam/:optionalParam?',
		params: [
			{
				identifier: 'firstParam',
				signature: 'string',
				optional: false,
			},
			{
				identifier: 'secondParam',
				signature: 'boolean',
				optional: false,
			},
			{
				identifier: 'optionalParam',
				signature: 'number',
				optional: true,
			},
		],
		query: [],
		rawBody: undefined,
		objectBody: [],
		responses: [{ status: 200, signature: 'void' }],
		name: undefined,
		summary: undefined,
		description: undefined,
	},
	{
		method: 'GET',
		path: '/test/5ab5dd0d-b241-4378-bea1-a2dd696d699a/:firstParam/:secondParam',
		params: [
			{
				identifier: 'firstParam',
				signature: [
					{
						role: 'property',
						identifier: 'foo',
						shape: 'string',
						optional: false,
					},
					{
						role: 'property',
						identifier: 'bar',
						shape: 'string',
						optional: false,
					},
				],
				optional: false,
			},
			{
				identifier: 'secondParam',
				signature: [
					{
						role: 'property',
						identifier: 'foo',
						shape: 'string',
						optional: false,
					},
					{
						role: 'property',
						identifier: 'bar',
						shape: 'string',
						optional: false,
					},
				],
				optional: false,
			},
		],
		query: [],
		rawBody: undefined,
		objectBody: [],
		responses: [{ status: 200, signature: 'void' }],
		name: undefined,
		summary: undefined,
		description: undefined,
	},
	{
		method: 'GET',
		path: '/test/209df2a1-55f9-4859-bc31-3277547c7d88/:firstParam/:secondParam',
		params: [
			{
				identifier: 'firstParam',
				signature: [
					{
						role: 'property',
						identifier: 'foo',
						shape: 'string',
						optional: true,
					},
				],
				optional: false,
			},
			{
				identifier: 'secondParam',
				signature: [
					{
						role: 'property',
						identifier: 'foo',
						shape: 'string',
						optional: true,
					},
				],
				optional: false,
			},
		],
		query: [],
		rawBody: undefined,
		objectBody: [],
		responses: [{ status: 200, signature: 'void' }],
		name: undefined,
		summary: undefined,
		description: undefined,
	},
	{
		method: 'GET',
		path: '/test/89d961f1-7d36-4271-8bd3-665ee0992590/:firstParam/:secondParam',
		params: [
			{
				identifier: 'firstParam',
				signature: [
					{
						role: 'property',
						identifier: 'foo',
						shape: [
							{
								role: 'union',
								shape: [
									{
										role: 'union_entry',
										shape: 'string',
										optional: false,
									},
									{
										role: 'union_entry',
										shape: 'number',
										optional: false,
									},
								],
								optional: false,
							},
						],
						optional: false,
					},
				],
				optional: false,
			},
			{
				identifier: 'secondParam',
				signature: [
					{
						role: 'property',
						identifier: 'foo',
						shape: [
							{
								role: 'union',
								shape: [
									{
										role: 'union_entry',
										shape: 'string',
										optional: false,
									},
									{
										role: 'union_entry',
										shape: 'number',
										optional: false,
									},
								],
								optional: false,
							},
						],
						optional: false,
					},
				],
				optional: false,
			},
		],
		query: [],
		rawBody: undefined,
		objectBody: [],
		responses: [{ status: 200, signature: 'void' }],
		name: undefined,
		summary: undefined,
		description: undefined,
	},
	{
		method: 'GET',
		path: '/test/f89310d9-25ac-4005-93e4-614179d3bbd4',
		params: [],
		query: [
			{
				identifier: 'firstParam',
				signature: 'string',
				optional: false,
			},
			{
				identifier: 'secondParam',
				signature: 'boolean',
				optional: true,
			},
			{ identifier: 'thirdParam', signature: 'number', optional: true },
		],
		rawBody: undefined,
		objectBody: [],
		responses: [{ status: 200, signature: 'void' }],
		name: undefined,
		summary: undefined,
		description: undefined,
	},
	{
		method: 'GET',
		path: '/test/6040cd01-a0c6-4b70-9901-b647f19b19a7',
		params: [],
		query: [],
		rawBody: {
			signature: [
				{
					role: 'property',
					identifier: 'foo',
					shape: 'string',
					optional: false,
				},
				{
					role: 'property',
					identifier: 'bar',
					shape: 'number',
					optional: true,
				},
			],
			optional: false,
		},
		objectBody: [],
		responses: [{ status: 200, signature: 'void' }],
		name: undefined,
		summary: undefined,
		description: undefined,
	},
	{
		method: 'GET',
		path: '/test/f3754325-6d9c-42b6-becf-4a9e72bd2c4e',
		params: [],
		query: [],
		rawBody: {
			signature: [
				{
					role: 'property',
					identifier: 'foo',
					shape: 'string',
					optional: false,
				},
				{
					role: 'property',
					identifier: 'bar',
					shape: 'number',
					optional: true,
				},
			],
			optional: false,
		},
		objectBody: [],
		responses: [{ status: 200, signature: 'void' }],
		name: undefined,
		summary: undefined,
		description: undefined,
	},
	{
		method: 'GET',
		path: '/test/1ab973ff-9937-4e2d-b432-ff43a9df42cb',
		params: [],
		query: [],
		rawBody: {
			signature: [
				{
					role: 'property',
					identifier: 'foo',
					shape: 'string',
					optional: false,
				},
				{
					role: 'property',
					identifier: 'bar',
					shape: 'number',
					optional: true,
				},
			],
			optional: true,
		},
		objectBody: [],
		responses: [{ status: 200, signature: 'void' }],
		name: undefined,
		summary: undefined,
		description: undefined,
	},
	{
		method: 'GET',
		path: '/test/f74f6003-2aba-4f8c-855e-c0149f4217b7',
		params: [],
		query: [],
		rawBody: { signature: 'boolean', optional: true },
		objectBody: [],
		responses: [{ status: 200, signature: 'void' }],
		name: undefined,
		summary: undefined,
		description: undefined,
	},
	{
		method: 'GET',
		path: '/test/e8e5496b-11a0-41e3-a68d-f03d524e413c',
		params: [],
		query: [],
		rawBody: undefined,
		objectBody: [
			{
				identifier: 'firstParam',
				signature: 'string',
				optional: false,
			},
			{
				identifier: 'secondParam',
				signature: 'boolean',
				optional: true,
			},
			{ identifier: 'thirdParam', signature: 'number', optional: true },
		],
		responses: [{ status: 200, signature: 'void' }],
		name: undefined,
		summary: undefined,
		description: undefined,
	},
	{
		method: 'GET',
		path: '/test/7268be93-ce90-44b1-9a2f-8b286d7aae67',
		params: [],
		query: [],
		rawBody: undefined,
		objectBody: [
			{
				identifier: 'firstParam',
				signature: 'string',
				optional: false,
			},
			{
				identifier: 'secondParam',
				signature: 'boolean',
				optional: true,
			},
			{ identifier: 'thirdParam', signature: 'number', optional: true },
		],
		responses: [{ status: 200, signature: 'void' }],
		name: undefined,
		summary: undefined,
		description: undefined,
	},
	{
		method: 'GET',
		path: '/test/185c6075-a0f4-4607-af81-b51923f5866f',
		params: [],
		query: [],
		rawBody: undefined,
		objectBody: [
			{
				identifier: 'firstParam',
				signature: 'string',
				optional: false,
			},
			{
				identifier: 'secondParam',
				signature: 'boolean',
				optional: true,
			},
			{ identifier: 'thirdParam', signature: 'number', optional: true },
		],
		responses: [{ status: 200, signature: 'void' }],
		name: undefined,
		summary: undefined,
		description: undefined,
	},
	{
		method: 'GET',
		path: '/test/e1bedf55-6d3a-4c01-9c66-6ec74cc66c3b',
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
		path: '/test/78ad5fba-f4e2-4924-b28a-23e39dd146f7',
		params: [],
		query: [],
		rawBody: undefined,
		objectBody: [],
		responses: [
			{ status: 200, signature: 'boolean' },
			{ status: 200, signature: 'string' },
			{ status: 200, signature: 'number' },
		],
		name: undefined,
		summary: undefined,
		description: undefined,
	},
	{
		method: 'GET',
		path: '/test/c542cb10-538c-44eb-8d13-5111e273ead0',
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
						identifier: 'foo',
						shape: 'string',
						optional: false,
					},
					{
						role: 'property',
						identifier: 'bar',
						shape: 'number',
						optional: false,
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
		path: '/test/03888127-6b97-42df-b429-87a6588ab2a4',
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
						identifier: 'foo',
						shape: 'string',
						optional: true,
					},
					{
						role: 'property',
						identifier: 'bar',
						shape: 'number',
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
		path: '/test/b73347dc-c16f-4272-95b4-bf1716bf9c14',
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
						identifier: 'foo',
						shape: [
							{
								role: 'union',
								shape: [
									{
										role: 'union_entry',
										shape: 'string',
										optional: false,
									},
									{
										role: 'union_entry',
										shape: 'number',
										optional: false,
									},
									{
										role: 'union_entry',
										shape: 'boolean',
										optional: false,
									},
								],
								optional: false,
							},
						],
						optional: false,
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
		path: '/test/666b9ed1-62db-447a-80a7-8f35ec50ab02',
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
						identifier: 'foo',
						shape: 'number',
						optional: false,
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
		path: '/test/97bb5db8-1871-4c1d-998e-a724c04c5741',
		params: [],
		query: [
			{
				identifier: 'firstParam',
				signature: 'string',
				optional: false,
			},
			{
				identifier: 'secondParam',
				signature: 'boolean',
				optional: true,
			},
			{ identifier: 'thirdParam', signature: 'number', optional: true },
		],
		rawBody: undefined,
		objectBody: [],
		responses: [
			{
				status: 200,
				signature: [
					{
						role: 'property',
						identifier: 'foo',
						shape: 'string',
						optional: false,
					},
					{
						role: 'property',
						identifier: 'bar',
						shape: 'boolean',
						optional: true,
					},
					{
						role: 'property',
						identifier: 'baz',
						shape: 'number',
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
		path: '/test/4188ebf2-eae6-4994-8732-c7f43d4da861',
		params: [],
		query: [
			{
				identifier: 'firstParam',
				signature: 'string',
				optional: false,
			},
			{
				identifier: 'secondParam',
				signature: 'boolean',
				optional: true,
			},
			{ identifier: 'thirdParam', signature: 'number', optional: true },
		],
		rawBody: undefined,
		objectBody: [],
		responses: [
			{
				status: 200,
				signature: [
					{
						role: 'property',
						identifier: 'test',
						shape: 'string',
						optional: false,
					},
				],
			},
			{
				status: 200,
				signature: [
					{
						role: 'property',
						identifier: 'foo',
						shape: 'string',
						optional: false,
					},
					{
						role: 'property',
						identifier: 'bar',
						shape: 'boolean',
						optional: true,
					},
					{
						role: 'property',
						identifier: 'baz',
						shape: 'number',
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
		path: '/test/32f18a25-2408-46cf-9519-f9a8d855bf84',
		params: [],
		query: [],
		rawBody: undefined,
		objectBody: [],
		responses: [{ status: 200, signature: 'object' }],
		name: undefined,
		summary: undefined,
		description: undefined,
	},
	{
		method: 'GET',
		path: '/test/196f2937-e369-435f-b239-62eaacaa6fbd',
		params: [],
		query: [],
		rawBody: undefined,
		objectBody: [],
		responses: [{ status: 204, signature: 'void' }],
		name: undefined,
		summary: undefined,
		description: undefined,
	},
]

export const manyEndpointsResults = {
	openapi: '3.0.3',
	info: { title: 'Default title', version: '1.0.0' },
	paths: {
		'/test/908c3e74-cf67-4ec7-a281-66a79f95d44d': {
			get: {
				operationId: 'Test endpoint name',
				summary: 'Test endpoint summary',
				description: 'Test endpoint description',
				parameters: [],
				responses: { '200': { description: '' } },
			},
		},
		'/test/bf6147f2-a1dc-4cc2-8327-e6f041f828bf/{firstParam}/{secondParam}/{optionalParam}': {
			get: {
				description: '',
				parameters: [
					{ name: 'firstParam', in: 'path', description: '', required: true, schema: { type: 'string' } },
					{ name: 'secondParam', in: 'path', description: '', required: true, schema: { type: 'boolean' } },
					{
						name: 'optionalParam',
						in: 'path',
						description: 'Optional parameter',
						required: true,
						schema: { type: 'number' },
					},
				],
				responses: { '200': { description: '' } },
			},
		},
		'/test/ef25ef5e-0f8f-4732-bf59-8825f94a5287/{firstParam}/{secondParam}/{optionalParam}': {
			get: {
				description: '',
				parameters: [
					{ name: 'firstParam', in: 'path', description: '', required: true, schema: { type: 'string' } },
					{ name: 'secondParam', in: 'path', description: '', required: true, schema: { type: 'boolean' } },
					{
						name: 'optionalParam',
						in: 'path',
						description: 'Optional parameter',
						required: true,
						schema: { type: 'number' },
					},
				],
				responses: { '200': { description: '' } },
			},
		},
		'/test/5ab5dd0d-b241-4378-bea1-a2dd696d699a/{firstParam}/{secondParam}': {
			get: {
				description: '',
				parameters: [
					{
						name: 'firstParam',
						in: 'path',
						description: '',
						required: true,
						schema: {
							type: 'object',
							properties: { foo: { type: 'string' }, bar: { type: 'string' } },
							required: ['foo', 'bar'],
						},
					},
					{
						name: 'secondParam',
						in: 'path',
						description: '',
						required: true,
						schema: {
							type: 'object',
							properties: { foo: { type: 'string' }, bar: { type: 'string' } },
							required: ['foo', 'bar'],
						},
					},
				],
				responses: { '200': { description: '' } },
			},
		},
		'/test/209df2a1-55f9-4859-bc31-3277547c7d88/{firstParam}/{secondParam}': {
			get: {
				description: '',
				parameters: [
					{
						name: 'firstParam',
						in: 'path',
						description: '',
						required: true,
						schema: { type: 'object', properties: { foo: { type: 'string' } } },
					},
					{
						name: 'secondParam',
						in: 'path',
						description: '',
						required: true,
						schema: { type: 'object', properties: { foo: { type: 'string' } } },
					},
				],
				responses: { '200': { description: '' } },
			},
		},
		'/test/89d961f1-7d36-4271-8bd3-665ee0992590/{firstParam}/{secondParam}': {
			get: {
				description: '',
				parameters: [
					{
						name: 'firstParam',
						in: 'path',
						description: '',
						required: true,
						schema: {
							type: 'object',
							properties: { foo: { oneOf: [{ type: 'string' }, { type: 'number' }] } },
							required: ['foo'],
						},
					},
					{
						name: 'secondParam',
						in: 'path',
						description: '',
						required: true,
						schema: {
							type: 'object',
							properties: { foo: { oneOf: [{ type: 'string' }, { type: 'number' }] } },
							required: ['foo'],
						},
					},
				],
				responses: { '200': { description: '' } },
			},
		},
		'/test/f89310d9-25ac-4005-93e4-614179d3bbd4': {
			get: {
				description: '',
				parameters: [
					{ name: 'firstParam', in: 'query', description: '', required: true, schema: { type: 'string' } },
					{ name: 'secondParam', in: 'query', description: '', required: false, schema: { type: 'boolean' } },
					{ name: 'thirdParam', in: 'query', description: '', required: false, schema: { type: 'number' } },
				],
				responses: { '200': { description: '' } },
			},
		},
		'/test/6040cd01-a0c6-4b70-9901-b647f19b19a7': {
			get: { description: '', parameters: [], responses: { '200': { description: '' } } },
		},
		'/test/f3754325-6d9c-42b6-becf-4a9e72bd2c4e': {
			get: { description: '', parameters: [], responses: { '200': { description: '' } } },
		},
		'/test/1ab973ff-9937-4e2d-b432-ff43a9df42cb': {
			get: { description: '', parameters: [], responses: { '200': { description: '' } } },
		},
		'/test/f74f6003-2aba-4f8c-855e-c0149f4217b7': {
			get: { description: '', parameters: [], responses: { '200': { description: '' } } },
		},
		'/test/e8e5496b-11a0-41e3-a68d-f03d524e413c': {
			get: { description: '', parameters: [], responses: { '200': { description: '' } } },
		},
		'/test/7268be93-ce90-44b1-9a2f-8b286d7aae67': {
			get: { description: '', parameters: [], responses: { '200': { description: '' } } },
		},
		'/test/185c6075-a0f4-4607-af81-b51923f5866f': {
			get: { description: '', parameters: [], responses: { '200': { description: '' } } },
		},
		'/test/e1bedf55-6d3a-4c01-9c66-6ec74cc66c3b': {
			get: {
				description: '',
				parameters: [],
				responses: {
					'200': {
						description: '',
						content: { 'application/json': { schema: { oneOf: [{ type: 'string' }] } } },
					},
				},
			},
		},
		'/test/78ad5fba-f4e2-4924-b28a-23e39dd146f7': {
			get: {
				description: '',
				parameters: [],
				responses: {
					'200': {
						description: '',
						content: {
							'application/json': {
								schema: { oneOf: [{ type: 'boolean' }, { type: 'string' }, { type: 'number' }] },
							},
						},
					},
				},
			},
		},
		'/test/c542cb10-538c-44eb-8d13-5111e273ead0': {
			get: {
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
											type: 'object',
											properties: { foo: { type: 'string' }, bar: { type: 'number' } },
											required: ['foo', 'bar'],
										},
									],
								},
							},
						},
					},
				},
			},
		},
		'/test/03888127-6b97-42df-b429-87a6588ab2a4': {
			get: {
				description: '',
				parameters: [],
				responses: {
					'200': {
						description: '',
						content: {
							'application/json': {
								schema: {
									oneOf: [
										{ type: 'object', properties: { foo: { type: 'string' }, bar: { type: 'number' } } },
									],
								},
							},
						},
					},
				},
			},
		},
		'/test/b73347dc-c16f-4272-95b4-bf1716bf9c14': {
			get: {
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
											type: 'object',
											properties: {
												foo: { oneOf: [{ type: 'string' }, { type: 'number' }, { type: 'boolean' }] },
											},
											required: ['foo'],
										},
									],
								},
							},
						},
					},
				},
			},
		},
		'/test/666b9ed1-62db-447a-80a7-8f35ec50ab02': {
			get: {
				description: '',
				parameters: [],
				responses: {
					'200': {
						description: '',
						content: {
							'application/json': {
								schema: {
									oneOf: [{ type: 'object', properties: { foo: { type: 'number' } }, required: ['foo'] }],
								},
							},
						},
					},
				},
			},
		},
		'/test/97bb5db8-1871-4c1d-998e-a724c04c5741': {
			get: {
				description: '',
				parameters: [
					{ name: 'firstParam', in: 'query', description: '', required: true, schema: { type: 'string' } },
					{ name: 'secondParam', in: 'query', description: '', required: false, schema: { type: 'boolean' } },
					{ name: 'thirdParam', in: 'query', description: '', required: false, schema: { type: 'number' } },
				],
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
												foo: { type: 'string' },
												bar: { type: 'boolean' },
												baz: { type: 'number' },
											},
											required: ['foo'],
										},
									],
								},
							},
						},
					},
				},
			},
		},
		'/test/4188ebf2-eae6-4994-8732-c7f43d4da861': {
			get: {
				description: '',
				parameters: [
					{ name: 'firstParam', in: 'query', description: '', required: true, schema: { type: 'string' } },
					{ name: 'secondParam', in: 'query', description: '', required: false, schema: { type: 'boolean' } },
					{ name: 'thirdParam', in: 'query', description: '', required: false, schema: { type: 'number' } },
				],
				responses: {
					'200': {
						description: '',
						content: {
							'application/json': {
								schema: {
									oneOf: [
										{ type: 'object', properties: { test: { type: 'string' } }, required: ['test'] },
										{
											type: 'object',
											properties: {
												foo: { type: 'string' },
												bar: { type: 'boolean' },
												baz: { type: 'number' },
											},
											required: ['foo'],
										},
									],
								},
							},
						},
					},
				},
			},
		},
		'/test/32f18a25-2408-46cf-9519-f9a8d855bf84': {
			get: {
				description: '',
				parameters: [],
				responses: {
					'200': {
						description: '',
						content: { 'application/json': { schema: { oneOf: [{ type: 'object' }] } } },
					},
				},
			},
		},
		'/test/196f2937-e369-435f-b239-62eaacaa6fbd': {
			get: { description: '', parameters: [], responses: { '204': { description: '' } } },
		},
	},
}
