import { expect, test } from '@playwright/test'
import { createNewUser, deleteAccount } from 'fixtures/auth'
import { createWikiArticle, createWorld, navigateToWiki } from 'fixtures/world'

test.describe('Wiki', () => {
	test.beforeEach(async ({ page }) => {
		await createNewUser(page)
	})

	test('empty state renders correctly', async ({ page }) => {
		await navigateToWiki(page, 'createWorld')
		await expect(page.getByText('Nothing has been created yet!')).toBeVisible()
		await expect(page.getByText('Create new article')).not.toBeVisible()
	})

	test.describe('user flows', () => {
		test('create article -> edit article -> delete article', async ({ page }) => {
			await navigateToWiki(page, 'createWorld')

			// Create article
			await page.getByText('Create article').click()
			await expect(page.getByText('Create new article')).toBeVisible()

			await page.getByLabel('Name').fill('Testing article')
			await page.getByText('Create', { exact: true }).click()
			await expect(page.getByText('Create new article')).not.toBeVisible()
			await expect(page.getByTestId('ArticleTitle').getByText('Testing article')).toBeVisible()

			// Edit article
			const textbox = page.getByTestId('RichTextEditor').getByRole('textbox')
			await expect(textbox).toBeVisible()

			await textbox.fill('This is a test article')
			await page.waitForTimeout(1000)
			await page.reload()
			await expect(textbox).toBeVisible()
			await expect(textbox).toHaveText('This is a test article')

			// Delete article
			await page.getByTestId('ArticleListWithHeader').getByTestId('MenuIcon').click()
			await page.getByRole('menuitem').getByText('Delete').click()
			await expect(page.getByText('Delete article', { exact: true })).toBeVisible()

			await page.getByText('Confirm').click()
			await expect(page.getByText('Nothing has been created yet!')).toBeVisible()
		})

		test('add mention -> switch article -> add mention -> switch back -> mention changes', async ({
			page,
		}) => {
			// Prepare world
			const world = await createWorld(page)
			await createWikiArticle(page, world, { name: 'First article' })
			await createWikiArticle(page, world, { name: 'Second article' })
			await navigateToWiki(page, world)

			// Navigate to article A
			await page.getByText('First article').click()
			const textbox = page.getByTestId('RichTextEditor').getByRole('textbox')
			await expect(textbox).toBeVisible()
			await expect(textbox).toHaveText('')

			// Add mention
			await textbox.fill('Hello @TestActor')
			await page.keyboard.press('Enter')
			await page.waitForTimeout(100)

			// Switch to article B
			await page.getByText('Second article').click()
			await expect(textbox).toBeVisible()
			await expect(textbox).toHaveText('')

			// Add mention
			await textbox.fill('Also hi @UnrelatedActor')
			await page.keyboard.press('Enter')
			await page.waitForTimeout(100)

			// Switch back to article A
			await page.getByText('First article').click()
			await expect(textbox).toBeVisible()
			await expect(textbox).toHaveText('Hello TestActor')

			// Switch back to article B
			await page.getByTestId('ArticleListWithHeader').getByText('Second article').click()
			await expect(textbox).toBeVisible()
			await expect(textbox).toHaveText('Also hi UnrelatedActor')
		})
	})

	test.describe('shortcuts', () => {
		test('create article with simple shortcut', async ({ page }) => {
			await navigateToWiki(page, 'createWorld')

			// Create article
			await page.getByText('Create article').click()
			await expect(page.getByText('Create new article')).toBeVisible()

			await page.getByLabel('Name').fill('Testing article')
			await page.keyboard.press('Enter')
			await expect(page.getByText('Create new article')).not.toBeVisible()
			await expect(page.getByTestId('ArticleTitle').getByText('Testing article')).toBeVisible()
		})

		test('create article with full shortcut', async ({ page }) => {
			await navigateToWiki(page, 'createWorld')

			// Create article
			await page.getByText('Create article').click()
			await expect(page.getByText('Create new article')).toBeVisible()

			await page.getByLabel('Name').fill('Testing article')
			await page.keyboard.press('Control+Enter')

			await expect(page.getByText('Create new article')).not.toBeVisible()
			await expect(page.getByTestId('ArticleTitle').getByText('Testing article')).toBeVisible()
		})
	})

	test.afterEach(async ({ page }) => {
		await deleteAccount(page)
	})
})
