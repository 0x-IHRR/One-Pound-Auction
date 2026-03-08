# Foundation 工程约定

## 目录职责

- `app/`：页面入口和 route handler，只做装配与请求转发
- `features/`：按业务模块承载组件、schema、repository、service、types
- `server/`：仅服务端可用的基础设施与 helper
- `shared/`：跨模块公共能力，包括配置、错误、HTTP 响应、日志、纯工具函数
- `prisma/`：数据库 schema、migrations、seed

## API 响应格式

所有接口统一使用 envelope：

```json
{
  "success": true,
  "data": {}
}
```

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "请求参数不合法。"
  }
}
```

## 错误处理与日志

- 业务错误统一抛 `AppError`
- Zod 校验失败统一映射为 `400 + VALIDATION_ERROR`
- 未知异常统一映射为 `500 + INTERNAL_SERVER_ERROR`
- 日志统一通过 `shared/logger/logger.ts` 输出结构化对象

## Migration / Seed 流程

```bash
npm run db:generate
npm run db:migrate
npm run db:seed
```

- 本地开发数据库路径固定为 `prisma/dev.db`
- SQLite 文件不提交到仓库
- `prisma/seed.ts` 是唯一正式 seed 入口
