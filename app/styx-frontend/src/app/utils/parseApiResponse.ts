import { parseApiError } from './parseApiError'

export const parseApiResponse = <DataT, ErrorT>(
	response: { data: Required<DataT> } | { error?: ErrorT },
): { response: DataT; error: null } | { response: null; error: { status: number; message: string } } => {
	if ('data' in response && !('error' in response)) {
		return { response: response.data, error: null }
	}

	return {
		response: null,
		error: parseApiError(response.error),
	}
}
