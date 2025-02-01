export const parseApiError = (error: unknown) => {
	if (typeof error === 'string' || typeof error === 'number') {
		return { status: 500, message: String(error) }
	}

	if (typeof error !== 'object' || error === undefined || error === null) {
		return { status: 500, message: 'Unknown error' }
	}

	if (!('data' in error) && 'error' in error && error.error === 'TypeError: Failed to fetch') {
		return {
			status: 500,
			message: 'Unable to reach the server. Are you set to offline in dev tools?',
		}
	}

	if (!('data' in error) && 'error' in error && typeof error.error === 'string') {
		return { status: 500, message: error.error }
	}

	if (!('data' in error)) {
		return { status: 500, message: 'Unknown error' }
	}

	const errorData = (error as { data: unknown }).data
	if (typeof errorData === 'string' && errorData.startsWith('<html>')) {
		return { status: 502, message: 'Unable to reach the server' }
	}

	if (typeof errorData === 'string' || typeof errorData === 'number') {
		return { status: 500, message: String(errorData) }
	}

	if (typeof errorData !== 'object' || errorData === null) {
		return { status: 500, message: 'Unknown error' }
	}

	return errorData as {
		status: number
		message: string
	}
}
