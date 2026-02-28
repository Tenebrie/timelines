import test from '@playwright/test'
import { createNewUser, deleteAccount } from 'fixtures/auth'

test.describe('Calendar Editor', () => {
	test.beforeEach(async ({ page }) => {
		await createNewUser(page)
	})

	test.afterEach(async ({ page }) => {
		await deleteAccount(page)
	})
})
