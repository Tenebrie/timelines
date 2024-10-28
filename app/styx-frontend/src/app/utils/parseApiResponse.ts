export const parseApiResponse = <DataT, ErrorT>(
	response: { data: DataT } | { error: ErrorT },
): { response: DataT; error: null } | { response: null; error: { status: number; message: string } } => {
	if (!('error' in response)) {
		return { response: response.data, error: null }
	}

	const error = response.error
	if (typeof error === 'string' || typeof error === 'number') {
		return { response: null, error: { status: 500, message: String(error) } }
	}

	if (typeof error !== 'object' || error === null) {
		return { response: null, error: { status: 500, message: 'Unknown error' } }
	}

	if (!('data' in error) && 'error' in error && error.error === 'TypeError: Failed to fetch') {
		return {
			response: null,
			error: { status: 500, message: 'Unable to reach the server. Are you set to offline in dev tools?' },
		}
	}

	if (!('data' in error) && 'error' in error && typeof error.error === 'string') {
		return { response: null, error: { status: 500, message: error.error } }
	}

	if (!('data' in error)) {
		return { response: null, error: { status: 500, message: 'Unknown error' } }
	}

	const errorData = (error as { data: unknown }).data
	if (typeof errorData === 'string' && errorData.startsWith('<html>')) {
		return { response: null, error: { status: 502, message: 'Unable to reach the server' } }
	}

	if (typeof errorData === 'string' || typeof errorData === 'number') {
		return { response: null, error: { status: 500, message: String(errorData) } }
	}

	if (typeof errorData !== 'object' || errorData === null) {
		return { response: null, error: { status: 500, message: 'Unknown error' } }
	}

	return {
		response: null,
		error: errorData as {
			status: number
			message: string
		},
	}
}
