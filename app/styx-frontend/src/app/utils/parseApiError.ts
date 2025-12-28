export const parseApiError = (error: unknown) => {
	const status = parseApiErrorStatus(error)

	if (typeof error === 'string' || typeof error === 'number') {
		return { status, message: String(error) }
	}

	if (typeof error !== 'object' || error === undefined || error === null) {
		return { status, message: 'Unknown error' }
	}

	if (!('data' in error) && 'error' in error && error.error === 'TypeError: Failed to fetch') {
		return {
			status,
			message: 'Unable to reach the server. Are you set to offline in dev tools?',
		}
	}

	if (!('data' in error) && 'error' in error && typeof error.error === 'string') {
		return { status, message: error.error }
	}

	if (!('data' in error)) {
		return { status, message: 'Unknown error' }
	}

	const errorData = (error as { data: unknown }).data
	if (typeof errorData === 'string' && errorData.startsWith('<html>')) {
		const match = errorData.match(/<title>([^<]+)<\/title>/)
		if (match) {
			return { status, message: match[1] }
		}
		return { status, message: 'Unknown nginx error' }
	}

	if (typeof errorData === 'string' || typeof errorData === 'number') {
		return { status, message: String(errorData) }
	}

	if (typeof errorData !== 'object' || errorData === null) {
		return { status, message: 'Unknown error' }
	}

	return errorData as {
		status: number
		message: string
	}
}

export const parseApiErrorStatus = (error: unknown) => {
	if (
		error &&
		typeof error === 'object' &&
		'originalStatus' in error &&
		typeof error.originalStatus === 'number'
	) {
		return error.originalStatus
	}

	return 218
}
