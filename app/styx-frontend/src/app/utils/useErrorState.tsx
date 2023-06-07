import { useCallback, useState } from 'react'

type RecordElement<T> = {
	[K in keyof T]: {
		type: K
		data: T[K]
	}
}[keyof T]

export const useErrorState = <ErrorListT extends Record<any, unknown>>() => {
	type ErrorElementsT = RecordElement<ErrorListT>
	const [currentError, setCurrentError] = useState<ErrorElementsT | null>(null)

	const raiseError = useCallback(
		<TypeT extends ErrorElementsT['type'], DataT extends ErrorListT[TypeT]>(type: TypeT, data: DataT) => {
			if (currentError && currentError.type === type && currentError.data === data) {
				return
			}
			setCurrentError(() => ({
				type,
				data,
			}))
		},
		[currentError]
	)

	const clearError = useCallback(() => {
		setCurrentError(null)
	}, [])

	return {
		error: currentError,
		raiseError,
		clearError,
	}
}
