import { Node } from 'ts-morph'

export const debugNode = (node: Node | undefined) => {
	console.info('Node:')
	if (!node) {
		console.info('Node is undefined')
		return
	}
	console.info({
		kind: node.getKindName(),
		text: node.getText(),
	})
	debugNodeChildren(node)
}

export const debugNodes = (nodes: Node[] | undefined) => {
	console.info('Nodes:')
	if (!nodes) {
		console.info('Nodes are undefined')
		return
	}
	nodes.forEach((node) => debugNode(node))
}

export const debugNodeChildren = (node: Node) => {
	console.info('Children:')
	if (!node) {
		console.info('Node is undefined')
		return
	}
	const values = node.getChildren().map((child) => ({
		kind: child.getKindName(),
		text: child.getText(),
	}))
	console.info(values)
}

export const debugObject = (object: Record<any, any>) => {
	// eslint-disable-next-line @typescript-eslint/no-var-requires
	const util = require('util')
	console.log(util.inspect(object, { showHidden: false, depth: null, colors: true }))
}
