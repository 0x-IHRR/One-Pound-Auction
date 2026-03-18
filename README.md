# 一元破壁集市 / web-demo

这是一个基于 Next.js App Router 的 MVP Demo，用来验证“一元知识盲盒 / 一元悬赏需求”最小闭环：

- 发布内容
- 首页展示
- 模拟支付
- 解锁隐藏内容

当前主线已经合入：

- `foundation`
- `auth-user`
- `marketplace-content`
- `order-payment-admin`

当前仓库的重点不是继续堆长期并行分支，而是把 `main` 收敛成唯一稳定基线。后续所有开发任务都应从最新 `main` 切出新分支，完成后再合回 `main`。

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

如果你当前只做本地开发和 smoke test，至少保证 `.env` 中存在：

- `DATABASE_URL`
- `NODE_ENV`
- `APP_BASE_URL`
- `AUTH_SECRET`

默认模板已经开启 Demo 登录，开箱即用；如果你要关闭演示登录，再手动把 `AUTH_DEMO_ENABLED=false`。

3. 生成 Prisma Client 并初始化数据库

```bash
npm run db:generate
npm run db:migrate
npm run db:seed
```

如果你在开发新 schema 变更并需要生成迁移文件，请使用：

```bash
npm run db:migrate:dev -- --name <migration_name>
```

4. 启动开发环境

```bash
npm run dev
```

默认地址：[http://localhost:3000](http://localhost:3000)

## 数据库与 Seed

- Prisma schema 使用 `DATABASE_URL` 驱动；当前 `.env.example` 中的 `DATABASE_URL="file:./dev.db"` 会解析到 `prisma/dev.db`
- 仓库长期只保留 `schema.prisma`、`migrations/`、`seed.ts`
- SQLite 数据文件仅作为本地运行时资产，不再作为版本化资产提交
- `npm run db:migrate` 用于在本地应用已有迁移；它不会创建新迁移文件
- 正式 seed 入口只有一个：`npm run db:seed`
- 鉴权相关环境变量统一通过 `.env` 提供；本地最小可运行配置至少需要 `AUTH_SECRET`
- 默认 seed 会写入可直接演示购买流程的内容归属数据，不再依赖匿名历史内容

常用命令：

```bash
npm run db:generate
npm run db:migrate
npm run db:seed
```

## 启动验证

初始化完成后，至少确认下面几条链路可用：

- `/`
- `/api/boxes`
- `/boxes/:id`
- `/creator`
- `/me`
- `/me/purchases`
- `/api/orders`
- `/admin`

## MVP 演示流程

默认 `.env.example` 已经准备好两套 Demo 身份：

- 普通用户：`demo-user@example.com`
- 管理员：`demo-admin@example.com`

推荐按下面顺序演示：

1. 打开 `/sign-in`，先用“普通用户身份”登录
2. 回到首页，打开任意一条管理员发布的 `OFFER`
3. 点击购买，完成模拟支付
4. 支付成功后自动回到详情页，确认隐藏内容已经解锁
5. 打开 `/me/purchases`，确认购买记录存在
6. 退出后再用“管理员身份”登录
7. 打开 `/creator` 发布新内容，或进入 `/admin` 查看内容列表与订单列表

如果你配置了 Google OAuth，也可以继续使用 Google 登录；Demo 登录只是为了保证 MVP 在本地和演示环境可直接跑通。

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

## 常见问题

### 1. `npm run db:migrate` 报 migration 相关错误

先确认你使用的是最新主线代码，并且按顺序执行：

```bash
npm run db:generate
npm run db:migrate
npm run db:seed
```

当前主线已经补齐从 `BlindBox` 到 `AuctionItem` 的迁移链，空库初始化应当可以直接跑通。

如果你本地正在开发新的 Prisma schema 变更，不要直接依赖 `npm run db:migrate` 生成迁移；请改用：

```bash
npm run db:migrate:dev -- --name <migration_name>
```

### 2. 首页或 `/api/boxes` 返回 500

优先检查数据库是否已经初始化，以及 `.env` 是否存在：

```bash
cp ".env.example" ".env"
npm run db:generate
npm run db:migrate
npm run db:seed
```

### 3. `next dev` 提示 `.next/dev/lock` 或端口被占用

这是旧的开发进程没有退出，不是代码本身必然有问题。先停止旧的 `next dev` 进程，再重新启动。

### 4. 运行时出现 `[auth][error] MissingSecret`

说明 `.env` 缺少 `AUTH_SECRET`。请补上一个本地开发专用随机值，例如：

```bash
AUTH_SECRET=replace-with-a-local-dev-secret
```
