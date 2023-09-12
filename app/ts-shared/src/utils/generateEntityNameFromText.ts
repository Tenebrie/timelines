export const generateEntityNameFromText = ({ source }: { source: string }) => {
	const allowedRegex = /^[^.!?;()[\]|/]+/iu
	const regexResult = allowedRegex.exec(source)
	if (regexResult) {
		return regexResult[0].trim().slice(0, 256).trim()
	}
	return null
}
