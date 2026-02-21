export const baseUrl = (() => {
	const env = process.env.TARGET_ENV ?? 'local_ui'
	if (env === 'prod') {
		return 'https://timelines.tenebrie.com'
	} else if (env === 'staging') {
		return 'https://staging.tenebrie.com'
	} else if (env === 'local' || env === 'ci') {
		return 'http://gatekeeper:80'
	} else if (env === 'local_ui') {
		return 'http://localhost'
	}
	throw new Error(`Unknown TARGET_ENV: ${env}`)
})()

export const makeUrl = (path: string) => {
	if (path.startsWith('/')) {
		return `${baseUrl}${path}`
	} else {
		return `${baseUrl}/${path}`
	}
}
