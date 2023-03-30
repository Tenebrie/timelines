export const parseApiError = (response: { data: unknown } | { error: unknown }) => {
	if (!('error' in response)) {
		return null
	}

	const error = response.error
	if (typeof error === 'string' || typeof error === 'number') {
		return { status: 500, message: String(error) }
	}

	if (typeof error !== 'object' || error === null) {
		return { status: 500, message: 'Unknown error' }
	}

	if (!('data' in error)) {
		return { status: 500, message: 'Unknown error' }
	}

	const data = (error as { data: unknown }).data
	if (typeof data === 'string' || typeof data === 'number') {
		return { status: 500, message: String(data) }
	}

	if (typeof data !== 'object' || data === null) {
		return { status: 500, message: 'Unknown error' }
	}

	return data as {
		status: number
		message: string
	}
}
