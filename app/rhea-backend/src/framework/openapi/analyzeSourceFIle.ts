import { SourceFile } from 'ts-morph'
import { parseEndpoint } from './parseEndpoint/parseEndpoint'
import { EndpointData } from './types'

export const analyzeSourceFile = (sourceFile: SourceFile): EndpointData[] => {
	const endpoints: EndpointData[] = []

	sourceFile.forEachChild((node) => {
		if (node.getText().includes('router.get') || node.getText().includes('router.post')) {
			const result = parseEndpoint(node)
			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
			// @ts-ignore
			endpoints.push(result)
		}
	})
	return endpoints
}
