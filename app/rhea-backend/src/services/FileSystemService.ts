import { statfs } from 'node:fs/promises'

export const FileSystemService = {
	getStorageStats: async () => {
		return {
			root: await FileSystemService.getDeviceStorageStats('/'),
			database: await FileSystemService.getDeviceStorageStats('/mnt/volume_rhea_postgres'),
		}
	},

	getDeviceStorageStats: async (devicePath: string) => {
		const stats = await statfs(devicePath)
		const blockSize = stats.bsize
		const totalSpace = stats.blocks * blockSize
		const freeSpace = stats.bavail * blockSize

		return {
			free: freeSpace,
			total: totalSpace,
			summary: `Available ${(freeSpace / 1e9).toFixed(2)} GB / ${(totalSpace / 1e9).toFixed(2)} GB`,
		}
	},
}
