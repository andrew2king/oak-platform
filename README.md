# Oak Platform - 新零售平台

> 面向超大型品牌连锁零售企业的分布式电商平台

[![CI/CD](https://github.com/oak-platform/oak-platform/actions/workflows/ci-cd.yaml/badge.svg)](https://github.com/oak-platform/oak-platform/actions/workflows/ci-cd.yaml)

## 项目概述

Oak Platform 是一个完整的新零售解决方案，包含：

- **业务中台**: 商品、订单、库存、会员、营销、供应链、财务、物流、生产、售后十大领域
- **技术中台**: 网关、消息、配置、缓存、搜索、多租户、可观测等基础设施
- **数据中台**: 实时计算、数据湖、AI/ML平台、推荐引擎
- **全渠道营销**: 线上线下融合、O2O、社交电商

## 技术栈

| 层级 | 技术 |
|-----|------|
| 业务中台 | Java 17 + Spring Cloud Alibaba |
| 技术中台 | Go 1.21+ |
| 数据中台 | Flink + Spark + TensorFlow |
| Service Mesh | Istio |
| 容器编排 | Kubernetes |
| 数据库 | PostgreSQL 15+ |
| 缓存 | Redis 7+ |
| 消息队列 | Kafka 3.6+ |

## 项目结构

```
oak-platform/
├── docs/                      # 文档
│   ├── plans/                 # 计划文档
│   └── architecture/          # 架构文档
├── infra/                     # 基础设施
│   ├── k8s/                   # Kubernetes配置
│   ├── istio/                 # Istio配置
│   └── sql/                   # 数据库脚本
├── tech-platform/             # 技术中台 (Go)
│   ├── gateway/               # API网关
│   ├── message/               # 消息中心
│   ├── config/                # 配置中心
│   └── ...
├── biz-platform/              # 业务中台 (Java)
│   ├── common/                # 公共模块
│   ├── product/               # 商品域
│   ├── order/                 # 订单域
│   ├── inventory/             # 库存域
│   └── member/                # 会员域
├── data-platform/             # 数据中台
│   ├── flink-jobs/            # Flink作业
│   ├── spark-jobs/            # Spark作业
│   └── ml-models/             # ML模型
├── frontend/                  # 前端项目
│   ├── admin-web/             # 管理后台
│   ├── miniapp/               # 小程序
│   └── shared/                # 共享组件
└── testing/                   # 测试
    ├── e2e/                   # 端到端测试
    ├── performance/           # 性能测试
    └── security/              # 安全测试
```

## 快速开始

### 环境要求

- JDK 17+
- Go 1.21+
- Node.js 20+
- Docker
- Kubernetes (可选)

### 业务中台启动

```bash
cd biz-platform
mvn clean install
cd product
mvn spring-boot:run
```

### 技术中台启动

```bash
cd tech-platform
go mod download
cd gateway
go run main.go
```

### 前端启动

```bash
cd frontend
pnpm install
cd admin-web
pnpm dev
```

### 数据库初始化

```bash
psql -U postgres -f infra/sql/init.sql
```

## 开发进度

### 一期（进行中）

| 模块 | 状态 | 进度 |
|-----|------|------|
| 项目框架 | ✅ 已完成 | 100% |
| 商品域 | 🚧 进行中 | 60% |
| 订单域 | 🚧 进行中 | 40% |
| 库存域 | 🚧 进行中 | 30% |
| 会员域 | 🚧 进行中 | 30% |

## 文档

- [架构设计文档](docs/plans/2026-03-31-oak-platform-design.md)
- [实施计划](docs/plans/2026-03-31-implementation-plan.md)
- [架构图规格](docs/architecture/architecture-diagrams-spec.md)

## 团队

- 架构组
- 业务中台组
- 技术中台组
- 数据中台组
- 前端组
- 测试组
- 运维组

## License

Copyright © 2026 Oak Platform