import { expect, Page } from '@playwright/test'
import { makeUrl } from 'tests/utils'

export const createNewUser = async (page: Page) => {
	const userId = `playwright-${Math.random().toString(16).slice(2)}`

	const accountData = {
		email: `${userId}@localhost`,
		username: userId,
		password: 'SecurePassword123!',
	}

	const response = await page.request.post(makeUrl('/api/auth'), {
		data: accountData,
	})
	expect(response.ok()).toBeTruthy()
	return accountData
}

export const loginAsUser = async (page: Page, accountData: { email: string; password: string }) => {
	const response = await page.request.post(makeUrl('/api/auth/login'), {
		data: accountData,
	})
	expect(response.ok()).toBeTruthy()
	return accountData
}

export const deleteAccount = async (page: Page) => {
	const response = await page.request.delete(makeUrl('/api/auth'))
	expect(response.ok()).toBeTruthy()
}
