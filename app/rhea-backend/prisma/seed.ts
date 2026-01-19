import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from './client/client.js'
import * as bcrypt from 'bcrypt'

const adapter = new PrismaPg({
	connectionString: process.env.DATABASE_URL,
})
const prisma = new PrismaClient({
	adapter,
})

async function main() {
	const databaseSeededFlag = await prisma.flags.findFirst({
		where: {
			value: 'DatabaseSeeded',
		},
	})
	if (databaseSeededFlag) {
		return
	}

	const hashedPassword = await bcrypt.hash('q', 8)
	await prisma.user.create({
		data: {
			email: 'admin@localhost',
			username: 'Administrator',
			password: hashedPassword,
			level: 'Admin',
		},
	})

	await prisma.flags.create({
		data: {
			value: 'DatabaseSeeded',
		},
	})
}

main()
	.then(async () => {
		await prisma.$disconnect()
	})
	.catch(async (e) => {
		console.error(e)
		await prisma.$disconnect()
		process.exit(1)
	})
