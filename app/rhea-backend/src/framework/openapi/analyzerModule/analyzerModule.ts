import { SourceFile } from 'ts-morph'
import { parseEndpoint } from './parseEndpoint'
import { EndpointData } from '../types'

import * as path from 'path'
import { Project } from 'ts-morph'
import { OpenApiManager } from '../manager/OpenApiManager'

/**
 * @param tsconfigPath Path to tsconfig file relative to project root
 * @param sourceFilePaths Array of router source files relative to project root
 */
export const prepareOpenApiSpec = (tsconfigPath: string, sourceFilePaths: string[]) => {
	const project = new Project({
		tsConfigFilePath: path.resolve(tsconfigPath),
	})
	const resolvedSourceFilePaths = sourceFilePaths.map((filepath) => path.resolve(filepath))

	const openApiManager = OpenApiManager.getInstance()

	const sourceFiles = resolvedSourceFilePaths.map((filePath) => project.getSourceFileOrThrow(filePath))
	const endpoints = sourceFiles.flatMap((sourceFile) => analyzeSourceFile(sourceFile))

	openApiManager.setEndpoints(endpoints)
}

export const analyzeSourceFile = (sourceFile: SourceFile): EndpointData[] => {
	const endpoints: EndpointData[] = []

	sourceFile.forEachChild((node) => {
		if (node.getText().includes('router.get') || node.getText().includes('router.post')) {
			const result = parseEndpoint(node)
			endpoints.push(result)
		}
	})
	return endpoints
}
