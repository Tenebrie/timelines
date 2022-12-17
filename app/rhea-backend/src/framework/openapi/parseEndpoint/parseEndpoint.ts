/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { errorNameToReason, errorNameToStatusCode } from '../../errors/HttpError'
import { SyntaxKind, ts, Node } from 'ts-morph'
import { footprintOfTypeWithoutFormatting } from '../utils/footprintOfType'
import { syntaxListToValues } from '../utils/syntaxListToValues/syntaxListToValues'
import { EndpointData } from '../types'
import { debugNode, debugNodes } from '../utils/printers/printers'
import { findNodeImplementation, getShapeOfObjectLiteral } from './nodeParsers'

export const parseEndpoint = (node: Node<ts.Node>) => {
	const endpointMethod = node
		.getFirstDescendantByKind(SyntaxKind.PropertyAccessExpression)
		?.getText()
		.split('.')[1]
		.toUpperCase()

	const endpointText = node.getFirstDescendantByKind(SyntaxKind.StringLiteral)?.getText() ?? ''
	const endpointPath = endpointText.substring(1, endpointText.length - 1)
	console.log(endpointPath)

	const endpointData: EndpointData = {
		method: endpointMethod as 'GET' | 'POST',
		path: endpointPath,
		params: [],
		body: [],
		responses: [],
		name: undefined,
		summary: undefined,
		description: undefined,
	}

	const warningData: string[] = []

	// API documentation
	try {
		parseApiDocumentation(endpointData, node)
	} catch (err) {
		console.error('Error', err)
	}

	// Request params
	try {
		endpointData.params = parseRequestParams(node, endpointPath)
	} catch (err) {
		warningData.push((err as Error).message)
		console.error('Error', err)
	}

	// Request body
	try {
		const hookNode = node.getFirstDescendant((subnode) => subnode.getText() === 'useRequestBody')

		if (hookNode) {
			const paramNode = hookNode.getParent()!.getFirstDescendantByKind(SyntaxKind.SyntaxList)!
			const valueNode = findNodeImplementation(paramNode.getLastChild()!)

			if (!valueNode.isKind(SyntaxKind.ObjectLiteralExpression)) {
				throw new Error('Non-literal type used in useRequestParams')
			}

			const objectLiteral = valueNode.asKind(SyntaxKind.ObjectLiteralExpression)!
			// endpointData.body = getShapeOfObjectLiteral(objectLiteral)
			// 	.filter((param) => param.shape !== null)
			// 	.map((param) => ({
			// 		name: param.identifier,
			// 		signature: param.shape as string,
			// 	}))
		}
	} catch (err) {
		console.error('Error', err)
	}

	// Request response
	try {
		// const stripPromise = (val: string) => {
		// 	const trimmedVal = val.trim()
		// 	if (!trimmedVal || !trimmedVal.startsWith('Promise')) {
		// 		return trimmedVal
		// 	}
		// 	return trimmedVal.substring(8, trimmedVal.length - 1)
		// }
		// const returnTypeTwo = node
		// 	.getFirstChildByKind(SyntaxKind.CallExpression)
		// 	?.getFirstChildByKind(SyntaxKind.SyntaxList)
		// 	?.getFirstChildByKind(SyntaxKind.ArrowFunction)
		// 	?.getReturnType()
		// if (!returnTypeTwo) {
		// 	throw new Error('error')
		// }
		// const returnType = footprintOfTypeWithoutFormatting({
		// 	node,
		// 	type: returnTypeTwo,
		// })
		// // console.log('Here')
		// // console.log(stripPromise(returnType))
		// const allReturnTypes = stripPromise(returnType)
		// 	.replace(/[?]/g, '')
		// 	.split('|')
		// 	.map((type) => type.trim())
		// 	.map((type) => JSON.parse(type) as Record<string, any>)
		// const throwStatements = node.getDescendantsOfKind(SyntaxKind.ThrowStatement).map((st) => {
		// 	const identifier = st
		// 		?.getFirstChildByKind(SyntaxKind.NewExpression)
		// 		?.getFirstChildByKind(SyntaxKind.Identifier)
		// 	const syntaxListNode = st
		// 		?.getFirstChildByKind(SyntaxKind.NewExpression)
		// 		?.getFirstChildByKind(SyntaxKind.SyntaxList)
		// 	if (!identifier || !syntaxListNode) {
		// 		throw new Error('error')
		// 	}
		// 	const message = syntaxListToValues(syntaxListNode)
		// 	return {
		// 		name: identifier.getText(),
		// 		message: message[0].value,
		// 	}
		// })
		// const responses: {
		// 	status: number
		// 	signature: any
		// }[] = []
		// allReturnTypes.forEach((type) => {
		// 	responses.push({
		// 		status: 200,
		// 		signature: type,
		// 	})
		// })
		// throwStatements.forEach((thr) => {
		// 	responses.push({
		// 		status: errorNameToStatusCode(thr.name),
		// 		signature: {
		// 			status: errorNameToStatusCode(thr.name),
		// 			reason: errorNameToReason(thr.name),
		// 			message: thr.message,
		// 		},
		// 	})
		// })
		// endpointData.responses = responses
	} catch (err) {
		console.error('Error', err)
	}

	return endpointData
}

const parseApiDocumentation = (endpointData: EndpointData, node: Node<ts.Node>) => {
	const hookNode = node.getFirstDescendant((subnode) => subnode.getText() === 'useApiEndpoint')

	if (hookNode) {
		const targetNode = hookNode.getFirstAncestorByKind(SyntaxKind.CallExpression)?.getChildAtIndex(2)

		const syntaxListNode = targetNode?.getChildAtIndex(0).getFirstChildByKind(SyntaxKind.SyntaxList)
		if (!syntaxListNode) {
			throw new Error('error')
		}

		const params = syntaxListToValues(syntaxListNode)

		const allowedValues = ['name', 'summary', 'description']
		allowedValues.forEach((prop) => {
			const matchingParam = params.find((param) => param.name === prop)
			if (matchingParam) {
				endpointData[prop] = matchingParam.value
			}
		})
	}
}

const parseRequestParams = (node: Node<ts.Node>, endpointPath: string): EndpointData['params'] => {
	const hookNode = node.getFirstDescendant((subnode) => subnode.getText() === 'useRequestParams')
	if (hookNode) {
		const paramNode = hookNode.getParent()!.getFirstDescendantByKind(SyntaxKind.SyntaxList)!
		const valueNode = findNodeImplementation(paramNode.getLastChild()!)

		if (!valueNode.isKind(SyntaxKind.ObjectLiteralExpression)) {
			throw new Error('Non-literal type used in useRequestParams')
		}

		const declaredParams = endpointPath
			.split('/')
			.filter((segment) => segment.startsWith(':'))
			.map((segment) => ({
				name: segment.substring(1).replace(/\?/, ''),
				optional: segment.includes('?'),
			}))

		const objectLiteral = valueNode.asKind(SyntaxKind.ObjectLiteralExpression)!
		return getShapeOfObjectLiteral(objectLiteral)
			.filter((param) => param.shape !== null)
			.map((param) => ({
				name: param.identifier,
				signature: param.shape as string,
				required: !declaredParams.some((declared) => declared.name === param.identifier && declared.optional),
			}))
	}
	return []
}
