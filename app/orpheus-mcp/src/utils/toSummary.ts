import { toAgentReadableText } from './toAgentReadableText.js'

export function toSummary(content: string) {
	const firstParagraph = content.match(/<p[^>]*>(.*?)<\/p>/s)?.[1] ?? content.trim()
	return toAgentReadableText({ content: firstParagraph }).replace(/<[^>]*>/g, '')
}
