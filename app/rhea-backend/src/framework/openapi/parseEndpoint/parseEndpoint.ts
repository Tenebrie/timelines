/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { errorNameToReason, errorNameToStatusCode } from '../../errors/HttpError'
import { SyntaxKind, ts, Node } from 'ts-morph'
import { EndpointData } from '../types'
import { debugNode, debugNodes, debugObject } from '../utils/printers/printers'
import {
	findNodeImplementation,
	getShapeOfValidatorLiteral,
	getValidatorPropertyOptionality,
	getValidatorPropertyShape,
	getValuesOfObjectLiteral,
} from './nodeParsers'
import { useRequestJsonBody } from '@src/framework/useRequestObjectBody'
import { getNameOfDeclaration } from 'typescript'

export const parseEndpoint = (node: Node<ts.Node>) => {
	const endpointMethod = node
		.getFirstDescendantByKind(SyntaxKind.PropertyAccessExpression)!
		.getText()
		.split('.')[1]
		.toUpperCase()

	const endpointText = node.getFirstDescendantByKind(SyntaxKind.StringLiteral)!.getText() ?? ''
	const endpointPath = endpointText.substring(1, endpointText.length - 1)
	console.log(endpointPath)

	const endpointData: EndpointData = {
		method: endpointMethod as 'GET' | 'POST',
		path: endpointPath,
		params: [],
		query: [],
		rawBody: undefined,
		objectBody: [],
		responses: [],
		name: undefined,
		summary: undefined,
		description: undefined,
	}

	const warningData: string[] = []

	// API documentation
	try {
		const entries = parseApiDocumentation(node)
		entries.forEach((param) => {
			endpointData[param.identifier] = param.value
		})
	} catch (err) {
		console.error('Error', err)
	}

	// Request params
	try {
		endpointData.params = parseRequestParams(node, endpointPath)
		debugObject(endpointData.params)
	} catch (err) {
		warningData.push((err as Error).message)
		console.error('Error', err)
	}

	// Request query
	try {
		endpointData.query = parseRequestObjectInput(node, 'useRequestQuery')
		// debugObject(endpointData.query)
	} catch (err) {
		warningData.push((err as Error).message)
		console.error('Error', err)
	}

	// Raw request body
	try {
		const parsedBody = parseRequestRawBody(node)
		if (parsedBody) {
			endpointData.rawBody = parsedBody
			debugObject(endpointData.rawBody)
		}
	} catch (err) {
		warningData.push((err as Error).message)
		console.error('Error', err)
	}

	// Object request body
	try {
		endpointData.objectBody = [
			parseRequestObjectInput(node, 'useRequestJsonBody'),
			parseRequestObjectInput(node, 'useRequestFormBody'),
		].flat()
		debugObject(endpointData.objectBody)
	} catch (err) {
		warningData.push((err as Error).message)
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

const getHookNode = (
	endpointNode: Node<ts.Node>,
	hookName:
		| 'useApiEndpoint'
		| 'useRequestParams'
		| 'useRequestQuery'
		| 'useRequestJsonBody'
		| 'useRequestFormBody'
		| 'useRequestRawBody'
) => {
	const callExpressions = endpointNode.getDescendantsOfKind(SyntaxKind.CallExpression)
	const matchingCallExpressions = callExpressions.filter((node) => {
		return node.getFirstChildByKind(SyntaxKind.Identifier)?.getText() === hookName
	})
	return matchingCallExpressions[0] ?? null
}

const parseApiDocumentation = (node: Node<ts.Node>) => {
	const hookNode = getHookNode(node, 'useApiEndpoint')
	if (!hookNode) {
		return []
	}
	const paramNode = hookNode.getParent()!.getFirstDescendantByKind(SyntaxKind.SyntaxList)!
	const valueNode = findNodeImplementation(paramNode.getLastChild()!)

	if (!valueNode.isKind(SyntaxKind.ObjectLiteralExpression)) {
		throw new Error('Non-literal type used in useApiEndpoint')
	}

	const objectLiteral = valueNode.asKind(SyntaxKind.ObjectLiteralExpression)!
	return getValuesOfObjectLiteral(objectLiteral).filter((param) => param.value !== null)
}

const parseRequestParams = (node: Node<ts.Node>, endpointPath: string): EndpointData['params'] => {
	const hookNode = getHookNode(node, 'useRequestParams')
	if (!hookNode) {
		return []
	}

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
	return getShapeOfValidatorLiteral(objectLiteral)
		.filter((param) => param.shape !== null)
		.map((param) => ({
			identifier: param.identifier,
			signature: param.shape as string,
			optional: declaredParams.some((declared) => declared.name === param.identifier && declared.optional),
		}))
}

const parseRequestRawBody = (node: Node<ts.Node>): NonNullable<EndpointData['rawBody']> | null => {
	const hookNode = getHookNode(node, 'useRequestRawBody')
	if (!hookNode) {
		return null
	}
	const paramNode = hookNode.getParent()!.getFirstDescendantByKind(SyntaxKind.SyntaxList)!
	const valueNode = findNodeImplementation(paramNode.getLastChild()!)

	return {
		signature: getValidatorPropertyShape(valueNode),
		optional: getValidatorPropertyOptionality(valueNode),
	}
}

const parseRequestObjectInput = (
	node: Node<ts.Node>,
	nodeName: 'useRequestQuery' | 'useRequestJsonBody' | 'useRequestFormBody'
): EndpointData['query'] | EndpointData['objectBody'] => {
	const hookNode = getHookNode(node, nodeName)
	if (!hookNode) {
		return []
	}
	const paramNode = hookNode.getParent()!.getFirstDescendantByKind(SyntaxKind.SyntaxList)!
	const valueNode = findNodeImplementation(paramNode.getLastChild()!)

	if (!valueNode.isKind(SyntaxKind.ObjectLiteralExpression)) {
		throw new Error(`Non-literal type used in ${nodeName}`)
	}

	const objectLiteral = valueNode.asKind(SyntaxKind.ObjectLiteralExpression)!
	return getShapeOfValidatorLiteral(objectLiteral)
		.filter((param) => param.shape !== null)
		.map((param) => ({
			identifier: param.identifier,
			signature: param.shape as string,
			optional: param.optional,
		}))
}
