import { Node } from 'ts-morph'
import { SyntaxKind, SyntaxList } from 'typescript'
import { assignmentToLiteralValue } from '../assignmentToLiteralValue/assignmentToLiteralValue'
import { unwrapQuotes } from '../unwrapQuotes/unwrapQuotes'

type ReturnValue = {
	name: string
	value: string | ReturnValue[]
}

export const syntaxListToValues = (
	node: Node<SyntaxList>,
	{ quotes }: { quotes: boolean },
	depth = 0
): ReturnValue[] => {
	const identifier = node.getFirstChildByKind(SyntaxKind.Identifier)
	try {
		const values = node
			.getChildren()
			.map((child) => {
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
					const syntaxListValues = syntaxListToValues(syntaxListNode, { quotes }, depth + 1)
					return {
						name: identifier?.getText() || 'anonymousObject',
						value: syntaxListValues,
					}
				}

				return null
			})
			.filter((child) => !!child)

		return values
	} catch (err) {
		console.error(err)
	}
}
