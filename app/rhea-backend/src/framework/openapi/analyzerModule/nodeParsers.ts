/* eslint-disable @typescript-eslint/no-non-null-assertion */
import {
	SyntaxKind,
	ts,
	Node,
	TypeReferenceNode,
	PropertySignature,
	PropertyAssignment,
	Type,
	PropertyAccessExpression,
	ShorthandPropertyAssignment,
} from 'ts-morph'
import { ShapeOfProperty, ShapeOfType } from './types'

export const findNodeImplementation = (node: Node): Node => {
	if (node.getKind() === SyntaxKind.Identifier) {
		if (!node.asKind(SyntaxKind.Identifier)!.getImplementations()[0]) {
			throw new Error('No implementation available')
		}
		const implementation = node.asKind(SyntaxKind.Identifier)!.getImplementations()[0].getNode().getParent()!
		const assignmentValueNode = implementation.getLastChild()!
		return findNodeImplementation(assignmentValueNode)
	}

	return node
}

export const findPropertyAssignmentValueNode = (
	node:
		| PropertyAssignment
		| TypeReferenceNode
		| PropertySignature
		| PropertyAccessExpression
		| ShorthandPropertyAssignment
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

	// Undefined
	const undefinedNode = node.asKind(SyntaxKind.UndefinedKeyword)
	if (undefinedNode) {
		return 'undefined'
	}

	// Literal type
	const literalNode = node.asKind(SyntaxKind.LiteralType)
	if (literalNode) {
		if (literalNode.getFirstChildByKind(SyntaxKind.TrueKeyword)) {
			return 'true'
		}
		if (literalNode.getFirstChildByKind(SyntaxKind.FalseKeyword)) {
			return 'false'
		}
	}

	// Boolean literal
	const booleanLiteralNode =
		node.asKind(SyntaxKind.BooleanKeyword) ||
		node.asKind(SyntaxKind.TrueKeyword) ||
		node.asKind(SyntaxKind.FalseKeyword)
	if (booleanLiteralNode) {
		return 'boolean'
	}

	// String literal
	const stringLiteralNode = node.asKind(SyntaxKind.StringKeyword) || node.asKind(SyntaxKind.StringLiteral)
	if (stringLiteralNode) {
		return 'string'
	}

	// Number literal
	const numberLiteralNode = node.asKind(SyntaxKind.NumberKeyword) || node.asKind(SyntaxKind.NumericLiteral)
	if (numberLiteralNode) {
		return 'number'
	}

	// Type literal
	const typeLiteralNode = node.asKind(SyntaxKind.TypeLiteral)
	if (typeLiteralNode) {
		const properties = typeLiteralNode
			.getFirstChildByKind(SyntaxKind.SyntaxList)!
			.getChildrenOfKind(SyntaxKind.PropertySignature)

		const propertyShapes = properties.map((propNode) => {
			const identifier = propNode.getFirstChildByKind(SyntaxKind.Identifier)!
			const valueNode = findPropertyAssignmentValueNode(propNode)
			const questionMarkToken = identifier.getNextSiblingIfKind(SyntaxKind.QuestionToken)
			return {
				role: 'property' as const,
				identifier: identifier.getText(),
				shape: getRecursiveNodeShape(valueNode),
				optional: valueNode.getType().isNullable() || !!questionMarkToken,
			}
		})
		return propertyShapes
	}

	// Type reference
	const typeReferenceNode = node.asKind(SyntaxKind.TypeReference)
	if (typeReferenceNode) {
		return getRecursiveNodeShape(typeReferenceNode.getFirstChild()!)
	}

	// Property access expression
	const propertyAccessNode = node.asKind(SyntaxKind.PropertyAccessExpression)
	if (propertyAccessNode) {
		const lastChild = findNodeImplementation(node.getLastChild()!)
		return getProperTypeShape(lastChild.asKind(SyntaxKind.CallExpression)!.getReturnType(), lastChild)
	}

	// Union type
	const unionTypeNode = node.asKind(SyntaxKind.UnionType)
	if (unionTypeNode) {
		return getProperTypeShape(unionTypeNode.getType(), node)
	}

	// Typeof query
	const typeQueryNode = node.asKind(SyntaxKind.TypeQuery)
	if (typeQueryNode) {
		return getRecursiveNodeShape(typeQueryNode.getLastChild()!)
	}

	// Qualified name
	const qualifiedNameNode = node.asKind(SyntaxKind.QualifiedName)
	if (qualifiedNameNode) {
		return getRecursiveNodeShape(qualifiedNameNode.getLastChild()!)
	}

	// // Validator call expression
	// const callExpressionNode = node.asKind(SyntaxKind.CallExpression)
	// if (callExpressionNode) {
	// 	debugNode(callExpressionNode)
	// 	return getValidatorPropertyShape(
	// 		findNodeImplementation(node.getFirstChildByKind(SyntaxKind.SyntaxList)!.getFirstChild()!)
	// 	)
	// }

	// Call expression
	const callExpressionNode = node.asKind(SyntaxKind.CallExpression)
	if (callExpressionNode) {
		return getProperTypeShape(callExpressionNode.getReturnType(), callExpressionNode)
	}

	// Await expression
	const awaitExpressionNode = node.asKind(SyntaxKind.AwaitExpression)
	if (awaitExpressionNode) {
		// debugNode(awaitExpressionNode)
		return getRecursiveNodeShape(awaitExpressionNode.getChildAtIndex(1)!)
	}

	// 'As' Expression
	const asExpressionNode = node.asKind(SyntaxKind.AsExpression)
	if (asExpressionNode) {
		return getRecursiveNodeShape(asExpressionNode.getChildAtIndex(2)!)
	}

	// debugNode(node)

	// TODO
	return 'unknown_1'
}

export const getShapeOfValidatorLiteral = (
	objectLiteralNode: Node<ts.ObjectLiteralExpression>
): ShapeOfProperty[] => {
	const syntaxListNode = objectLiteralNode.getFirstDescendantByKind(SyntaxKind.SyntaxList)!
	const assignmentNodes = syntaxListNode.getChildrenOfKind(SyntaxKind.PropertyAssignment)!

	const properties = assignmentNodes.map((node) => {
		const identifierNode = node.getFirstDescendantByKind(SyntaxKind.Identifier)!
		const identifierName = identifierNode.getText()

		const assignmentValueNode = node.getLastChild()!
		const innerLiteralNode = findNodeImplementation(assignmentValueNode)

		return {
			role: 'property' as const,
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

		return 'unknown_3'
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
		return getProperTypeShape(returnType, rehydratePropertyAssignment)
	}

	return 'unknown_2'
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

export const getProperTypeShape = (typeOrPromise: Type, atLocation: Node): ShapeOfType['shape'] => {
	const type = (() => {
		if (typeOrPromise.getText().startsWith('Promise')) {
			return typeOrPromise.getTypeArguments()[0]
		}
		return typeOrPromise
	})()

	if (type.getText() === 'void') {
		return 'void'
	}

	if (type.isAny()) {
		return 'any'
	}

	if (type.isNull()) {
		return 'null'
	}

	if (type.isUndefined()) {
		return 'undefined'
	}

	if (type.isBoolean() || type.isBooleanLiteral()) {
		return 'boolean'
	}

	if (type.isString() || type.isStringLiteral() || type.isTemplateLiteral()) {
		return 'string'
	}

	if (type.isNumber() || type.isNumberLiteral()) {
		return 'number'
	}

	if (type.isArray()) {
		return [
			{
				role: 'array' as const,
				shape: getProperTypeShape(type.getArrayElementType()!, atLocation),
				optional: false,
			},
		]
	}

	if (type.isObject()) {
		return type.getProperties().map((prop) => {
			const valueDeclaration = prop.getValueDeclaration()!
			const valueDeclarationNode =
				valueDeclaration.asKind(SyntaxKind.PropertySignature) ||
				valueDeclaration.asKind(SyntaxKind.PropertyAssignment) ||
				valueDeclaration.asKind(SyntaxKind.ShorthandPropertyAssignment)

			if (!valueDeclarationNode) {
				return {
					role: 'property',
					identifier: prop.getName(),
					shape: 'unknown_4',
					optional: false,
				}
			}

			const isOptional =
				!!valueDeclarationNode.getFirstChildByKind(SyntaxKind.QuestionToken) ||
				valueDeclarationNode.getType().isNullable()

			const shape = getProperTypeShape(prop.getTypeAtLocation(atLocation), atLocation)
			return {
				role: 'property',
				identifier: prop.getName(),
				shape: shape,
				optional: isOptional,
			}
		})
	}

	if (type.isUnion()) {
		const unfilteredShapes: ShapeOfType[] = type.getUnionTypes().map((type) => ({
			role: 'union_entry',
			shape: getProperTypeShape(type, atLocation),
			optional: false,
		}))

		const dedupedShapes = unfilteredShapes.filter(
			(type, index, arr) => !arr.find((dup, dupIndex) => dup.shape === type.shape && dupIndex > index)
		)
		const hasUndefined = dedupedShapes.some((shape) => shape.shape === 'undefined')
		const shapes = dedupedShapes.filter((shape) => shape.shape !== 'undefined')
		if (shapes.length === 1) {
			return shapes[0].shape
		}
		return [
			{
				role: 'union',
				shape: shapes,
				optional: hasUndefined,
			},
		]
	}

	return 'unknown_5'
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
