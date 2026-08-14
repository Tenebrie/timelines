const path = require('node:path')
const { pathToFileURL } = require('node:url')

const { app, BrowserWindow, shell } = require('electron')

/**
 * Electron shell: boots the standalone stack in the main process (Electron's
 * Node runtime), then opens a window on the local origin. External links and
 * window.open calls are routed to the system browser.
 */
async function main() {
	await app.whenReady()

	const { startDesktopServices } = await import(pathToFileURL(path.join(__dirname, 'launcher.mjs')))
	const { url } = await startDesktopServices()

	const window = new BrowserWindow({
		width: 1440,
		height: 900,
		title: 'Neverkin',
		autoHideMenuBar: true,
	})
	window.webContents.setWindowOpenHandler(({ url: externalUrl }) => {
		shell.openExternal(externalUrl)
		return { action: 'deny' }
	})
	await window.loadURL(url)
	console.info('[echo-desktop] window loaded')

	app.on('window-all-closed', () => {
		app.quit()
	})
}

main().catch((error) => {
	console.error('[echo-desktop] electron startup failed:', error)
	app.quit()
})
