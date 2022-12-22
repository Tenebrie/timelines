import { StatusCodes, getReasonPhrase } from 'http-status-codes'

export interface HttpError {
	status: StatusCodes
	reason: string
	message: string
}

export class BaseHttpError extends Error implements HttpError {
	public reason: string

	constructor(public status: StatusCodes, public message: string) {
		super(message)
		this.reason = getReasonPhrase(status)
	}
}
