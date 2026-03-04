import { SecretService } from '@src/ts-shared/node/services/SecretService.js'
import { BadRequestError } from 'moonflower'

export type ContactFormMessage = {
	name?: string
	email?: string
	message: string
	source?: string
	loggedInUserId?: string
	loggedInUserName?: string
}

export const WebhookService = {
	sendContactFormMessage: async (content: ContactFormMessage) => {
		const webhookUrl = SecretService.getSecret('webhook-contact-form-url')
		if (!webhookUrl) {
			throw new BadRequestError('Webhook URL is not configured')
		}

		const source = content.source || 'unknown'
		const sourceText = (() => {
			if (source === 'thetis') {
				return ' via Thetis'
			} else if (source === 'styx') {
				return ' via Styx'
			}
			return ''
		})()
		const response = await fetch(webhookUrl, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				allowed_mentions: {
					parse: [],
				},
				embeds: [
					{
						title: 'New Contact Form Submission',
						color: 0x5865f2,
						description: content.message,
						fields: [
							{ name: 'Name', value: content.name, inline: true },
							{ name: 'Email', value: content.email, inline: true },
							content.loggedInUserName
								? {
										name: 'Logged-in User',
										value: `${content.loggedInUserName}`,
									}
								: undefined,
							content.loggedInUserId
								? {
										name: 'User ID',
										value: `${content.loggedInUserId}`,
										inline: true,
									}
								: undefined,
						].filter(
							(field): field is NonNullable<typeof field> => field !== undefined && field.value !== undefined,
						),
						timestamp: new Date().toISOString(),
						footer: {
							text: 'Neverkin Contact Form' + sourceText,
						},
					},
				],
			}),
		})
		return response
	},
}
