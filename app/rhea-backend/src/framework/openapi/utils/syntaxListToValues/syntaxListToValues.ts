import { Node } from 'ts-morph'
import { SyntaxKind, SyntaxList } from 'typescript'
import {
	assignmentToLiteralValue,
	resolveLiteralValue,
} from '../assignmentToLiteralValue/assignmentToLiteralValue'
import { unwrapQuotes } from '../unwrapQuotes/unwrapQuotes'

type ReturnValue = {
	name: string
	value: string | ReturnValue[]
}

export const syntaxListToValues = (node: Node<SyntaxList>, depth = 0): ReturnValue[] => {
	const identifier = node.getFirstChildByKind(SyntaxKind.Identifier)
	try {
		const values = node
			.getChildren()
			.map((child) => {
				const stringLiteralNode = child.asKind(SyntaxKind.StringLiteral)
				if (stringLiteralNode) {
					const literalValue = resolveLiteralValue(stringLiteralNode)
					return {
						name: identifier?.getText() || 'anonymousLiteral',
						value: typeof literalValue === 'string' ? unwrapQuotes(literalValue) : literalValue,
					}
				}

				const propertyAssignmentNode = child.asKind(SyntaxKind.PropertyAssignment)
				if (propertyAssignmentNode) {
					const literalValue = assignmentToLiteralValue(propertyAssignmentNode)
					return {
						name: unwrapQuotes(literalValue.name),
						value:
							typeof literalValue.value === 'string' ? unwrapQuotes(literalValue.value) : literalValue.value,
					}
				}

				const syntaxListNode = child.asKind(SyntaxKind.SyntaxList)
				if (syntaxListNode) {
					const syntaxListValues = syntaxListToValues(syntaxListNode, depth + 1)
					return {
						name: identifier?.getText() || 'anonymousObject',
						value: syntaxListValues,
					}
				}

				return null
			})
			.filter((child) => !!child)
			.map((child) => child as ReturnValue)

		return values
	} catch (err) {
		console.error(err)
	}
	return []
}
