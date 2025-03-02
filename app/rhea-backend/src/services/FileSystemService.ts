import { randomBytes } from 'crypto'
import { writeFileSync } from 'fs'
import { readFileSync } from 'fs'
import { join } from 'path'

const RootPath = '/rhea/storage'

export const FileSystemService = {
	saveFile: async (buffer: Buffer) => {
		const filename = randomBytes(16).toString('hex')
		const fullPath = join(RootPath, filename)
		await new Promise<void>((resolve, reject) => {
			try {
				writeFileSync(fullPath, Buffer.from(buffer))
				resolve()
			} catch (err) {
				reject(err)
			}
		})

		return filename
	},

	loadFile: async (filename: string) => {
		const fullPath = join(RootPath, filename)
		return new Promise<Buffer>((resolve, reject) => {
			try {
				const data = readFileSync(fullPath)
				resolve(data)
			} catch (err) {
				reject(err)
			}
		})
	},
}
