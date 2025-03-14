import { randomBytes } from 'crypto'
import { existsSync, mkdirSync, writeFileSync } from 'fs'
import { readFileSync } from 'fs'
import { join } from 'path'

const RootPath = '/rhea/storage'

export const FileSystemService = {
	createFolder: (folderName: string) => {
		return new Promise<void>((resolve, reject) => {
			try {
				if (!existsSync(folderName)) {
					mkdirSync(folderName)
				}
				resolve()
			} catch (err) {
				reject(err)
			}
		})
	},

	saveFile: async (buffer: Buffer) => {
		await FileSystemService.createFolder('/rhea')
		await FileSystemService.createFolder(RootPath)
		return new Promise<string>((resolve, reject) => {
			const filename = randomBytes(16).toString('hex')
			const fullPath = join(RootPath, filename)
			try {
				writeFileSync(fullPath, Buffer.from(buffer))
				resolve(filename)
			} catch (err) {
				reject(err)
			}
		})
	},

	loadFile: (filename: string) => {
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
