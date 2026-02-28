import { expect, test } from '@playwright/test'

import { makeUrl } from './utils'

test.describe('Guest user', () => {
	test('user is redirected to login page', async ({ page }) => {
		await page.goto(makeUrl('/'))

		await expect(page).toHaveTitle(/Neverkin/)
		await expect(page.getByText('Sign in to Neverkin')).toBeVisible()
	})

	test('does not initiate live connection', async ({ page }) => {
		let socketRequestFound = false

		page.on('websocket', (socket) => {
			if (!socketRequestFound) {
				const url = new URL(socket.url())
				socketRequestFound = url.pathname.startsWith('/live')
			}
		})

		await page.goto(makeUrl('/'))

		await new Promise((resolve) => setTimeout(resolve, 2000))
		expect(socketRequestFound).toBeFalsy()
	})
})
