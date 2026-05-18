export async function base64ToFile(dataUrl: string, filename = 'image'): Promise<File> {
	const res = await fetch(dataUrl)
	const blob = await res.blob()
	const ext = blob.type.split('/')[1] ?? 'bin'
	return new File([blob], `${filename}.${ext}`, { type: blob.type })
}
