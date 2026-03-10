import { Page } from '@playwright/test'

export async function withCreatedEvent(page: Page, action: () => unknown) {
	const eventRequest = page.waitForRequest(
		(req) => req.method() === 'POST' && !!req.url().match(/\/api\/world\/[a-zA-Z0-9-]+\/event/),
	)
	const worldUpdateRequest = page.waitForRequest(
		(req) => req.method() === 'GET' && !!req.url().match(/\/api\/world\/[a-zA-Z0-9-]+/),
	)
	await action()
	await eventRequest
	await worldUpdateRequest
}

export async function withCreatedActor(page: Page, action: () => unknown) {
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

export async function withCreatedArticle(page: Page, action: () => unknown) {
	const articleRequest = page.waitForRequest(
		(req) => req.method() === 'POST' && !!req.url().match(/\/api\/world\/[a-zA-Z0-9-]+\/wiki\/articles/),
	)
	const articleUpdateRequest = page.waitForRequest(
		(req) => req.method() === 'GET' && !!req.url().match(/\/api\/world\/[a-zA-Z0-9-]+\/wiki\/articles/),
	)
	await action()
	await articleRequest
	await articleUpdateRequest
}
