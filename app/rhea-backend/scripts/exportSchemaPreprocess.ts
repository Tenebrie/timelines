#!/usr/bin/env -S npx tsx
/**
 * Preprocess a generated DataMigrationService .d.ts file into a simplified,
 * self-contained `ExportedUserData` type.
 *
 * - Extracts the inner shape of the `exportUserData` return type
 * - Wraps it as `export type ExportedUserData = { version: 1, user: ... }`
 * - Drops the `DataMigrationService` const, the `Awaited<...>` alias and the default export
 * - Resolves `import('....').<EnumName>` references by reading the enum source
 *   file at the path embedded in the import and inlining the referenced enums
 *
 * Usage:
 *   npx tsx preprocess.ts <input.d.ts> <output.d.ts>
 *
 * The enum file path is read from the `import('...')` strings in the input.
 * If the import resolves to a `.js` extension, `.d.ts` is also tried.
 */

import * as fs from 'node:fs'
import * as path from 'node:path'

interface EnumDecl {
	name: string
	values: string[]
	/** Emitted form: `export type Foo = "A" | "B"` — flat union, ts-to-zod-friendly. */
	source: string
}

/**
 * Parse all enum declarations of the shape:
 *
 *     export declare const Foo: {
 *         readonly A: "A";
 *         readonly B: "B";
 *     };
 *     export type Foo = (typeof Foo)[keyof typeof Foo];
 *
 * and emit each as a flat string-literal union, e.g.
 *
 *     export type Foo = "A" | "B";
 *
 * The flat-union form is required because ts-to-zod cannot parse the
 * `(typeof X)[keyof typeof X]` indexed-access form Prisma generates.
 */
function parseEnums(enumsSource: string): Map<string, EnumDecl> {
	const enums = new Map<string, EnumDecl>()

	const constRegex = /export declare const (\w+):\s*\{/g
	let m: RegExpExecArray | null
	while ((m = constRegex.exec(enumsSource)) !== null) {
		const name = m[1]
		const braceStart = enumsSource.indexOf('{', m.index)
		if (braceStart === -1) continue

		// Brace-balanced walk to the matching `}`.
		let depth = 0
		let i = braceStart
		for (; i < enumsSource.length; i++) {
			const ch = enumsSource[i]
			if (ch === '{') depth++
			else if (ch === '}') {
				depth--
				if (depth === 0) break
			}
		}
		if (depth !== 0) continue

		const body = enumsSource.slice(braceStart + 1, i)

		// Extract the literal values: `readonly Name: "Value";` lines.
		// We use the value side (right of the colon) since that's what the
		// indexed-access type would resolve to at runtime.
		const valueRegex = /readonly\s+\w+\s*:\s*"([^"]+)"/g
		const values: string[] = []
		let v: RegExpExecArray | null
		while ((v = valueRegex.exec(body)) !== null) {
			values.push(v[1])
		}

		if (values.length === 0) continue

		const union = values.map((s) => JSON.stringify(s)).join(' | ')
		const source = `export type ${name} = ${union};`

		enums.set(name, { name, values, source })
	}

	return enums
}

/**
 * Find the body of `exportUserData: (userId: string) => Promise<{ ... }>`
 * and return the text inside the outermost `Promise<...>`.
 */
function extractPromiseBody(source: string): string {
	const marker = 'exportUserData: (userId: string) => Promise<'
	const start = source.indexOf(marker)
	if (start === -1) {
		throw new Error('Could not find exportUserData signature in input file')
	}

	const promiseStart = start + marker.length
	let depth = 1
	let i = promiseStart
	for (; i < source.length; i++) {
		const ch = source[i]
		if (ch === '<') depth++
		else if (ch === '>') {
			depth--
			if (depth === 0) break
		}
	}
	if (depth !== 0) {
		throw new Error('Unbalanced angle brackets in Promise<...>')
	}

	return source.slice(promiseStart, i)
}

/**
 * Replace every `import('....').EnumName` reference with just `EnumName`,
 * collect the set of enum names referenced, and the import paths used.
 */
function resolveEnumImports(body: string): {
	body: string
	usedEnums: Set<string>
	importPaths: Set<string>
} {
	const usedEnums = new Set<string>()
	const importPaths = new Set<string>()
	const importRegex = /import\(\s*['"]([^'"]+)['"]\s*\)\.(\w+)/g
	const resolved = body.replace(importRegex, (_full, importPath: string, name: string) => {
		usedEnums.add(name)
		importPaths.add(importPath)
		return name
	})
	return { body: resolved, usedEnums, importPaths }
}

/**
 * Resolve an `import('...')` path (relative to the input .d.ts) to a real file.
 * Tries the path as-is, then swaps `.js` → `.d.ts`, then appends `.d.ts`.
 */
function resolveEnumFilePath(inputPath: string, importPath: string): string {
	const baseDir = path.dirname(path.resolve(inputPath))
	const resolved = path.resolve(baseDir, importPath)

	const candidates: string[] = [resolved]
	if (resolved.endsWith('.js')) {
		candidates.push(resolved.slice(0, -'.js'.length) + '.d.ts')
	} else if (!path.extname(resolved)) {
		candidates.push(resolved + '.d.ts')
	}

	for (const c of candidates) {
		if (fs.existsSync(c)) return c
	}

	throw new Error(
		`Could not resolve enum import '${importPath}' from ${inputPath}.\nTried:\n  ${candidates.join('\n  ')}`,
	)
}

function dedent(body: string, levels = 1): string {
	const indent = '\t'.repeat(levels)
	return body
		.split('\n')
		.map((line) => (line.startsWith(indent) ? line.slice(indent.length) : line))
		.join('\n')
}

function main() {
	const [, , inputPath, outputPath, versionArg] = process.argv
	if (!inputPath || !outputPath || !versionArg) {
		console.error('Usage: npx tsx preprocess.ts <input.d.ts> <output.d.ts> <version>')
		process.exit(1)
	}

	const version = Number(versionArg)
	if (!Number.isInteger(version) || version < 1) {
		console.error(`Invalid version: ${versionArg} (must be a positive integer)`)
		process.exit(1)
	}

	const inputSource = fs.readFileSync(inputPath, 'utf8')
	const promiseBody = extractPromiseBody(inputSource)
	const { body: resolvedBody, usedEnums, importPaths } = resolveEnumImports(promiseBody)

	// Realistically there's only one import path (the prisma enums file),
	// but supporting more costs nothing.
	const allEnums = new Map<string, EnumDecl>()
	for (const importPath of importPaths) {
		const enumFile = resolveEnumFilePath(inputPath, importPath)
		const source = fs.readFileSync(enumFile, 'utf8')
		for (const [name, decl] of parseEnums(source)) {
			if (!allEnums.has(name)) allEnums.set(name, decl)
		}
	}

	const missing = [...usedEnums].filter((n) => !allEnums.has(n))
	if (missing.length > 0) {
		throw new Error(`Could not find the following enums in resolved enum files: ${missing.join(', ')}`)
	}

	const enumBlocks = [...usedEnums]
		.sort()
		.map((name) => allEnums.get(name)!.source)
		.join('\n\n')

	const dedentedBody = dedent(resolvedBody, 1).trimEnd()

	// Lock the version field to the supplied literal rather than `number`.
	const finalBody = dedentedBody.replace(/\bversion:\s*number\b/, `version: ${version}`)

	const sourcesComment = [...importPaths].map((p) => `// Enums:  ${p}`).join('\n')

	const header = `// AUTO-GENERATED by preprocess.ts — do not edit by hand.
// Source: ${path.relative(path.dirname(outputPath), inputPath)}
${sourcesComment}
`

	const output = `${header}
${enumBlocks}

export type ExportedUserData = ${finalBody}
`

	fs.mkdirSync(path.dirname(outputPath), { recursive: true })
	fs.writeFileSync(outputPath, output, 'utf8')

	console.log(
		`Wrote ${outputPath} (${usedEnums.size} enum${usedEnums.size === 1 ? '' : 's'} inlined: ${[...usedEnums].sort().join(', ')})`,
	)
}

main()
