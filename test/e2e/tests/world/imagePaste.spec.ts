import { createNewUser, deleteAccount } from '@fixtures/auth'
import { createWorld, navigateToWikiArticle } from '@fixtures/world'
import { expect, Page, test } from '@playwright/test'

const TINY_PNG_BASE64 =
	'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=='

test.describe('RichTextEditor - image paste', () => {
	test.beforeEach(async ({ page }) => {
		await createNewUser(page)
	})

	test('pasting an image file creates an externalImageNode and uploads it', async ({ page }) => {
		await openArticleEditor(page)

		await page.evaluate((base64) => {
			const bytes = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0))
			const file = new File([bytes], 'test-image.png', { type: 'image/png' })
			const dataTransfer = new DataTransfer()
			dataTransfer.items.add(file)
			const event = new ClipboardEvent('paste', {
				clipboardData: dataTransfer,
				bubbles: true,
				cancelable: true,
			})
			Object.defineProperty(event, 'clipboardData', { value: dataTransfer })
			document.querySelector('[data-testid="RichTextEditor"] .ProseMirror')?.dispatchEvent(event)
		}, TINY_PNG_BASE64)

		await expect(page.locator('img[data-upload-id]')).toBeAttached()
		await expect(page.locator('img[data-asset-id]')).toBeAttached({ timeout: 15000 })
	})

	test('pasting HTML with a base64 image creates an externalImageNode and uploads it', async ({ page }) => {
		await openArticleEditor(page)

		await page.evaluate((base64) => {
			const html = `<img src="data:image/png;base64,${base64}" />`
			const dataTransfer = new DataTransfer()
			dataTransfer.setData('text/html', html)
			const event = new ClipboardEvent('paste', {
				clipboardData: dataTransfer,
				bubbles: true,
				cancelable: true,
			})
			Object.defineProperty(event, 'clipboardData', { value: dataTransfer })
			document.querySelector('[data-testid="RichTextEditor"] .ProseMirror')?.dispatchEvent(event)
		}, TINY_PNG_BASE64)

		await expect(page.locator('img[data-upload-id]')).toBeAttached()
		await expect(page.locator('img[data-asset-id]')).toBeAttached({ timeout: 15000 })
	})

	test('pasting complex HTML with mixed text and images creates all externalImageNodes and uploads them', async ({
		page,
	}) => {
		await openArticleEditor(page)

		await page.evaluate((base64) => {
			const html = `
				<p>First paragraph of pasted content</p>
				<img src="data:image/png;base64,${base64}" />
				<p>Second paragraph between the images</p>
				<img src="data:image/png;base64,${base64}" />
				<p>Final paragraph after both images</p>
			`
			const dataTransfer = new DataTransfer()
			dataTransfer.setData('text/html', html)
			const event = new ClipboardEvent('paste', {
				clipboardData: dataTransfer,
				bubbles: true,
				cancelable: true,
			})
			Object.defineProperty(event, 'clipboardData', { value: dataTransfer })
			document.querySelector('[data-testid="RichTextEditor"] .ProseMirror')?.dispatchEvent(event)
		}, TINY_PNG_BASE64)

		await expect(page.locator('img[data-upload-id]')).toHaveCount(2)
		await expect(page.locator('img[data-asset-id]')).toHaveCount(2, { timeout: 15000 })

		const textbox = page.getByTestId('RichTextEditor').getByRole('textbox')
		await expect(textbox).toContainText('First paragraph of pasted content')
		await expect(textbox).toContainText('Second paragraph between the images')
		await expect(textbox).toContainText('Final paragraph after both images')
	})

	test.afterEach(async ({ page }) => {
		await deleteAccount(page)
	})

	async function openArticleEditor(page: Page) {
		const world = await createWorld(page)
		await navigateToWikiArticle(page, world, 'createArticle')
		const textbox = page.getByTestId('RichTextEditor').getByRole('textbox')
		await expect(textbox).toBeVisible()
		await textbox.click()
	}
})
