import { createNewUser, deleteAccount } from '@fixtures/auth'
import { createWikiArticle, createWikiFolder, createWorld, navigateToWiki } from '@fixtures/world'
import { expect, Page, test } from '@playwright/test'

test.describe('Wiki View', () => {
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
			await createArticleViaUI(page, 'Testing article')

			// Open article
			await withYjsSocket(page, () => page.getByText('Testing article').click())
			await expect(page.getByTestId('EditableTitle').getByText('Testing article')).toBeVisible()

			// Edit article
			const textbox = page.getByTestId('RichTextEditor').getByRole('textbox')
			await expect(textbox).toBeVisible()

			await textbox.fill('This is a test article')
			await withYjsSocket(page, () => page.reload())
			await expect(textbox).toBeVisible()
			await expect(textbox).toHaveText('This is a test article')

			await textbox.selectText()
			await textbox.pressSequentially('The text has been changed', { delay: 10 })
			await withYjsSocket(page, () => page.reload())
			await expect(textbox).toBeVisible()
			await expect(textbox).toHaveText('The text has been changed')

			// Delete article
			await page.getByLabel('Article context menu').click()
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
			await textbox.click()
			await textbox.pressSequentially('Hello @TestActor', { delay: 10 })
			await withCreatedActor(page, () => page.keyboard.press('Enter'))

			// Switch to article B
			await withYjsSocket(page, () => page.getByText('Second article').click())
			await expect(textbox).toHaveText('')

			// Add mention
			await textbox.pressSequentially('Also hi @UnrelatedActor', { delay: 10 })
			await withCreatedActor(page, () => page.keyboard.press('Enter'))

			// Switch back to article A
			await withYjsSocket(page, () => page.getByText('First article').click())
			await expect(textbox).toHaveText('Hello TestActor')

			// Switch back to article B
			await withYjsSocket(page, () =>
				page.getByTestId('ArticleListWithHeader').getByText('Second article').click(),
			)
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
			await withYjsSocket(page, () => page.getByText('Second article').click())
			await expect(textbox).toHaveText('')

			// Switch back to article A
			await withYjsSocket(page, () =>
				page.getByTestId('ArticleListWithHeader').getByText('First article').click(),
			)
			await expect(textbox).toHaveText('Hello TestActorHello UnrelatedActor')

			// Edit article
			await textbox.focus()
			await textbox.press('Home')
			await textbox.press('ArrowUp')
			await textbox.press('Enter')
			await expect(textbox).toHaveText('Hello TestActorHello UnrelatedActor')
		})

		test('moving articles into and out of folders', async ({ page }) => {
			// Prepare world
			const world = await createWorld(page)
			await createWikiFolder(page, world, { name: 'Parent folder' })
			await createWikiFolder(page, world, { name: 'Inner folder' })
			await createWikiArticle(page, world, { name: 'First article' })
			await createWikiArticle(page, world, { name: 'Second article' })
			await navigateToWiki(page, world)

			const parentFolder = page.getByText('Parent folder')
			const innerFolder = page.getByText('Inner folder')
			const firstArticle = page.getByText('First article')
			const secondArticle = page.getByText('Second article')

			await expect(page.getByTestId('ArticleListItem/Parent folder/0')).toHaveAttribute(
				'data-item-type',
				'folder',
			)
			await expect(page.getByTestId('ArticleListItem/First article/0')).toHaveAttribute(
				'data-item-type',
				'article',
			)

			// Move an article into a folder
			await firstArticle.dragTo(parentFolder)
			await expect(
				page.getByTestId('ArticleListItem/Parent folder/0').getByTestId('ArticleListItem/First article/1'),
			).toBeVisible()

			// Nest a folder inside a folder, then move an article into the nested folder
			await innerFolder.dragTo(parentFolder)
			await expect(
				page.getByTestId('ArticleListItem/Parent folder/0').getByTestId('ArticleListItem/Inner folder/1'),
			).toBeVisible()

			await secondArticle.dragTo(innerFolder)
			await expect(
				page
					.getByTestId('ArticleListItem/Parent folder/0')
					.getByTestId('ArticleListItem/Inner folder/1')
					.getByTestId('ArticleListItem/Second article/2'),
			).toBeVisible()

			// Dropping an article onto another article does nothing
			await firstArticle.dragTo(secondArticle)
			await expect(
				page.getByTestId('ArticleListItem/Parent folder/0').getByTestId('ArticleListItem/First article/1'),
			).toBeVisible()

			// Move an article back to root
			await firstArticle.dragTo(page.getByTestId('ArticleList/0'))
			await expect(page.getByTestId('ArticleListItem/First article/0')).toBeVisible()
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

			const items = list.getByTestId(/^ArticleListItem\//)
			await expect(items.nth(0)).toHaveAttribute('data-testid', 'ArticleListItem/First article/0')
			await expect(items.nth(1)).toHaveAttribute('data-testid', 'ArticleListItem/Second article/0')

			// Perform drag and drop
			await page.getByText('Second article').dragTo(page.getByTestId('ArticleDropHandle/0'), {
				force: true,
			})
			await expect(items.nth(0)).toHaveAttribute('data-testid', 'ArticleListItem/Second article/0')
			await expect(items.nth(1)).toHaveAttribute('data-testid', 'ArticleListItem/First article/0')
		})
	})

	test.describe('mentions', () => {
		test('clicking @Mention button opens mentions list', async ({ page }) => {
			await navigateToWiki(page, 'createWorld')

			// Create article
			await createArticleViaUI(page, 'Testing article')
			await withYjsSocket(page, () => page.getByText('Testing article').click())
			await expect(page.getByTestId('EditableTitle').getByText('Testing article')).toBeVisible()

			// Click into the editor
			const textbox = page.getByTestId('RichTextEditor').getByRole('textbox')
			await expect(textbox).toBeVisible()
			await textbox.click()

			// Click the @Mention button and type a query
			await page.getByRole('button', { name: '@Mention' }).click()
			await page.keyboard.type('Test', { delay: 10 })

			// Expect the mentions list to be visible with Quick create options
			await expect(page.getByText('Quick create')).toBeVisible()
		})

		test('clicking @Mention button and pressing Enter inserts a mention', async ({ page }) => {
			await navigateToWiki(page, 'createWorld')

			// Create article
			await createArticleViaUI(page, 'Testing article')
			await withYjsSocket(page, () => page.getByText('Testing article').click())
			await expect(page.getByTestId('EditableTitle').getByText('Testing article')).toBeVisible()

			// Click into the editor and type some text
			const textbox = page.getByTestId('RichTextEditor').getByRole('textbox')
			await expect(textbox).toBeVisible()
			await textbox.click()
			await textbox.pressSequentially('Hello ', { delay: 10 })

			// Click the @Mention button, type a name, and press Enter to create
			await page.getByRole('button', { name: '@Mention' }).click()
			await page.keyboard.type('NewActor', { delay: 10 })
			await expect(page.getByText('Quick create')).toBeVisible()
			await withCreatedActor(page, () => page.keyboard.press('Enter'))

			// Expect the mention to be inserted (not a newline)
			await expect(textbox).toHaveText('Hello NewActor')
		})
	})

	test.describe('shortcuts', () => {
		test('create article with simple shortcut', async ({ page }) => {
			await navigateToWiki(page, 'createWorld')

			// Create article
			await page.getByRole('button', { name: 'Create new entity' }).click()
			await expect(page.getByText('Create New Entity', { exact: true })).toBeVisible()

			await page.getByRole('button', { name: 'Article', exact: true }).click()
			await page.getByPlaceholder('Name').fill('Testing article')
			await page.keyboard.press('Enter')
			await expect(page.getByText('Create New Entity', { exact: true })).not.toBeVisible()
			await expect(page.getByTestId('ArticleListItem/Testing article/0')).toBeVisible()
		})

		test('create article with full shortcut', async ({ page }) => {
			await navigateToWiki(page, 'createWorld')

			// Create article
			await page.getByRole('button', { name: 'Create new entity' }).click()
			await expect(page.getByText('Create New Entity', { exact: true })).toBeVisible()

			await page.getByRole('button', { name: 'Article', exact: true }).click()
			await page.getByPlaceholder('Name').fill('Testing article')
			await page.keyboard.press('Control+Enter')

			await expect(page.getByText('Create New Entity', { exact: true })).not.toBeVisible()
			await expect(page.getByTestId('ArticleListItem/Testing article/0')).toBeVisible()
		})
	})

	test.afterEach(async ({ page }) => {
		// Flush the entity changes
		await page.waitForTimeout(3000)
		await deleteAccount(page)
	})

	async function createArticleViaUI(page: Page, name: string) {
		await page.getByRole('button', { name: 'Create new entity' }).click()
		await page.getByRole('button', { name: 'Article', exact: true }).click()
		await page.getByPlaceholder('Name').fill(name)
		await page.getByRole('button', { name: 'Create', exact: true }).click()
		await expect(page.getByTestId(`ArticleListItem/${name}/0`)).toBeVisible()
	}

	async function withYjsSocket(page: Page, action: () => unknown) {
		const yjsRequest = page.waitForEvent('websocket', (ws) => {
			return ws.url().includes('/live/yjs')
		})
		await action()
		await yjsRequest
		await page.waitForTimeout(100)
	}

	async function withCreatedActor(page: Page, action: () => unknown) {
		const actorRequest = page.waitForRequest(
			(req) => req.method() === 'POST' && !!req.url().match(/\/api\/world\/[a-zA-Z0-9-]+\/actors/),
		)
		const worldUpdateRequest = page.waitForRequest(
			(req) => req.method() === 'GET' && !!req.url().match(/\/api\/world\/[a-zA-Z0-9-]+/),
		)
		await action()
		await actorRequest
		await worldUpdateRequest
	}
})
