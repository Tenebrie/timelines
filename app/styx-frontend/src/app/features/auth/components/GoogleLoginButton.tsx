import { useGoogleAuth } from '../hooks/useGoogleAuth'

export function GoogleLoginButton() {
	const { ready: googleReady } = useGoogleAuth()

	const isLegacyDomain = location.hostname.endsWith('.tenebrie.com')
	if (isLegacyDomain) {
		return null
	}

	return (
		<iframe
			src={getGoogleSignInIframeSrc()}
			style={{
				border: 'none',
				width: 40,
				height: 44,
				overflow: 'hidden',
				background: 'transparent',
				colorScheme: 'auto',
				opacity: googleReady ? 1 : 0,
				transition: 'opacity 0.2s ease-in',
			}}
		/>
	)
}

/**
 * Returns the base origin (without `app.` subdomain) for the Google Sign-In iframe.
 * e.g. `app.localhost` → `http://localhost`, `app.neverkin.com` → `https://neverkin.com`
 */
function getGoogleSignInOrigin(): string {
	const { protocol, hostname, port } = window.location
	const baseHost = hostname.replace(/^app\./, '')
	const portSuffix = port ? `:${port}` : ''
	return `${protocol}//${baseHost}${portSuffix}`
}

export function getGoogleSignInIframeSrc(): string {
	return `${getGoogleSignInOrigin()}/google-signin.html`
}
