import {
	BadRequestException,
	Body,
	Controller,
	InternalServerErrorException,
	Post,
	UnauthorizedException,
} from '@nestjs/common'
import { ApiBadRequestResponse, ApiBody, ApiCreatedResponse, ApiUnauthorizedResponse } from '@nestjs/swagger'
import { AuthService } from './auth.service'
import { AccessTokenDto } from './dto/access-token.dto'
import { LoginDto } from './dto/login.dto'
import { RegisterDto } from './dto/register.dto'

@Controller('/auth')
export class AuthController {
	constructor(private authService: AuthService) {}

	@Post()
	@ApiBody({ type: RegisterDto })
	@ApiCreatedResponse({ type: AccessTokenDto })
	@ApiBadRequestResponse()
	async register(@Body() body: RegisterDto): Promise<AccessTokenDto> {
		const { email, username, password } = body
		const isRegistered = await this.authService.isRegistered(email)
		if (isRegistered) {
			throw new BadRequestException('This user already exists')
		}

		const registrationResult = await this.authService.register(email, username, password)
		if (!registrationResult) {
			throw new InternalServerErrorException('Unable to create the user')
		}

		return registrationResult
	}

	@Post('/login')
	@ApiBody({ type: LoginDto })
	@ApiCreatedResponse({ type: AccessTokenDto })
	@ApiUnauthorizedResponse()
	async login(@Body() body: LoginDto): Promise<AccessTokenDto> {
		const { email, password } = body
		const loginResult = await this.authService.login(email, password)
		if (!loginResult) {
			throw new UnauthorizedException('Username or password do not match')
		}

		return loginResult
	}
}
