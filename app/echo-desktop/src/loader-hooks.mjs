/**
 * ESM resolve hook applying the runtime substitutions in dev mode (packaged
 * builds compile them in via esbuild aliases instead).
 */
import { RUNTIME_SHIMS } from './substitutions.mjs'

const redirects = new Map(
	Object.entries(RUNTIME_SHIMS).map(([specifier, shim]) => [
		specifier,
		new URL(shim, import.meta.url).href,
	]),
)

const prismaClientWrap = new URL('./prisma-client-wrap.mjs', import.meta.url).href

export async function resolve(specifier, context, nextResolve) {
	const target = redirects.get(specifier)
	if (target && !context.parentURL?.includes('echo-desktop/src')) {
		return { url: target, shortCircuit: true }
	}
	const resolved = await nextResolve(specifier, context)
	if (
		resolved.url.endsWith('/rhea-backend/dist/prisma/client/client.js') &&
		!specifier.includes('nkd-original')
	) {
		return { url: prismaClientWrap, shortCircuit: true }
	}
	return resolved
}
