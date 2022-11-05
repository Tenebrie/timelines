import { errorNameToReason, errorNameToStatusCode } from '../../errors/HttpError'
import { SyntaxKind, ts, Node } from 'ts-morph'
import { footprintOfTypeWithoutFormatting } from '../utils/footprintOfType'
import { syntaxListToValues } from '../utils/syntaxListToValues/syntaxListToValues'
import { EndpointData } from '../types'

export const parseEndpoint = (node: Node<ts.Node>) => {
	const endpointMethod = node
		.getFirstDescendantByKind(SyntaxKind.PropertyAccessExpression)
		?.getText()
		.split('.')[1]
		.toUpperCase()

	const endpointText = node.getFirstDescendantByKind(SyntaxKind.StringLiteral)?.getText() ?? ''
	const endpointPath = endpointText.substring(1, endpointText.length - 1)

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

	// API documentation
	try {
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
	} catch (err) {
		console.error('Error', err)
	}

	// Request params
	try {
		const hookNode = node.getFirstDescendant((subnode) => subnode.getText() === 'useRequestParams')
		if (hookNode) {
			const returnType = hookNode.getFirstAncestorByKind(SyntaxKind.CallExpression)?.getReturnType()

			if (!returnType) {
				throw new Error('error')
			}

			const rawParams = footprintOfTypeWithoutFormatting({
				node,
				type: returnType,
			})

			const jsonParams = JSON.parse(rawParams)

			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
			// @ts-ignore
			const params: typeof endpointData['params'] = Object.keys(jsonParams).map((key) => ({
				name: key,
				signature: jsonParams[key],
			}))

			endpointData.params = params
		}
	} catch (err) {
		console.error('Error', err)
	}

	// Request body
	try {
		const hookNode = node.getFirstDescendant((subnode) => subnode.getText() === 'useRequestBody')

		if (hookNode) {
			const returnType = hookNode.getFirstAncestorByKind(SyntaxKind.CallExpression)?.getReturnType()

			if (!returnType) {
				throw new Error('error')
			}

			const rawBody = footprintOfTypeWithoutFormatting({
				node,
				type: returnType,
			})

			const jsonBody = JSON.parse(rawBody)

			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
			// @ts-ignore
			const body: typeof endpointData['body'] = Object.keys(jsonBody).map((key) => ({
				name: key,
				signature: jsonBody[key],
				required: true,
			}))

			endpointData.body = body
		}
	} catch (err) {
		console.error('Error', err)
	}

	// Request response
	try {
		const stripPromise = (val: string) => {
			const trimmedVal = val.trim()
			if (!trimmedVal || !trimmedVal.startsWith('Promise')) {
				return trimmedVal
			}
			return trimmedVal.substring(8, trimmedVal.length - 1)
		}

		const returnTypeTwo = node
			.getFirstChildByKind(SyntaxKind.CallExpression)
			?.getFirstChildByKind(SyntaxKind.SyntaxList)
			?.getFirstChildByKind(SyntaxKind.ArrowFunction)
			?.getReturnType()

		if (!returnTypeTwo) {
			throw new Error('error')
		}

		const returnType = footprintOfTypeWithoutFormatting({
			node,
			type: returnTypeTwo,
		})

		console.log('Here')
		console.log(stripPromise(returnType))

		const allReturnTypes = stripPromise(returnType)
			.replace(/[?]/g, '')
			.split('|')
			.map((type) => type.trim())
			.map((type) => JSON.parse(type) as Record<string, any>)

		const throwStatements = node.getDescendantsOfKind(SyntaxKind.ThrowStatement).map((st) => {
			const identifier = st
				?.getFirstChildByKind(SyntaxKind.NewExpression)
				?.getFirstChildByKind(SyntaxKind.Identifier)

			const syntaxListNode = st
				?.getFirstChildByKind(SyntaxKind.NewExpression)
				?.getFirstChildByKind(SyntaxKind.SyntaxList)

			if (!identifier || !syntaxListNode) {
				throw new Error('error')
			}

			const message = syntaxListToValues(syntaxListNode)

			return {
				name: identifier.getText(),
				message: message[0].value,
			}
		})

		const responses: {
			status: number
			signature: any
		}[] = []

		allReturnTypes.forEach((type) => {
			responses.push({
				status: 200,
				signature: type,
			})
		})

		throwStatements.forEach((thr) => {
			responses.push({
				status: errorNameToStatusCode(thr.name),
				signature: {
					status: errorNameToStatusCode(thr.name),
					reason: errorNameToReason(thr.name),
					message: thr.message,
				},
			})
		})

		endpointData.responses = responses
	} catch (err) {
		console.error('Error', err)
	}

	return endpointData
}
