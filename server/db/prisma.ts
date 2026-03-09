import { PrismaClient } from '@prisma/client';

import { env } from '../../shared/config/env';

const globalForPrisma = globalThis as unknown as {
    prisma?: PrismaClient;
};

void env;

const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (env.NODE_ENV !== 'production') {
    globalForPrisma.prisma = prisma;
}

export default prisma;
