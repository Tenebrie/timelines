const path = require('node:path')
const { pathToFileURL } = require('node:url')

const { app, BrowserWindow, dialog, shell } = require('electron')

/**
 * Electron shell: boots the standalone stack in the main process, then opens
 * a window on the local origin. Single-instance — a second launch would open
 * a second PGlite on the same data directory.
 */
let mainWindow = null

async function main() {
	await app.whenReady()

	const { startDesktopServices } = await import(pathToFileURL(path.join(__dirname, 'launcher.mjs')))
	const { url } = await startDesktopServices()

	mainWindow = new BrowserWindow({
		width: 1440,
		height: 900,
		title: 'Neverkin',
		icon: path.join(__dirname, '../assets/icon.png'),
		autoHideMenuBar: true,
	})
	mainWindow.webContents.setWindowOpenHandler(({ url: externalUrl }) => {
		shell.openExternal(externalUrl)
		return { action: 'deny' }
	})
	await mainWindow.loadURL(url)
	console.info('[echo-desktop] window loaded')

	app.on('window-all-closed', () => {
		app.quit()
	})
}

if (!app.requestSingleInstanceLock()) {
	app.quit()
} else {
	app.on('second-instance', () => {
		if (mainWindow) {
			if (mainWindow.isMinimized()) mainWindow.restore()
			mainWindow.focus()
		}
	})
	main().catch((error) => {
		console.error('[echo-desktop] electron startup failed:', error)
		dialog.showErrorBox('Neverkin failed to start', String(error?.stack ?? error))
		app.quit()
	})
}
