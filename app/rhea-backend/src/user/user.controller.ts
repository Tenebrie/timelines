import { Controller, Get, Request, Post, UseGuards, Body, UnauthorizedException } from '@nestjs/common'
import { JwtAuthGuard } from '../auth/strategies/jwt/jwt-auth.guard'
import { AuthService } from '../auth/auth.service'

@JwtAuthGuard()
@Controller('/user')
export class UserController {
	constructor(private authService: AuthService) {}

	@Get('/profile')
	getProfile(@Request() req) {
		return req.user
	}
}
