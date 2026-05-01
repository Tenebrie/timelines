"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPrismaClient = getPrismaClient;
var adapter_pg_1 = require("@prisma/adapter-pg");
var client_1 = require("@prisma/client");
var DatabaseClient = null;
var adapter = new adapter_pg_1.PrismaPg({
    connectionString: process.env.DATABASE_URL,
});
function getPrismaClient(transactionClient) {
    if (transactionClient) {
        return transactionClient;
    }
    if (!DatabaseClient) {
        DatabaseClient = new client_1.PrismaClient({ adapter: adapter });
    }
    return DatabaseClient;
}
