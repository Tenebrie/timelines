/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { SyntaxKind, ts, Node } from 'ts-morph'
import { debugNode, debugNodes } from '../utils/printers/printers'

const isNullableUnionNode = (unionTypeNode: Node<ts.UnionTypeNode>) => {
	const syntaxListNode = unionTypeNode.getFirstDescendantByKind(SyntaxKind.SyntaxList)!

	const undefinedKeywordNodes = syntaxListNode.getChildrenOfKind(SyntaxKind.UndefinedKeyword)
	if (undefinedKeywordNodes.length > 0) {
		return true
	}
	const nullKeywordNodes = syntaxListNode.getChildrenOfKind(SyntaxKind.NullKeyword)
	if (nullKeywordNodes.length > 0) {
		return true
	}
	const literalTypeNodes = syntaxListNode.getChildrenOfKind(SyntaxKind.LiteralType)
	return literalTypeNodes.some((node) => node.getText() === 'null')
}

const getShapeOfValidatedParam = (arrowFunctionNode: Node<ts.ArrowFunction>) => {
	/**
	 * Look at the first parameter in the list (we're expecting a single-param syntax list). Then, look at the last child to determine shape.
	 * If the second child of the parameter node is a question mark token, assume this parameter is optional.
	 */
	const syntaxListNode = arrowFunctionNode.getFirstDescendantByKind(SyntaxKind.SyntaxList)
	const firstParamNode = syntaxListNode?.getFirstDescendantByKind(SyntaxKind.Parameter)

	const isOptional = firstParamNode?.getChildAtIndex(1)?.isKind(SyntaxKind.QuestionToken)

	const paramTypeNode = firstParamNode!.getLastChild()!
	switch (paramTypeNode.getKind()) {
		case SyntaxKind.StringKeyword:
			return { shape: 'string', optional: isOptional }
		case SyntaxKind.NumberKeyword:
			return { shape: 'number', optional: isOptional }
		case SyntaxKind.UnionType:
			return {
				shape: 'string',
				optional: isOptional || isNullableUnionNode(paramTypeNode.asKind(SyntaxKind.UnionType)!),
			}
		default:
			return { shape: 'unknown', optional: isOptional }
	}
}

export const findNodeImplementation = (node: Node): Node => {
	if (node.getKind() === SyntaxKind.Identifier) {
		const implementation = node.asKind(SyntaxKind.Identifier)!.getImplementations()[0].getNode().getParent()!
		const assignmentValueNode = implementation.getLastChild()!
		return findNodeImplementation(assignmentValueNode)
	}

	return node
}

export const getShapeOfObjectLiteral = (objectLiteralNode: Node<ts.ObjectLiteralExpression>) => {
	const syntaxListNode = objectLiteralNode.getFirstDescendantByKind(SyntaxKind.SyntaxList)!
	const assignmentNodes = syntaxListNode.getDescendantsOfKind(SyntaxKind.PropertyAssignment)!

	const properties = assignmentNodes.map((node) => {
		const identifierNode = node.getFirstDescendantByKind(SyntaxKind.Identifier)!
		const identifierName = identifierNode.getText()

		const shape = (() => {
			const assignmentValueNode = node.getLastChild()!
			const targetNode = findNodeImplementation(assignmentValueNode)

			if (targetNode.isKind(SyntaxKind.ArrowFunction)) {
				return getShapeOfValidatedParam(targetNode.asKind(SyntaxKind.ArrowFunction)!)
			}
			return {
				shape: 'unknown',
				optional: false,
			}
		})()

		return {
			identifier: identifierName,
			...shape,
		}
	})

	return properties || []
}
