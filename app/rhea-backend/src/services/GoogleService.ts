import { OAuth2Client } from 'google-auth-library'
import { BadRequestError } from 'moonflower'

const GOOGLE_CLIENT_ID = '783181279687-ulsogj24f0k3pkr3rq8itb0fckhdj693.apps.googleusercontent.com'
const client = new OAuth2Client(GOOGLE_CLIENT_ID)

export const GoogleService = {
	validateJwt: async (token: string) => {
		try {
			const ticket = await client.verifyIdToken({
				idToken: token,
				audience: GOOGLE_CLIENT_ID,
			})
			const payload = ticket.getPayload()
			if (!payload) {
				throw new BadRequestError('Invalid Google token')
			}

			if (!payload.email_verified) {
				throw new BadRequestError('Email not verified')
			}

			const name = payload.name
			const email = payload.email
			if (!name || !email) {
				throw new BadRequestError('Name or email not included in the Google token')
			}

			return { name, email }
		} catch (error) {
			if (error instanceof BadRequestError) {
				throw error
			}

			console.error(error)
			throw new BadRequestError('Invalid Google token')
		}
	},
}
