import * as fs from 'fs'

const secretCache: Record<string, string> = {}

type SecretName =
	| 'jwt-secret'
	| 'environment'
	| 's3-endpoint'
	| 's3-bucket-id'
	| 's3-access-key-id'
	| 's3-access-key-secret'

export const SecretService = {
	getSecret: (secretName: SecretName) => {
		if (secretCache[secretName]) {
			return secretCache[secretName]
		}
		if (fs.existsSync(`/run/secrets/${secretName}`)) {
			const key = fs.readFileSync(`/run/secrets/${secretName}`, 'utf8')
			secretCache[secretName] = key
			return key
		}
		if (process.env[secretName]) {
			secretCache[secretName] = process.env[secretName]
			return process.env[secretName]
		}
		throw new Error(`${secretName} is not defined!`)
	},
}
