/**
 * ESLint rule to prevent direct access to Koa context properties
 * when moonflower hooks should be used instead.
 *
 * This ensures:
 * - Runtime validation is performed
 * - OpenAPI spec is generated correctly
 * - Type safety is maintained
 */

export default {
	meta: {
		type: 'problem',
		docs: {
			description:
				'Disallow direct access to ctx.params, ctx.request.body, ctx.query in router handlers. Use moonflower hooks instead.',
			category: 'Best Practices',
			recommended: true,
		},
		messages: {
			noDirectParams:
				'Do not access ctx.params directly. Use usePathParams(ctx, { ... }) instead for validation and OpenAPI generation.',
			noDirectBody:
				'Do not access ctx.request.body directly. Use useRequestBody(ctx, { ... }) instead for validation and OpenAPI generation.',
			noDirectQuery:
				'Do not access ctx.query or ctx.request.query directly. Use useQueryParams(ctx, { ... }) instead for validation and OpenAPI generation.',
		},
		schema: [],
		fixable: null,
	},

	create(context) {
		return {
			MemberExpression(node) {
				// Check for ctx.params
				if (
					node.object.type === 'Identifier' &&
					node.object.name === 'ctx' &&
					node.property.type === 'Identifier' &&
					node.property.name === 'params'
				) {
					context.report({
						node,
						messageId: 'noDirectParams',
					})
				}

				// Check for ctx.query
				if (
					node.object.type === 'Identifier' &&
					node.object.name === 'ctx' &&
					node.property.type === 'Identifier' &&
					node.property.name === 'query'
				) {
					context.report({
						node,
						messageId: 'noDirectQuery',
					})
				}

				// Check for ctx.request.body
				if (
					node.object.type === 'MemberExpression' &&
					node.object.object.type === 'Identifier' &&
					node.object.object.name === 'ctx' &&
					node.object.property.type === 'Identifier' &&
					node.object.property.name === 'request' &&
					node.property.type === 'Identifier' &&
					node.property.name === 'body'
				) {
					context.report({
						node,
						messageId: 'noDirectBody',
					})
				}

				// Check for ctx.request.query
				if (
					node.object.type === 'MemberExpression' &&
					node.object.object.type === 'Identifier' &&
					node.object.object.name === 'ctx' &&
					node.object.property.type === 'Identifier' &&
					node.object.property.name === 'request' &&
					node.property.type === 'Identifier' &&
					node.property.name === 'query'
				) {
					context.report({
						node,
						messageId: 'noDirectQuery',
					})
				}
			},
		}
	},
}
