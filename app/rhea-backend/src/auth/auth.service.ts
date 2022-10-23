import { Injectable } from '@nestjs/common'
import { UserService } from '../user/user.service'
import { JwtService } from '@nestjs/jwt'
import { JwtPayload } from './strategies/jwt/JwtPayload'

@Injectable()
export class AuthService {
	constructor(private usersService: UserService, private jwtService: JwtService) {}

	async register(email: string, username: string, password: string): Promise<{ accessToken: string } | null> {
		const user = await this.usersService.create(email, username, password)
		if (!user) {
			return null
		}

		const payload: JwtPayload = { id: user.id, email: user.email }
		return {
			accessToken: this.jwtService.sign(payload),
		}
	}

	async login(email: string, password: string): Promise<{ accessToken: string } | null> {
		const user = await this.usersService.findByEmailAndPassword(email, password)
		if (!user) {
			return null
		}

		const payload: JwtPayload = { id: user.id, email: user.email }
		return {
			accessToken: this.jwtService.sign(payload),
		}
	}

	async isRegistered(email: string): Promise<boolean> {
		return !!(await this.usersService.findByEmail(email))
	}

	async validateUser(email: string, password: string): Promise<{ accessToken: string } | null> {
		const user = await this.usersService.findByEmailAndPassword(email, password)
		const payload: JwtPayload = { id: user.id, email: user.email }
		return {
			accessToken: this.jwtService.sign(payload),
		}
	}
}
