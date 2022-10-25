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

export class ValidationError extends BaseHttpError {
	constructor(message: string) {
		super(StatusCodes.BAD_REQUEST, message)
	}
}

export class BadRequestError extends BaseHttpError {
	constructor(message: string) {
		super(StatusCodes.BAD_REQUEST, message)
	}
}

export class UnauthorizedError extends BaseHttpError {
	constructor(message: string) {
		super(StatusCodes.UNAUTHORIZED, message)
	}
}

export const errorNameToStatusCode = (name: string): number => {
	switch (name) {
		case 'ValidationError':
			return StatusCodes.BAD_REQUEST
		case 'BadRequestError':
			return StatusCodes.BAD_REQUEST
		case 'UnauthorizedError':
			return StatusCodes.UNAUTHORIZED
	}
	return StatusCodes.INTERNAL_SERVER_ERROR
}

export const errorNameToReason = (name: string): string => {
	return getReasonPhrase(errorNameToStatusCode(name) || 500)
}
