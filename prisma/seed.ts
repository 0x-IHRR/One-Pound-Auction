import prisma from '../server/db/prisma';

const demoAccounts = {
    admin: {
        email: process.env.AUTH_DEMO_ADMIN_EMAIL?.trim() || 'demo-admin@example.com',
        name: process.env.AUTH_DEMO_ADMIN_NAME?.trim() || 'Demo Admin',
    },
    user: {
        email: process.env.AUTH_DEMO_USER_EMAIL?.trim() || 'demo-user@example.com',
        name: process.env.AUTH_DEMO_USER_NAME?.trim() || 'Demo Buyer',
    },
};

const sampleData = [
    {
        title: "抽取一段你今天最需要的箴言",
        hook_description: "一个最适合演示购买和解锁流程的样例内容，默认由管理员身份发布。",
        price: 1,
        hidden_content: "🎯 今日箴言：你已经足够靠近答案，下一步只需要开始行动。",
        itemType: "OFFER",
        authorEmail: demoAccounts.admin.email,
        authorName: demoAccounts.admin.name,
        livePlatform: "ZOOM",
        liveUrl: "https://zoom.us/j/1234567890",
        liveStartsAt: new Date("2026-03-20T12:30:00.000Z"),
        liveStatus: "SCHEDULED",
    },
    {
        title: "独立开发者出海指南 2026",
        hook_description: "公开展示一份低门槛、可立即购买的知识型内容，适合在首页直接演示。",
        price: 1,
        hidden_content: "🌏 一份面向独立开发者的出海执行清单，含渠道、定价和冷启动思路。",
        itemType: "OFFER",
        authorEmail: demoAccounts.admin.email,
        authorName: demoAccounts.admin.name,
    },
    {
        title: "高转化落地页 Figma 模板",
        hook_description: "用于展示数字资源类内容的交付方式，适合购买后直接查看隐藏信息。",
        price: 1,
        hidden_content: "🎯 Figma 文件链接 + 组件命名规范 + 响应式改造建议。",
        itemType: "OFFER",
        authorEmail: demoAccounts.admin.email,
        authorName: demoAccounts.admin.name,
    },
    {
        title: "求一位前端大佬帮忙 Code Review",
        hook_description: "一条由普通用户发布的许愿池内容，用于演示“我的内容”和内容归属。",
        price: 1,
        hidden_content: "项目 GitHub 链接和 review 诉求会在购买后发送。",
        itemType: "WISH",
        authorEmail: demoAccounts.user.email,
        authorName: demoAccounts.user.name,
        livePlatform: "X_SPACES",
        liveUrl: "https://x.com/i/spaces/1OdKrXexample",
        liveStartsAt: new Date("2026-03-18T13:00:00.000Z"),
        liveStatus: "LIVE",
    },
    {
        title: "想认识做独立开发的朋友",
        hook_description: "另一条普通用户内容，用于让演示账号登录后立即看到“我的内容”不为空。",
        price: 1,
        hidden_content: "欢迎添加演示联系卡片，备注「一元破壁集市」。",
        itemType: "WISH",
        authorEmail: demoAccounts.user.email,
        authorName: demoAccounts.user.name,
    },
    {
        title: "AI 提示词工程完全手册",
        hook_description: "保留一条典型资源包型 OFFER，用来验证列表、详情和支付闭环。",
        price: 1,
        hidden_content: "🤖 20 条经过压缩整理的提示词模板，覆盖写作、编程和营销场景。",
        itemType: "OFFER",
        authorEmail: demoAccounts.admin.email,
        authorName: demoAccounts.admin.name,
    },
];

async function main() {
    console.log('🌱 Seeding database...');

    // Clear existing data
    await prisma.auctionItem.deleteMany();
    const now = new Date();

    for (const item of sampleData) {
        await prisma.auctionItem.create({
            data: {
                title: item.title,
                hook_description: item.hook_description,
                price: item.price,
                hidden_content: item.hidden_content,
                itemType: item.itemType,
                authorEmail: item.authorEmail,
                authorName: item.authorName,
                livePlatform: item.livePlatform ?? null,
                liveUrl: item.liveUrl ?? null,
                liveStartsAt: item.liveStartsAt ?? null,
                liveStatus: item.liveStatus ?? null,
                status: 'PUBLISHED',
                publishedAt: now,
            },
        });
    }

    console.log(`✅ Seeded ${sampleData.length} items successfully!`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
