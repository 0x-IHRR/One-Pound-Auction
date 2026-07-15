import { spawnSync } from 'node:child_process';
import path from 'node:path';

import { PrismaClient } from '@prisma/client';

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
    throw new Error('DATABASE_URL is required for migration verification.');
}

const prismaBin = path.join(
    process.cwd(),
    'node_modules',
    '.bin',
    process.platform === 'win32' ? 'prisma.cmd' : 'prisma',
);
const suffix = `${process.pid}_${Date.now()}`;
const freshDatabase = `one_pound_fresh_${suffix}`;
const upgradeDatabase = `one_pound_upgrade_${suffix}`;

function withDatabase(name) {
    const url = new URL(databaseUrl);
    url.pathname = `/${name}`;
    url.search = '';
    url.searchParams.set('schema', 'public');
    return url.toString();
}

const maintenanceUrl = withDatabase('postgres');
const freshUrl = withDatabase(freshDatabase);
const upgradeUrl = withDatabase(upgradeDatabase);
const maintenance = new PrismaClient({ datasourceUrl: maintenanceUrl });

function runPrisma(args, url) {
    const result = spawnSync(prismaBin, args, {
        cwd: process.cwd(),
        env: { ...process.env, DATABASE_URL: url },
        stdio: 'inherit',
    });

    if (result.status !== 0) {
        throw new Error(`Prisma command failed (${result.status}): prisma ${args.join(' ')}`);
    }
}

async function createDatabase(name) {
    await maintenance.$executeRawUnsafe(`CREATE DATABASE "${name}"`);
}

async function dropDatabase(name) {
    await maintenance.$executeRawUnsafe(`DROP DATABASE IF EXISTS "${name}" WITH (FORCE)`);
}

async function assertProblemCollectorSchema(url) {
    const client = new PrismaClient({ datasourceUrl: url });

    try {
        const columns = await client.$queryRawUnsafe(`
            SELECT "column_name"
            FROM information_schema.columns
            WHERE table_schema = 'public' AND table_name = 'AuctionItem'
        `);
        const columnNames = new Set(columns.map((row) => row.column_name));
        const required = [
            'fulfillmentMode',
            'problemStatus',
            'sourceType',
            'submitterContact',
            'submitterContext',
            'sourceUrl',
        ];

        for (const column of required) {
            if (!columnNames.has(column)) {
                throw new Error(`Missing problem collector column: ${column}`);
            }
        }
    } finally {
        await client.$disconnect();
    }
}

try {
    await createDatabase(freshDatabase);
    await createDatabase(upgradeDatabase);

    runPrisma(['migrate', 'deploy'], freshUrl);
    await assertProblemCollectorSchema(freshUrl);

    runPrisma([
        'db',
        'execute',
        '--file',
        'prisma/migrations/20260515172000_postgres_baseline/migration.sql',
        '--url',
        upgradeUrl,
    ], upgradeUrl);

    const upgradeClient = new PrismaClient({ datasourceUrl: upgradeUrl });
    await upgradeClient.$executeRawUnsafe(`
        INSERT INTO "AuctionItem" (
            "id", "title", "hook_description", "hidden_content", "updatedAt"
        ) VALUES (
            'migration-sentinel', '迁移保留测试', '旧库数据', '不能丢失', CURRENT_TIMESTAMP
        )
    `);
    await upgradeClient.$disconnect();

    runPrisma([
        'migrate',
        'resolve',
        '--applied',
        '20260515172000_postgres_baseline',
    ], upgradeUrl);
    runPrisma(['migrate', 'deploy'], upgradeUrl);
    await assertProblemCollectorSchema(upgradeUrl);

    const verifiedUpgradeClient = new PrismaClient({ datasourceUrl: upgradeUrl });
    const sentinel = await verifiedUpgradeClient.$queryRawUnsafe(`
        SELECT "title", "fulfillmentMode", "sourceType"
        FROM "AuctionItem"
        WHERE "id" = 'migration-sentinel'
    `);
    await verifiedUpgradeClient.$disconnect();

    if (sentinel.length !== 1
        || sentinel[0].title !== '迁移保留测试'
        || sentinel[0].fulfillmentMode !== 'PAID_UNLOCK'
        || sentinel[0].sourceType !== 'CREATOR') {
        throw new Error('Upgrade migration did not preserve old data with expected defaults.');
    }

    console.log('PostgreSQL migrations verified: fresh install and existing-schema upgrade both passed.');
} finally {
    await dropDatabase(freshDatabase);
    await dropDatabase(upgradeDatabase);
    await maintenance.$disconnect();
}
