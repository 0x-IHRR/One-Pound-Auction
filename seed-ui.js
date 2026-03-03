const items = [
    {
        title: "小红书爆款标题生成器 (含100个万能公式)",
        hook_description: "用这套公式，我把一个原本阅读量100的笔记改到了1万+。附赠一份打水印的小工具源码。",
        hidden_content: "下载链接: https://pan.baidu.com/s/1xx... 提取码: 1234。记得把这套公式打印出来贴在屏幕旁！",
        price: 1,
        accepts_barter: false,
        barter_demand: ""
    },
    {
        title: "帮你看一份大厂求职简历",
        hook_description: "我在大厂捞过几年简历，只说真话。不怕被批的话来找我，帮你挑出至少3个致命排版和叙述错误。",
        hidden_content: "请加我微信：ResumeHelper_88，备注：一元集市。发送完整的PDF版本给我。",
        price: 1,
        accepts_barter: true,
        barter_demand: "我目前在自学前端，如果你能帮我讲清楚 Next.js 的服务端渲染，我们就免费交换！"
    },
    {
        title: "做梦梦到的高概念科幻短片大纲",
        hook_description: "关于记忆黑市的故事，反转极其出彩！我没空拍，寻找有缘的影视系同学甚至B站up主拿去用。",
        hidden_content: "梗概：主角发现自己每天醒来都会多一段不属于自己的‘越狱’记忆...（加我的飞书文档链接查看完整内容：https://feishu...）",
        price: 1,
        accepts_barter: true,
        barter_demand: "给我任意一包你们家乡没拆封的特产零食（包邮寄给我即可）！"
    },
    {
        title: "抽取一段你今天最需要的箴言",
        hook_description: "有些决定你心里已经有了答案，但你需要一枚硬币来帮你最后确认一下。点开这枚硬币吧。",
        hidden_content: "【答案】：不要犹豫了，你原本担心的事情有 90% 都不会发生。放下手机，现在就去做你想做的那件事！",
        price: 1,
        accepts_barter: false,
        barter_demand: ""
    }
];

async function seed() {
    for (const item of items) {
        try {
            const res = await fetch("http://localhost:3000/api/boxes", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(item)
            });
            const data = await res.json();
            console.log("Seeded:", data.title);
        } catch (err) {
            console.error(err);
        }
    }
}
seed();
