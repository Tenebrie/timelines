import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { User } from './entities/user.entity'

@Injectable()
export class UserService {
	constructor(
		@InjectRepository(User)
		private usersRepository: Repository<User>
	) {}

	async create(email: string, username: string, password: string): Promise<User | null> {
		const user = await this.usersRepository.create({
			email,
			username,
			password,
			lastActivity: new Date(),
		})
		this.usersRepository.save(user)
		return user
	}

	async findByEmailAndPassword(email: string, password: string): Promise<User | null> {
		const user = await this.usersRepository.findOneBy({ email })
		if (!user) {
			return null
		}
		if (user.password !== password) {
			return null
		}
		return user
	}

	findById(id: string): Promise<User | null> {
		return this.usersRepository.findOneBy({ id })
	}

	findByEmail(email: string): Promise<User | null> {
		return this.usersRepository.findOneBy({ email })
	}

	async remove(id: string): Promise<void> {
		await this.usersRepository.delete(id)
	}
}
