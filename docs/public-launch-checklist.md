# 公网问题收集器上线检查清单

上线主入口：`/ask`

## 必填环境变量

```bash
NODE_ENV=production
APP_BASE_URL=https://your-domain.com
DATABASE_URL=postgresql://user:password@host:5432/database
AUTH_SECRET=replace-with-a-long-random-secret
AUTH_GOOGLE_ID=your-google-client-id
AUTH_GOOGLE_SECRET=your-google-client-secret
AUTH_ADMIN_EMAILS=admin@example.com
AUTH_DEMO_ENABLED=false
PAYMENT_SIMULATION_ENABLED=false
```

## 域名与登录

- Google OAuth Origin 填写 `https://your-domain.com`
- Google OAuth Redirect URI 填写 `https://your-domain.com/api/auth/callback/google`
- `AUTH_ADMIN_EMAILS` 只放真实管理员邮箱，多个邮箱用英文逗号分隔
- 公网必须设置 `AUTH_DEMO_ENABLED=false`

## 数据库

- 使用托管 PostgreSQL
- 部署前运行 `npx prisma validate`
- 首次空库运行 `npm run db:migrate`
- 需要演示内容时运行 `npm run db:seed`

## 支付

- 当前不接真实 payment
- 公网必须设置 `PAYMENT_SIMULATION_ENABLED=false`
- 模拟支付仅用于本地开发和演示

## 发布前验证

```bash
npm run lint
npm test
npm run build
```

浏览器检查：

- `/ask` 可提交问题
- `/` 可浏览公开问题池和集市内容
- `/boxes/:id` 对免费问题请求不显示支付入口
- `/admin` 只有管理员可访问，并能看到联系方式和补充背景
