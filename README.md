# 邀请链接型 AI 履约系统（MVP）

基于 Next.js 15 + Prisma + PostgreSQL(Supabase) + Redis(BullMQ) 的一体化实现脚手架。

## 已实现模块（Phase 1 骨架）

- Prisma 数据模型：严格覆盖技术方案中的核心 12 张表。
- 后台 API：场景模板列表/创建、服务链接列表/创建、场景版本发布。
- 用户流程 API：链接激活、会话提交并投递报告任务。
- Worker：`generate_report` 异步任务消费。
- AI 编排占位：`AiOrchestrator`，保留结构化输出。

## 快速开始

1. 安装依赖

```bash
npm install
```

2. 配置环境变量

```bash
cp .env.example .env
```

3. 生成 Prisma Client 并迁移

```bash
npm run prisma:generate
npm run prisma:migrate
```

4. 启动 Web

```bash
npm run dev
```

5. 启动 Worker

```bash
npm run worker
```

## Supabase 配置说明

你后续只需把 Supabase 的连接串填入 `DATABASE_URL`。
推荐使用 Transaction Pooler/Direct Connection 并开启 `sslmode=require`。

## 下一步建议

- 补齐后台鉴权与 RBAC 中间件。
- 补齐 `step save/next/current-step/result` 用户 API。
- 完善审计日志写入点（目前已覆盖创建链接）。
- 接入真实 LLM Provider 并写入 `ai_runs`。
