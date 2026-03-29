# 邀请链接型 AI 履约系统（MVP）

基于 Next.js + Prisma + PostgreSQL(Supabase) + Redis(BullMQ) 的一体化实现。

## 已实现模块

- Prisma 数据模型：覆盖 `admin_users / roles / scenario_templates / scenario_versions / service_links / flow_sessions / step_responses / ai_runs / reports / audit_logs / link_events`
- 管理后台 API（MVP）
  - 场景模板：列表、创建
  - 场景版本：列表、创建、发布
  - 链接中心：列表、创建、撤销
  - 报告查看：按 id 获取
- 用户流程 API（MVP）
  - 链接激活
  - 步骤保存
  - 获取当前步骤
  - 下一步
  - 提交
  - 获取结果
- Worker 任务（MVP）
  - `generate_report`
  - `export_pdf`
  - `expire_links`

## 本地运行

1. 复制环境变量

```bash
cp .env.example .env
```

2. 安装依赖

```bash
npm install
```

3. 生成 Prisma Client

```bash
npm run prisma:generate
```

4. 创建迁移并同步数据库（连接 Supabase）

```bash
npm run prisma:migrate -- --name init
```

5. 启动 Web

```bash
npm run dev
```

6. 启动 Worker（新终端）

```bash
npm run worker
```

## Supabase 配置说明

Supabase 的 `DATABASE_URL` 推荐带 `sslmode=require`。

示例：

```env
DATABASE_URL="postgresql://postgres:<password>@<project-ref>.supabase.co:5432/postgres?sslmode=require"
```

## 下一步建议

- 接入真实管理员登录（cookie/session 或 JWT）
- 把占位 AI Orchestrator 替换为真实模型调用
- 增加前端后台页面与用户流程页面
- 增加 API 输入校验与统一错误码
