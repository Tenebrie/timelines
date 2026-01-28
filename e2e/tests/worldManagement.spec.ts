import { expect, test } from '@playwright/test'
import { createNewUser, deleteAccount } from 'fixtures/auth'

import { makeUrl } from './utils'

test.describe('World management', () => {
	let userData: Awaited<ReturnType<typeof createNewUser>>
	test.beforeEach(async ({ page }) => {
		userData = await createNewUser(page)
	})

	test('connects to live updates', async ({ page }) => {
		await page.goto(makeUrl('/'))

		await page.waitForEvent('websocket', (socket) => {
			const url = new URL(socket.url())
			return url.pathname.startsWith('/live')
		})
	})

	test('disconnects from live updates after logout and connects when logs back', async ({ page }) => {
		await page.goto(makeUrl('/'))

		await page.waitForEvent('websocket', (socket) => {
			const url = new URL(socket.url())
			return url.pathname.startsWith('/live')
		})

		let socketReconnected = false
		page.on('websocket', (socket) => {
			if (!socketReconnected) {
				const url = new URL(socket.url())
				socketReconnected = url.pathname.startsWith('/live')
			}
		})

		await page.getByText(userData.username).click()
		await page.getByText('Logout').click()

		await new Promise((resolve) => setTimeout(resolve, 2000))
		expect(socketReconnected).toBeFalsy()

		await page.getByLabel('Email').fill(userData.email)
		await page.getByLabel('Password').fill(userData.password)

		await page.getByText('Sign In', { exact: true }).click()

		await page.waitForEvent('websocket', (socket) => {
			const url = new URL(socket.url())
			return url.pathname.startsWith('/live')
		})
	})

	test('reconnects to live updates back if socket was closed', async ({ page }) => {
		await page.routeWebSocket(/\/live/, (socket) => {
			socket.connectToServer()
			socket.close()
		})

		await page.goto(makeUrl('/'))

		await page.waitForEvent('websocket', (socket) => {
			const url = new URL(socket.url())
			return url.pathname.startsWith('/live')
		})

		await page.waitForEvent('websocket', (socket) => {
			const url = new URL(socket.url())
			return url.pathname.startsWith('/live')
		})
	})

	test('create world -> delete world flow', async ({ page }) => {
		await page.goto(makeUrl('/'))

		await expect(page.getByText('Nothing has been created yet!')).toBeVisible()
		await expect(page.getByText('Create new world...')).toBeVisible()

		// Create world
		await page.getByText('Create new world...').click()
		await expect(page.getByText('Create world')).toBeVisible()

		await page.getByLabel('Name').fill('My First World')
		await page.getByLabel('Description').fill('World description')
		await page.getByText('Confirm').click()

		await page.waitForURL(/\/world\/[a-f0-9-]+\/timeline/)
		// TODO: Update assertions to check the world is created with correct data
		// await expect(page.getByText('My First World')).toBeVisible()
		// await expect(page.getByText('World description')).toBeVisible()

		// Navigate to settings
		await page.getByText('Home').click()
		await page.getByTestId('EditIcon').click()
		await page.waitForURL(/\/world\/[a-f0-9-]+\/settings/)
		await expect(page.getByRole('heading', { name: 'Settings' })).toBeVisible()

		// Delete world
		await page.getByText('Home').click()
		await page.getByTestId('DeleteIcon').click()
		await expect(page.getByText('Delete world', { exact: true })).toBeVisible()

		await page.getByText('Confirm').click()
		await expect(page.getByText('Nothing has been created yet!')).toBeVisible()
	})

	test.afterEach(async ({ page }) => {
		await deleteAccount(page)
	})
})
