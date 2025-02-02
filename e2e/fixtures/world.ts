import { expect, Page } from '@playwright/test'

import { makeUrl } from './utils'

export const createWorld = async (page: Page) => {
	const worldData = {
		name: 'My World',
		description: 'This is my world',
	}
	const rawResponse = await page.request.post(makeUrl('/api/worlds'), {
		data: worldData,
	})
	expect(rawResponse.ok()).toBeTruthy()
	const response = (await rawResponse.json()) as { id: string }
	return {
		...worldData,
		id: response.id,
	}
}

export const navigateToWiki = async (
	page: Page,
	worldData: 'createWorld' | Awaited<ReturnType<typeof createWorld>>,
) => {
	if (worldData === 'createWorld') {
		worldData = await createWorld(page)
	}

	await page.goto(makeUrl(`/world/${worldData.id}/wiki`))
	return { world: worldData }
}

export const createWikiArticle = async (
	page: Page,
	worldData: 'createWorld' | Awaited<ReturnType<typeof createWorld>>,
	article?: { name?: string },
) => {
	if (worldData === 'createWorld') {
		worldData = await createWorld(page)
	}

	const articleData = {
		name: 'My Article',
		...article,
	}
	const rawResponse = await page.request.post(makeUrl(`/api/world/${worldData.id}/wiki/articles`), {
		data: articleData,
	})
	expect(rawResponse.ok()).toBeTruthy()
	const response = (await rawResponse.json()) as { id: string }
	return {
		world: worldData,
		article: {
			...articleData,
			id: response.id,
		},
	}
}

export const navigateToWikiArticle = async (
	page: Page,
	worldData: 'createWorld' | Awaited<ReturnType<typeof createWorld>>,
	articleData: 'createArticle' | Awaited<ReturnType<typeof createWikiArticle>>['article'],
) => {
	if (worldData === 'createWorld') {
		worldData = await createWorld(page)
	}
	if (articleData === 'createArticle') {
		articleData = (await createWikiArticle(page, worldData)).article
	}

	await page.goto(makeUrl(`/world/${worldData.id}/wiki/${articleData.id}`))
	return { worldData, articleData }
}
