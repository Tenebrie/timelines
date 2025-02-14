export const EntityNameService = {
	getEventCreateName: ({ name, description }: { name: string | undefined; description: string }) => {
		if (name && name.length > 0) {
			return name
		}

		const allowedRegex = /^[^.!?;()[\]|/\n]+/iu
		const regexResult = allowedRegex.exec(description)
		if (regexResult) {
			return regexResult[0].trim().slice(0, 64).trim()
		}
		return 'Unnamed event'
	},

	getEventUpdateName: ({
		name,
		description,
		customNameEnabled,
	}: {
		name: string | undefined
		description: string | undefined
		customNameEnabled: boolean | undefined
	}) => {
		if (customNameEnabled && name && name.length > 0) {
			return name
		}

		if (description) {
			const allowedRegex = /^[^.!?;()[\]|/\n]+/iu
			const regexResult = allowedRegex.exec(description)
			if (regexResult) {
				return regexResult[0].trim().slice(0, 64).trim()
			}
		}
		return 'Unnamed event'
	},
}
