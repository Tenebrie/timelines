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
			await page.waitForTimeout(1000)

			await textbox.pressSequentially('This is a test article', { delay: 10 })
			await page.waitForTimeout(1000)
			await page.reload()
			await expect(textbox).toBeVisible()
			await expect(textbox).toHaveText('This is a test article')
			await page.waitForTimeout(1000)

			await textbox.selectText()
			await textbox.pressSequentially('The text has been changed', { delay: 10 })
			await page.waitForTimeout(1000)
			await page.reload()
			await expect(textbox).toBeVisible()
			await expect(textbox).toHaveText('The text has been changed')

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
			await textbox.pressSequentially('Hello @TestActor', { delay: 10 })
			await page.waitForTimeout(100)
			await page.keyboard.press('Enter')
			await page.waitForTimeout(1000)

			// Switch to article B
			await page.getByText('Second article').click()
			await expect(textbox).toBeVisible()
			await expect(textbox).toHaveText('')

			// Add mention
			await textbox.pressSequentially('Also hi @UnrelatedActor', { delay: 10 })
			await page.waitForTimeout(100)
			await page.keyboard.press('Enter')
			await page.waitForTimeout(1000)

			// Switch back to article A
			await page.getByText('First article').click()
			await expect(textbox).toBeVisible()
			await page.waitForTimeout(1000)
			await expect(textbox).toHaveText('Hello TestActor')

			// Switch back to article B
			await page.getByTestId('ArticleListWithHeader').getByText('Second article').click()
			await expect(textbox).toBeVisible()
			await page.waitForTimeout(1000)
			await expect(textbox).toHaveText('Also hi UnrelatedActor')
		})

		test('add mentions -> switch article -> switch back -> edit -> mentions stay the same', async ({
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
			await page.waitForTimeout(1000)

			// Add mentions
			await textbox.pressSequentially('Hello @TestActor', { delay: 10 })
			await page.keyboard.press('Enter')
			await page.waitForTimeout(1000)
			await textbox.pressSequentially('\nHello @UnrelatedActor', { delay: 10 })
			await page.keyboard.press('Enter')
			await page.waitForTimeout(1000)

			// Switch to article B
			await page.getByText('Second article').click()
			await expect(textbox).toBeVisible()
			await expect(textbox).toHaveText('')
			await page.waitForTimeout(1000)

			// Switch back to article A
			await page.getByTestId('ArticleListWithHeader').getByText('First article').click()
			await expect(textbox).toBeVisible()
			await expect(textbox).toHaveText('Hello TestActor Hello UnrelatedActor')

			// Edit article
			await textbox.focus()
			await textbox.press('Home')
			await page.waitForTimeout(1000)
			await textbox.press('ArrowUp')
			await textbox.press('Enter')
			await page.waitForTimeout(100)
			await expect(textbox).toHaveText('Hello TestActor Hello UnrelatedActor')
		})

		test('moving articles and creating folders', async ({ page }) => {
			// Prepare world
			const world = await createWorld(page)
			await createWikiArticle(page, world, { name: 'Parent article' })
			await createWikiArticle(page, world, { name: 'Child article' })
			await createWikiArticle(page, world, { name: 'Sibling article' })
			await createWikiArticle(page, world, { name: 'Nested article' })
			await navigateToWiki(page, world)

			const childArticle = page.getByText('Child article')
			const parentArticle = page.getByText('Parent article')
			const siblingArticle = page.getByText('Sibling article')
			const nestedArticle = page.getByText('Nested article')

			// Perform drag and drop
			await childArticle.dragTo(parentArticle)
			await nestedArticle.dragTo(childArticle)
			await siblingArticle.dragTo(parentArticle)

			// Get references to all articles by their list item IDs
			expect(page.getByTestId('ArticleListItem/Parent article/0')).toBeVisible()
			expect(page.getByTestId('ArticleListItem/Child article/1')).toBeVisible()
			expect(page.getByTestId('ArticleListItem/Sibling article/1')).toBeVisible()
			expect(page.getByTestId('ArticleListItem/Nested article/2')).toBeVisible()
			expect(
				page
					.getByTestId('ArticleListItem/Parent article/0')
					.getByTestId('ArticleListItem/Child article/1')
					.getByTestId('ArticleListItem/Nested article/2'),
			).toBeVisible()

			// Check icons
			expect(page.getByTestId('ArticleListItem/Child article/1').getByTestId('FolderIcon')).toBeVisible()
			expect(page.getByTestId('ArticleListItem/Sibling article/1').getByTestId('ArticleIcon')).toBeVisible()
			expect(page.getByTestId('ArticleListItem/Nested article/2').getByTestId('ArticleIcon')).toBeVisible()

			// Move nested article to sibling article
			await nestedArticle.dragTo(siblingArticle)

			// Check that nested article is now a child of sibling article
			expect(page.getByTestId('ArticleListItem/Child article/1').getByTestId('ArticleIcon')).toBeVisible()
			expect(page.getByTestId('ArticleListItem/Sibling article/1').getByTestId('FolderIcon')).toBeVisible()
			expect(
				page
					.getByTestId('ArticleListItem/Parent article/0')
					.getByTestId('ArticleListItem/Sibling article/1')
					.getByTestId('ArticleListItem/Nested article/2'),
			).toBeVisible()

			// Move nested article to root
			await nestedArticle.dragTo(page.getByTestId('ArticleList/0'))
			await expect(page.getByTestId('ArticleListItem/Nested article/0')).toBeVisible()
		})

		test('drag an article to drop handle -> article is moved', async ({ page }) => {
			// Prepare world
			const world = await createWorld(page)
			await createWikiArticle(page, world, { name: 'First article' })
			await createWikiArticle(page, world, { name: 'Second article' })
			await navigateToWiki(page, world)

			// Check that first article appears BEFORE second article
			const list = page.getByTestId('ArticleList/0')
			await expect(list).toBeVisible()

			await expect(list.getByRole('button').nth(0)).toHaveText('First article')
			await expect(list.getByRole('button').nth(2)).toHaveText('Second article')

			// Perform drag and drop
			await page.getByText('Second article').dragTo(page.getByTestId('ArticleDropHandle/0'))
			expect(list.getByRole('button').nth(0)).toHaveText('Second article')
			expect(list.getByRole('button').nth(2)).toHaveText('First article')
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
		// Flush the entity changes
		await page.waitForTimeout(3000)
		await deleteAccount(page)
	})
})
