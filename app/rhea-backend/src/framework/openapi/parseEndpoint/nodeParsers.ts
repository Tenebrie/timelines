/* eslint-disable @typescript-eslint/no-non-null-assertion */
import {
	SyntaxKind,
	ts,
	Node,
	TypeReferenceNode,
	TypeLiteralNode,
	StringLiteral,
	PropertySignature,
	PropertyAssignment,
	ArrowFunction,
	Type,
} from 'ts-morph'
import { debugNode, debugNodes } from '../utils/printers/printers'
import { ShapeOfType } from './types'

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

export const findPropertyAssignmentValueNode = (
	node: PropertyAssignment | TypeReferenceNode | PropertySignature
): Node => {
	const identifierChildren = node.getChildrenOfKind(SyntaxKind.Identifier)
	if (identifierChildren.length === 2) {
		return findNodeImplementation(identifierChildren[1])
	}
	const lastMatchingChild = node.getChildren().reverse()
	return lastMatchingChild.find(
		(child) =>
			child.getKind() !== SyntaxKind.GreaterThanToken &&
			child.getKind() !== SyntaxKind.CommaToken &&
			child.getKind() !== SyntaxKind.SemicolonToken
	)!
}

export const getTypeReferenceShape = (node: TypeReferenceNode): ShapeOfType['shape'] => {
	return getRecursiveNodeShape(node.getFirstChildByKind(SyntaxKind.SyntaxList)!.getFirstChild()!)
}

export const getRecursiveNodeShape = (nodeOrReference: Node): ShapeOfType['shape'] => {
	const node = findNodeImplementation(nodeOrReference)

	// Boolean literal
	const booleanLiteralChildNode = node.asKind(SyntaxKind.BooleanKeyword)
	if (booleanLiteralChildNode) {
		return 'boolean'
	}

	// String literal
	const stringLiteralChildNode = node.asKind(SyntaxKind.StringKeyword)
	if (stringLiteralChildNode) {
		return 'string'
	}

	// Number literal
	const numberLiteralChildNode = node.asKind(SyntaxKind.NumberKeyword)
	if (numberLiteralChildNode) {
		return 'number'
	}

	// Type literal
	const typeLiteralChildNode = node.asKind(SyntaxKind.TypeLiteral)
	if (typeLiteralChildNode) {
		const properties = typeLiteralChildNode
			.getFirstChildByKind(SyntaxKind.SyntaxList)!
			.getChildrenOfKind(SyntaxKind.PropertySignature)

		const propertyShapes = properties.map((propNode) => {
			const identifier = propNode.getFirstChildByKind(SyntaxKind.Identifier)!
			const nodeAfterIdentifier = identifier.getNextSibling()!
			return {
				identifier: identifier.getText(),
				shape: getRecursiveNodeShape(findPropertyAssignmentValueNode(propNode)),
				optional: nodeAfterIdentifier.isKind(SyntaxKind.QuestionToken),
			}
		})
		return propertyShapes
	}

	// TODO
	return 'unknown'
}

export const getShapeOfValidatorLiteral = (
	objectLiteralNode: Node<ts.ObjectLiteralExpression>
): ShapeOfType[] => {
	const syntaxListNode = objectLiteralNode.getFirstDescendantByKind(SyntaxKind.SyntaxList)!
	const assignmentNodes = syntaxListNode.getChildrenOfKind(SyntaxKind.PropertyAssignment)!

	const properties = assignmentNodes.map((node) => {
		const identifierNode = node.getFirstDescendantByKind(SyntaxKind.Identifier)!
		const identifierName = identifierNode.getText()

		const assignmentValueNode = node.getLastChild()!
		const innerLiteralNode = findNodeImplementation(assignmentValueNode)

		return {
			identifier: identifierName,
			shape: getValidatorPropertyShape(innerLiteralNode),
			optional: getValidatorPropertyOptionality(innerLiteralNode),
		}
	})

	return properties || []
}

export const getValidatorPropertyShape = (innerLiteralNode: Node): ShapeOfType['shape'] => {
	// Inline definition with `as Validator<...>` clause
	const inlineValidatorAsExpression = innerLiteralNode
		.getParent()!
		.getFirstChildByKind(SyntaxKind.AsExpression)
	if (inlineValidatorAsExpression) {
		const typeReference = inlineValidatorAsExpression.getLastChildByKind(SyntaxKind.TypeReference)!
		return getTypeReferenceShape(typeReference)
	}

	// Variable with `: Validator<...>` clause
	const childTypeReferenceNode = innerLiteralNode.getParent()!.getFirstChildByKind(SyntaxKind.TypeReference)
	if (childTypeReferenceNode) {
		return getTypeReferenceShape(childTypeReferenceNode)
	}

	// `RequiredParam<...>` inline call expression
	if (innerLiteralNode.getParent()!.getChildrenOfKind(SyntaxKind.SyntaxList).length >= 2) {
		const typeNode = innerLiteralNode
			.getParent()!
			.getFirstChildByKind(SyntaxKind.SyntaxList)!
			.getFirstChild()!
		return getRecursiveNodeShape(typeNode)
	}

	// `RequestParam | RequiredParam | OptionalParam` call expression
	const childCallExpressionNode = innerLiteralNode.getParent()!.getFirstChildByKind(SyntaxKind.CallExpression)
	if (childCallExpressionNode) {
		const callExpressionArgument = findNodeImplementation(
			childCallExpressionNode.getFirstChildByKind(SyntaxKind.SyntaxList)!.getFirstChild()!
		)

		// Param is a type reference
		const typeReferenceNode = callExpressionArgument
			.getParent()!
			.getFirstChildByKind(SyntaxKind.TypeReference)!
		if (typeReferenceNode) {
			return getTypeReferenceShape(typeReferenceNode)
		}

		const thingyNode = callExpressionArgument
			.getParent()!
			.getFirstChildByKind(SyntaxKind.ObjectLiteralExpression)!
		if (thingyNode) {
			// debugNode(thingyNode)
			return getValidatorPropertyShape(thingyNode)
		}

		if (callExpressionArgument.getKind() === SyntaxKind.CallExpression) {
			return getValidatorPropertyShape(callExpressionArgument)
		}

		return 'unknown'
	}

	// Attempting to infer type from `rehydrate` function
	const innerNodePropertyAssignments = innerLiteralNode
		.getFirstChildByKind(SyntaxKind.SyntaxList)!
		.getChildrenOfKind(SyntaxKind.PropertyAssignment)
	const rehydratePropertyAssignment = innerNodePropertyAssignments.find((prop) => {
		return prop.getFirstChildByKind(SyntaxKind.Identifier)?.getText() === 'rehydrate'
	})
	if (rehydratePropertyAssignment) {
		const returnType = findPropertyAssignmentValueNode(rehydratePropertyAssignment)
			.asKind(SyntaxKind.ArrowFunction)!
			.getReturnType()
		return getProperTypeShape(returnType)
	}

	return 'unknown'
}

export const getValidatorPropertyOptionality = (node: Node): boolean => {
	const callExpressionNode = node.asKind(SyntaxKind.CallExpression)
	if (callExpressionNode) {
		const identifierNode = callExpressionNode.getFirstChildByKind(SyntaxKind.Identifier)
		if (identifierNode?.getText() === 'OptionalParam') {
			return true
		} else if (identifierNode?.getText() === 'RequiredParam') {
			return false
		}

		const syntaxListNode = callExpressionNode.getFirstChildByKind(SyntaxKind.SyntaxList)!
		const literalExpression = findNodeImplementation(syntaxListNode.getFirstChild()!)
		return getValidatorPropertyOptionality(literalExpression)
	}

	const syntaxListNode = node.getFirstDescendantByKind(SyntaxKind.SyntaxList)!
	const assignmentNodes = syntaxListNode.getChildrenOfKind(SyntaxKind.PropertyAssignment)!

	return assignmentNodes.some((node) => {
		const identifierNode = node.getFirstDescendantByKind(SyntaxKind.Identifier)!
		const identifierName = identifierNode.getText()

		if (identifierName === 'optional') {
			const value = findPropertyAssignmentValueNode(node)
			return value.getKind() === SyntaxKind.TrueKeyword
		}
		return false
	})
}

export const getProperTypeShape = (type: Type): ShapeOfType['shape'] => {
	if (type.isBoolean() || type.isBooleanLiteral()) {
		return 'boolean'
	}

	if (type.isString() || type.isStringLiteral()) {
		return 'string'
	}

	if (type.isNumber() || type.isNumberLiteral()) {
		return 'number'
	}

	if (type.isObject()) {
		return type.getProperties().map((prop) => {
			const valueDeclarationNode = prop.getValueDeclaration()!.asKind(SyntaxKind.PropertySignature)!
			const shape = getRecursiveNodeShape(findPropertyAssignmentValueNode(valueDeclarationNode))
			return {
				identifier: prop.getName(),
				shape: shape,
				optional: false,
			}
		})
	}
	return 'unknown'
}

export const getValuesOfObjectLiteral = (objectLiteralNode: Node<ts.ObjectLiteralExpression>) => {
	const syntaxListNode = objectLiteralNode.getFirstDescendantByKind(SyntaxKind.SyntaxList)!
	const assignmentNodes = syntaxListNode.getChildrenOfKind(SyntaxKind.PropertyAssignment)!

	const properties = assignmentNodes.map((node) => {
		const identifierNode = node.getFirstDescendantByKind(SyntaxKind.Identifier)!
		const identifierName = identifierNode.getText()

		const value = (() => {
			const assignmentValueNode = node.getLastChild()!
			const targetNode = findNodeImplementation(assignmentValueNode)

			if (targetNode.isKind(SyntaxKind.StringLiteral)) {
				return targetNode.getLiteralValue()
			}
			return null
		})()

		return {
			identifier: identifierName,
			value,
		}
	})

	return properties || []
}
