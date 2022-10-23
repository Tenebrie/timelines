import { User } from '../user/entities/user.entity'
import { DataSource, DataSourceOptions } from 'typeorm'

export const LocalDataSource: DataSourceOptions = {
	type: 'postgres',
	host: 'localhost', // replace with 'postgres' for Docker
	port: 5432,
	username: 'docker',
	password: 'docker',
	database: 'db',
	entities: [User],
	migrations: [__dirname + '/migrations/*.ts'],
}

export default new DataSource(LocalDataSource)
