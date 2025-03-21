export class NotLoggedInError extends Error {
	constructor() {
		super('Not logged in')
	}
}
