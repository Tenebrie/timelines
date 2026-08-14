/**
 * ESM resolve hook (registered via node:module `register` in launcher.mjs).
 * Redirects two bare specifiers to desktop shims for every module in the
 * process, which is exactly the surface the standalone mode needs to replace:
 *
 *   redis              -> in-memory store + pub/sub (redis-shim.mjs)
 *   @prisma/adapter-pg -> embedded PGlite driver adapter (adapter-pg-shim.mjs)
 *
 * Everything else resolves normally, from each app's own node_modules.
 */
const redirects = new Map([
	['redis', new URL('./redis-shim.mjs', import.meta.url).href],
	['@prisma/adapter-pg', new URL('./adapter-pg-shim.mjs', import.meta.url).href],
])

const prismaClientWrap = new URL('./prisma-client-wrap.mjs', import.meta.url).href

export async function resolve(specifier, context, nextResolve) {
	const target = redirects.get(specifier)
	if (target && !context.parentURL?.includes('echo-desktop/src')) {
		return { url: target, shortCircuit: true }
	}
	const resolved = await nextResolve(specifier, context)
	// Route every import of Rhea's generated Prisma client through the wrap
	// that raises the interactive-transaction limits (see prisma-client-wrap).
	// The ?nkd-original import inside the wrap itself passes through.
	if (
		resolved.url.endsWith('/rhea-backend/dist/prisma/client/client.js') &&
		!specifier.includes('nkd-original')
	) {
		return { url: prismaClientWrap, shortCircuit: true }
	}
	return resolved
}
