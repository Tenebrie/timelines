import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm'

@Entity()
export class User {
	@PrimaryGeneratedColumn('uuid')
	id: string

	@Column()
	email: string

	@Column()
	username: string

	@Column()
	password: string

	@Column()
	lastActivity: Date
}
