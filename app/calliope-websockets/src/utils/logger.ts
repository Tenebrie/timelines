export const Logger = {
	parseDocName: (docName: string) => {
		const split = docName.split(':')
		return `${split[0].split('-')[0]}::${split[1].split('-')[0]}`
	},

	yjsInfo: (docName: string, message: string) => {
		const doc = Logger.parseDocName(docName)
		console.info(`\x1b[36m[${doc}]\x1b[0m ${message}`)
	},

	yjsWarn: (docName: string, message: string) => {
		const doc = Logger.parseDocName(docName)
		console.warn(`\x1b[33m[${doc}]\x1b[0m ${message}`)
	},

	yjsError: (docName: string, message: string, error: unknown) => {
		const doc = Logger.parseDocName(docName)
		console.error(`\x1b[31m[${doc}]\x1b[0m ${message}`, error)
	},
}
