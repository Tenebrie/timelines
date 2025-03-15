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

		const response = await fetch(presignedUrl.url, {
			method: 'POST',
			body: formData,
		})

		if (!response.ok) {
			const text = await response.text()
			console.error('Upload failed:', text)
			throw new Error('Failed to upload file', { cause: { response, text } })
		}
	}, [])

	return [perform] as const
}
