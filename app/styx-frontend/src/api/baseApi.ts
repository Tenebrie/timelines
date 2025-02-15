import { retry } from '@reduxjs/toolkit/query'
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

import { RootState } from '@/app/store'
import { parseApiError } from '@/app/utils/parseApiError'
import { SESSION_HEADER_NAME } from '@/ts-shared/const/constants'

const baseQuery = fetchBaseQuery({
	baseUrl: '/',
	prepareHeaders: (headers, { getState }) => {
		const sessionId = (getState() as RootState).auth.sessionId
		if (sessionId) {
			headers.set(SESSION_HEADER_NAME, sessionId)
		}
		return headers
	},
})

const baseQueryWithRetry = retry(baseQuery, {
	backoff(attempt: number) {
		const baseDelay = 1000 // base delay in ms
		const delay = baseDelay * Math.pow(2, attempt) // exponential increase
		const jitter = Math.random() * 500 // add up to 500ms of random jitter
		return new Promise((resolve) => setTimeout(resolve, delay + jitter))
	},
	retryCondition(baseError, _, extraArgs) {
		const error = parseApiError(baseError)
		if (error.status <= 400) {
			return false
		}

		let maxRetries = 3
		if (error.status === 502) {
			maxRetries = 5
		}

		return extraArgs.attempt < maxRetries
	},
})

export const baseApi = createApi({
	baseQuery: baseQueryWithRetry,
	endpoints: () => ({}),
})
