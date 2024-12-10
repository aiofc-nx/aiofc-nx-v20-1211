# aio-drizzle-kit
## 功能
- 利用`drizzle-kit`进行基本的数据库迁移操作。

## 基本使用方法
> Drizzle Kit 通过配置文件或 CLI 参数drizzle.config.ts配置
- 首先，在项目根目录下创建一个配置文件，默认文件名为`drizzle.config.ts`

```typescript
import { defineConfig } from "drizzle-kit"

export default defineConfig({
  dialect: "postgresql",
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dbCredentials: {
    url: "postgresql://postgres:postgres@localhost:5438/test-db"
    // url: process.env.DATABASE_URL!,
    // 或者
    // host: process.env.POSTGRES_HOST,
    // port: process.env.POSTGRES_PORT,
    // user: process.env.POSTGRES_USER,
    // password: process.env.POSTGRES_PASSWORD,
    // database: process.env.POSTGRES_DB,
  },
})
```
这里需要我们写入数据库的链接字符串，也可以通过环境变量文件`.env`形式读入。

```
DATABASE_URL="postgresql://postgres:postgres@localhost:5438/test-db"
POSTGRES_HOST="localhost"
POSTGRES_PORT="5438"
POSTGRES_USER="postgres"
POSTGRES_PASSWORD="postgres"
POSTGRES_DB="test-db"
```
- 然后，直接运行命令：
```bash
pnpm drizzle-kit studio
```
当你能够正常运行`studio`，意味着你已经可以连接到数据库。这是进行数据迁移的基础。

> 注意：`Drizzle Studio`目前并不稳定，需要`drizzle-kit`和`drizzle-orm`之间的版本匹配才能正常运行。

## 常用操作命令：

```bash
pnpm drizzle-kit generate  // 基于 Drizzle 架构生成 SQL 迁移文件
pnpm drizzle-kit migrate   // 将生成的 SQL 迁移文件应用到数据库
pnpm drizzle-kit push      // 在声明时或后续 schema 更改时将 Drizzle schema 推送到数据库
pnpm drizzle-kit pull      // 拉取（内省）数据库架构，将其转换为 Drizzle 架构并将其保存到您的代码库中
pnpm drizzle-kit check     // 将遍历所有生成的迁移并检查生成的迁移是否有任何竞争条件（冲突）
pnpm drizzle-kit up        // 用于升级以前生成的迁移的快照
pnpm drizzle-kit studio    // 将连接到您的数据库并为 Drizzle Studio 启动代理服务器，您可以使用它来方便地浏览数据库
```
为了方便操作，我们把命令写入脚本：
```json
"scripts": {
  "migrate": "tsx src/node-postgres-migrate.ts",
  "db:generate": "drizzle-kit generate --config=drizzle.config.ts",
  "db:studio": "drizzle-kit studio",
  "db:migrate": "drizzle-kit migrate --config=drizzle.config.ts",
  // 从现有的数据库中提取模式信息，并生成相应的 TypeScript 类型定义或其他配置文件。
  "db:introspect": "drizzle-kit introspect --config=drizzle.config.ts"
}
```

## 必要说明：

在 `drizzle-kit` 工具中，`pull` 命令和 `introspect` 命令都用于与数据库交互，但它们的用途和功能有所不同。以下是对这两个命令的详细解释：

#### - `drizzle-kit pull`
`drizzle-kit pull` 命令通常用于从远程数据库中提取最新的数据库模式和数据，并将其同步到本地项目中。这个命令的主要目的是确保本地项目的数据库模式和数据与远程数据库保持一致。

#### 主要功能：
- 从远程数据库中提取最新的模式和数据。
- 将提取的数据同步到本地项目中。
- 确保本地开发环境与远程数据库保持一致。

#### - `drizzle-kit introspect`
`drizzle-kit introspect` 命令用于从现有的数据库中提取模式信息，并生成相应的 TypeScript 类型定义或其他配置文件。这个命令的主要目的是自动化数据库模式的提取和生成过程，使得开发者可以方便地获取数据库的最新模式信息，并将其集成到 TypeScript 项目中。

#### 主要功能：
- 从现有的数据库中提取模式信息。
- 生成相应的 TypeScript 类型定义或其他配置文件。
- 自动化和简化数据库模式的管理，确保代码与数据库模式同步。

#### 区别总结
- **用途**：
  - `drizzle-kit pull`：用于从远程数据库中提取最新的模式和数据，并将其同步到本地项目中。
  - `drizzle-kit introspect`：用于从现有的数据库中提取模式信息，并生成相应的 TypeScript 类型定义或其他配置文件。

- **主要功能**：
  - `drizzle-kit pull`：同步远程数据库和本地项目的数据和模式。
  - `drizzle-kit introspect`：生成数据库模式的 TypeScript 类型定义或配置文件。

- **使用场景**：
  - `drizzle-kit pull`：适用于需要确保本地开发环境与远程数据库保持一致的场景。
  - `drizzle-kit introspect`：适用于需要自动化和简化数据库模式管理的场景，特别是在数据库模式频繁变化的项目中。

通过理解这两个命令的区别，你可以根据具体需求选择合适的命令来管理和同步数据库模式和数据。