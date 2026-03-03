import prisma from '../app/lib/prisma';

const sampleData = [
    // ═══ OFFER items ═══
    { title: "抽取一段你今天最需要的箴言", hook_description: "有些决定你心里已经有了答案，但你需要一枚硬币来帮你最后确认一下。点开这枚硬币吧。", price: 1, hidden_content: "🎯 今日箴言：你现在拥有的，已经是别人梦寐以求的。停止对比，专注自己。", itemType: "OFFER" },
    { title: "做梦梦到的高概念科幻短片大纲", hook_description: "关于记忆黑市的故事，反转极其出彩！我没空拍，寻找有缘的影视系同学接手。", price: 1, hidden_content: "📹 大纲《记忆黑市》：2077年，记忆可以交易。主人公在黑市买了一段陌生人的初恋记忆，却发现那正是自己被删除的过去...", itemType: "OFFER" },
    { title: "帮你看一份大厂求职简历", hook_description: "我在大厂摸过八年简历，只说真话。不怕被批的话来找我，帮你挑出至少3个致命排版和叙述错误。", price: 1, hidden_content: "📋 简历诊断服务：请将简历发送至指定邮箱，48小时内返回详细批注。", itemType: "OFFER" },
    { title: "小红书爆款标题生成器 (含100个万能公式)", hook_description: "用这套公式，我把一个原本阅读量100的笔记改到了1万+。附赠一份打水印的小工具源码。", price: 1, hidden_content: "📝 100个爆款公式模板 + Python 标题生成脚本，直接可用。", itemType: "OFFER" },
    { title: "1元全栈开发教程序", hook_description: "从零开始，教你用 Next.js + Prisma + PostgreSQL 搭建一个完整的 SaaS 应用。", price: 1, hidden_content: "🎓 包含12节视频课程的 Notion 链接，永久有效。", itemType: "OFFER" },
    { title: "一套手绘矢量角色资源包", hook_description: "20个可商用的卡通角色 SVG 文件，适合做 App 引导页、PPT 插图。花了两周画的。", price: 1, hidden_content: "🎨 Google Drive 下载链接，含 SVG + PNG + Figma 源文件。", itemType: "OFFER" },
    { title: "一完整的新型社交业务计划", hook_description: "一完全包罗万象的计划书，反转新新一社交商业计划，深入开发和运营建议。", price: 1, hidden_content: "📊 完整商业计划书 PDF，56页，含市场分析和财务模型。", itemType: "OFFER" },
    { title: "独立开发者出海指南 2026", hook_description: "我从0做到月入5千刀的真实经历，踩过的每一个坑都写出来了。不是鸡汤，是实操笔记。", price: 1, hidden_content: "🌏 Notion 独立开发笔记，持续更新中，含工具推荐和渠道分析。", itemType: "OFFER" },
    { title: "一套高转化落地页 Figma 模板", hook_description: "5个不同风格的 SaaS Landing Page 设计模板，响应式，直接拿去改文案就能用。", price: 1, hidden_content: "🎯 Figma Community 文件链接，免费可商用。", itemType: "OFFER" },
    { title: "Python 自动化办公脚本合集", hook_description: "包含 Excel 批量处理、PDF 合并、邮件群发、数据可视化等 15 个常用脚本。", price: 1, hidden_content: "🐍 GitHub 仓库链接，每个脚本都有详细注释和使用说明。", itemType: "OFFER" },
    { title: "AI 提示词工程完全手册", hook_description: "从基础到高级，200+ 个经过验证的 Prompt 模板，涵盖写作、编程、设计、营销等场景。", price: 1, hidden_content: "🤖 飞书文档链接，按场景分类整理，每周更新。", itemType: "OFFER" },
    { title: "个人品牌打造路线图", hook_description: "从0到10000粉丝的完整方法论，包含内容规划、选题策略和变现路径。", price: 1, hidden_content: "📈 Notion 模板 + 案例拆解，含每日内容日历。", itemType: "OFFER" },

    // ═══ WISH items ═══
    { title: "求一位前端大佬帮忙 Code Review", hook_description: "我是后端转前端的新手，写了一个 React 项目，希望有经验的人帮我看看有没有反模式。", price: 1, hidden_content: "项目 GitHub 链接将在购买后发送。", itemType: "WISH" },
    { title: "想认识做独立开发的朋友", hook_description: "我正在做一个小工具产品，想找志同道合的朋友交流，互相鼓励，一起成长。", price: 1, hidden_content: "加微信好友，备注「破壁集市」。", itemType: "WISH" },
    { title: "求推荐适合小团队的项目管理工具", hook_description: "3-5人的小团队，试过 Jira 太重了，Trello 又太轻了，有什么刚好的选择吗？", price: 1, hidden_content: "欢迎推荐并分享使用心得。", itemType: "WISH" },
    { title: "悬赏：帮我的产品设计一个 Logo", hook_description: "做了一个叫「晨光笔记」的 App，需要一个简约风格的 Logo，预算很低但是有诚意。", price: 1, hidden_content: "设计需求文档在购买后发送。", itemType: "WISH" },
];

async function main() {
    console.log('🌱 Seeding database...');

    // Clear existing data
    await prisma.auctionItem.deleteMany();

    for (const item of sampleData) {
        await prisma.auctionItem.create({
            data: {
                title: item.title,
                hook_description: item.hook_description,
                price: item.price,
                hidden_content: item.hidden_content,
                itemType: item.itemType,
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
