import { RequestPresignedUrlApiResponse } from '@api/otherApi'
import { useCallback } from 'react'

type Props = {
	file: File
	presignedUrl: RequestPresignedUrlApiResponse
}

export function useBucketFileUpload() {
	const perform = useCallback(async ({ file, presignedUrl }: Props) => {
		const formData = new FormData()
		Object.entries(presignedUrl.fields).forEach(([key, value]) => {
			formData.append(key, value as string)
		})
		formData.append('file', file)

		try {
			await fetch(presignedUrl.url, {
				method: 'POST',
				body: formData,
			})
		} catch (error) {
			console.error('Error uploading file:', error)
			throw new Error('Failed to upload file', { cause: error })
		}
	}, [])

	return [perform] as const
}
