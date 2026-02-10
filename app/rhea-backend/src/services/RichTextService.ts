import { MentionedEntity } from '@prisma/client'
import { load } from 'cheerio'
import { AnyNode } from 'domhandler'

import { EntityResolverService } from './EntityResolverService.js'
import { MentionData } from './MentionsService.js'

export type MentionNodeContent = {
	actor: string | false
	event: string | false
	article: string | false
	tag: string | false
}

export const RichTextService = {
	parseContentString: async ({
		worldId,
		contentString,
	}: {
		worldId: string
		contentString: string
	}): Promise<{
		contentPlain: string
		contentRich: string
		mentions: MentionData[]
	}> => {
		const $ = load(contentString)
		const mentions: MentionData[] = []

		// Find all elements with data-component-props attribute
		const mentionElements: Array<{ element: AnyNode; props: MentionNodeContent }> = []
		$('[data-component-props]').each((_, element) => {
			const propsAttr = $(element).attr('data-component-props')
			if (!propsAttr) {
				return
			}

			try {
				const props = JSON.parse(propsAttr) as MentionNodeContent
				mentionElements.push({ element, props })
			} catch (error) {
				// Skip invalid JSON
				console.error('Failed to parse mention props:', propsAttr, error)
			}
		})

		// Resolve entity names and replace span content
		for (const { element, props } of mentionElements) {
			if (props.actor) {
				const actorName = await EntityResolverService.resolveEntityName({
					worldId,
					entityType: 'actor',
					entityId: props.actor,
				})
				$(element).text(`[${actorName}]`)
				mentions.push({
					targetId: props.actor,
					targetType: MentionedEntity.Actor,
				})
			}
			if (props.event) {
				const eventName = await EntityResolverService.resolveEntityName({
					worldId,
					entityType: 'event',
					entityId: props.event,
				})
				$(element).text(`[${eventName}]`)
				mentions.push({
					targetId: props.event,
					targetType: MentionedEntity.Event,
				})
			}
			if (props.article) {
				const articleName = await EntityResolverService.resolveEntityName({
					worldId,
					entityType: 'article',
					entityId: props.article,
				})
				$(element).text(`[${articleName}]`)
				mentions.push({
					targetId: props.article,
					targetType: MentionedEntity.Article,
				})
			}
			if (props.tag) {
				const tagName = await EntityResolverService.resolveEntityName({
					worldId,
					entityType: 'tag',
					entityId: props.tag,
				})
				$(element).text(`[${tagName}]`)
				mentions.push({
					targetId: props.tag,
					targetType: MentionedEntity.Tag,
				})
			}
		}

		// Add double newlines after block elements for proper plain text formatting
		$('p, div, h1, h2, h3, h4, h5, h6, li').after('\n\n')
		$('br').replaceWith('\n')

		// Get plain text content with resolved entity names
		const contentPlain = $.text()
			.replace(/\n{3,}/g, '\n\n')
			.trim()

		return {
			contentPlain,
			contentRich: contentString,
			mentions,
		}
	},
}
