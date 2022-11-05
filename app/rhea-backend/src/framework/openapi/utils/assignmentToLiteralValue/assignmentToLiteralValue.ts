import { Node } from 'ts-morph'
import { PropertyAssignment, SyntaxKind, VariableDeclaration } from 'typescript'
import { syntaxListToValues } from '../syntaxListToValues/syntaxListToValues'
import { wrapWithQuotes } from '../wrapWithQuotes/wrapWithQuotes'

type ReturnValue = {
	name: string
	value: string | ReturnValue[]
}

export const assignmentToLiteralValue = (
	node: Node<PropertyAssignment | VariableDeclaration>,
	depth = 0
): ReturnValue => {
	const identifier = node.getFirstChildByKind(SyntaxKind.Identifier)

	if (!identifier) {
		return {
			name: '"[Unknown]"',
			value: '"Unable to find a literal value: Unsupported node"',
		}
	}

	if (depth >= 50) {
		return {
			name: wrapWithQuotes(identifier.getText()),
			value: '"Unable to find literal value: Recursion depth"',
		}
	}

	const stringLiteralNode = node.getFirstChildByKind(SyntaxKind.StringLiteral)
	if (stringLiteralNode) {
		return {
			name: wrapWithQuotes(identifier.getText()),
			value: wrapWithQuotes(stringLiteralNode.getText()),
		}
	}

	const templateLiteralNode = node.getFirstChildByKind(SyntaxKind.NoSubstitutionTemplateLiteral)
	if (templateLiteralNode) {
		return {
			name: wrapWithQuotes(identifier.getText()),
			value: wrapWithQuotes(templateLiteralNode.getText()),
		}
	}

	const objectLiteralNode = node.getFirstChildByKind(SyntaxKind.ObjectLiteralExpression)
	if (objectLiteralNode) {
		const syntaxListNode = objectLiteralNode.getFirstChildByKind(SyntaxKind.SyntaxList)
		if (!syntaxListNode) {
			throw new Error('error')
		}
		return {
			name: wrapWithQuotes(identifier.getText()),
			value: syntaxListToValues(syntaxListNode, depth + 1),
		}
	}

	const implParentNode = node
		.getLastChildByKind(SyntaxKind.Identifier)
		?.getImplementations()[0]
		?.getNode()
		.getParent()

	if (!implParentNode) {
		throw new Error('error')
	}

	const implementationNode =
		implParentNode.asKind(SyntaxKind.PropertyAssignment) ||
		implParentNode.asKind(SyntaxKind.VariableDeclaration)

	if (implementationNode) {
		const valueFromAssignment = assignmentToLiteralValue(implementationNode, depth + 1)
		if (valueFromAssignment) {
			return {
				name: wrapWithQuotes(identifier.getText()),
				value: valueFromAssignment.value,
			}
		}
	}

	return {
		name: wrapWithQuotes(identifier.getText()),
		value: `"Unable to find a literal value: Unsupported node"`,
	}
}

export const resolveLiteralValue = (node: Node, depth = 0): string => {
	const kind = node.getKind()
	if (kind === SyntaxKind.StringLiteral || SyntaxKind.NoSubstitutionTemplateLiteral) {
		return wrapWithQuotes(node.getText())
	}

	// if (kind === SyntaxKind.ObjectLiteralExpression) {
	// 	return syntaxListToValues(node.getFirstChildByKind(SyntaxKind.SyntaxList), { quotes: true }, depth + 1)
	// }

	return 'Unable to find literal value'
}
