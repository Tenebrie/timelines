import { UserAuthenticator } from '@src/middleware/auth/UserAuthenticator.js'
import { ContactFormMessage, WebhookService } from '@src/services/WebhookService.js'
import {
	BadRequestError,
	OptionalParam,
	RequiredParam,
	Router,
	StringValidator,
	useApiEndpoint,
	useOptionalAuth,
	useRequestBody,
} from 'moonflower'

const router = new Router()

router.post('/api/contact', async (ctx) => {
	useApiEndpoint({
		name: 'sendContactFormMessage',
		description: 'Send a message from the contact form',
		tags: [],
	})

	const { name, email, message, source } = useRequestBody(ctx, {
		name: OptionalParam(StringValidator),
		email: OptionalParam(StringValidator),
		message: RequiredParam(StringValidator),
		source: OptionalParam(StringValidator),
	})

	if (name && name.length > 1024) {
		throw new BadRequestError('Name must be at most 1024 characters')
	}
	if (email && email.length > 1024) {
		throw new BadRequestError('Email must be at most 1024 characters')
	}
	if (message.length > 4096) {
		throw new BadRequestError('Message must be at most 4096 characters')
	}

	const user = await useOptionalAuth(ctx, UserAuthenticator)

	const content: ContactFormMessage = {
		name,
		email,
		message,
		source,
		loggedInUserId: user?.id,
		loggedInUserName: user?.username,
	}

	const response = await WebhookService.sendContactFormMessage(content)
	if (response.status !== 200 && response.status !== 204) {
		throw new BadRequestError(
			`Failed to send contact form message: ${response.status} ${response.statusText}`,
		)
	}
})

export const ContactFormRouter = router
