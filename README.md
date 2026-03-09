# 一元破壁集市 / web-demo

这是一个基于 Next.js App Router 的 MVP Demo，用来验证“一元知识盲盒 / 一元悬赏需求”最小闭环：

- 发布内容
- 首页展示
- 模拟支付
- 解锁隐藏内容

当前仓库的重点不是扩业务，而是先把 demo 收敛成可持续演进的 foundation 底座，供后续 `auth-user`、`marketplace-content`、`order-payment-admin` 复用。

## 技术栈

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS 4
- Prisma 5
- SQLite
- Vitest

## 本地启动

1. 安装依赖

```bash
npm ci
```

2. 复制环境变量模板

```bash
cp ".env.example" ".env"
```

3. 生成 Prisma Client 并初始化数据库

```bash
npm run db:generate
npm run db:migrate
npm run db:seed
```

4. 启动开发环境

```bash
npm run dev
```

默认地址：[http://localhost:3000](http://localhost:3000)

## 数据库与 Seed

- Prisma schema 使用 `DATABASE_URL` 驱动，本地默认数据库路径是 `prisma/dev.db`
- 仓库长期只保留 `schema.prisma`、`migrations/`、`seed.ts`
- SQLite 数据文件仅作为本地运行时资产，不再作为版本化资产提交
- 正式 seed 入口只有一个：`npm run db:seed`

常用命令：

```bash
npm run db:generate
npm run db:migrate
npm run db:seed
```

## 质量门槛

在合并到 `main` 之前，必须通过以下检查：

```bash
npm run lint
npm test
npm run build
```

## 分支协作约定

- `foundation`：公共底座、目录规范、基础设施、统一协议、测试与 CI
- `auth-user`：用户与鉴权
- `marketplace-content`：内容市场能力演进
- `order-payment-admin`：订单、支付、后台最小闭环

目录和接口约定见：

- `docs/foundation-engineering-conventions.md`
- `docs/module-branch-delivery-plan.md`
