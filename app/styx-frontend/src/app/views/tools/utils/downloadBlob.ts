export function downloadBlob(blob: Blob, filename: string) {
	const url = window.URL.createObjectURL(blob)
	// Create a temporary link element
	const a = document.createElement('a')
	a.style.display = 'none'
	a.href = url
	// Set the file name you want
	a.download = 'downloaded-image.png'
	document.body.appendChild(a)
	a.click()
	// Clean up the URL object and remove the element
	window.URL.revokeObjectURL(url)
	a.remove()
}
