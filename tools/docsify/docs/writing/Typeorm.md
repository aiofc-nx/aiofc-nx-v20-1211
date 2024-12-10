# Typeorm Utilities

This library has some useful utilities for typeorm, entities, repositories, useful subscribers, interceptors.

It can be useful outside Softkit ecosystem

## Features

- It provides a base entity that has some useful fields like `createdAt`, `updatedAt`, `deletedAt`, `version`, `id`
- It overrides the default typeorm repository, and fixes some type confuses in the default typeorm repository
- It provides a tenant base repository, that make all requests based on tenant id that must be present in `ClsStore`
- Useful subscribers for auto populate any field from ClsStore, like `tenantId`, `userId`
- Optimistic lock handler, that will throw an error if you try to update an entity that was updated by someone else
- Common interceptors for DB errors, that transforms DB errors to RFC7807 errors
- Simplify transaction management with `@Transaction` decorator

## Installation

```bash
yarn add @aiofc/typeorm
```

## Usage

### Add default configuration in your root config class

```typescript
import { DbConfig } from '@aiofc/typeorm';

export class RootConfig {
  @Type(() => DbConfig)
  @ValidateNested()
  public readonly db!: DbConfig;
}
```

### .env.yaml file

```yaml
db:
  type: 'postgres'
  host: 'localhost'
  port: 5432
  username: postgres
  password: postgres
  database: local-db
  synchronize: false
  dropSchema: false
  keepConnectionAlive: true
  logging: false
  ssl: false
```

### Add setup and entities to your main app module

```typescript
import { setupTypeormModule } from '@aiofc/typeorm';
import * as Entities from './database/entities';

@Module({
  imports: [TypeOrmModule.forFeature(Object.values(Entities)), setupTypeormModule()],
})
class YourAppModule {}
```

### Entities to extend from

- `EntityHelper` -使用实体数据处理多态性
- `BaseEntityHelper` - with `id`, `createdAt`, `updatedAt`, `deletedAt`, `version` fields
- `BaseTenantEntityHelper` -对于属于特定租户的实体有用。它具有“tenantId”字段，该字段会自动填充以用于存储库级别的搜索操作

Note:

在您的实体中，您可以从“BaseEntityHelper”或“BaseTenantEntityHelper”或“EntityHelper”扩展并添加您的字段
并且还覆盖“id”字段决定您要使用的 uuid 或数字或其他类型

```typescript
class SampleEntity extends BaseEntityHelper {
  @PrimaryGeneratedColumn('uuid')
  id!: number;

  @Column()
  name!: string;
}
```

### Repositories to extend from

- `BaseRepository` -扩展默认 typeorm 存储库，并修复默认 typeorm 存储库中的一些类型混淆
- `TenantBaseRepository` -扩展 `BaseRepository` 并将 `tenantId` 添加到所有请求，该请求取自 `ClsStore`

Note:

If your entity is Tenant Base but in some cases you want to get all data, you can just create another repository for this entity that extends `BaseRepository`.
That's ok to have multiple repositories for one entity.

#### Examples

- Plain repository

```typescript
@Injectable()
export class SampleRepository extends BaseRepository<SampleEntity> {
  constructor(
    @InjectDataSource()
    ds: DataSource,
  ) {
    super(SampleEntity, ds);
  }
}
```

- Tenant base repository (_it require to pass a ClsService_)

```typescript
@Injectable()
export class TenantUserRepository extends BaseTenantRepository<TenantUserEntity> {
  constructor(
    @InjectDataSource()
    ds: DataSource,
    clsService: ClsService<TenantClsStore>,
  ) {
    super(TenantUserEntity, ds, clsService);
  }
}
```

### Subscribers

- ClsPresetSubscriber - responsible for populating any fields from ClsStore to entity beforeInsert and beforeUpdate

`It configurable via ClsPreset decorator`

```typescript
export class BaseTenantEntityHelper extends BaseEntityHelper {
  @ClsPreset<TenantClsStore>({
    clsPropertyFieldName: 'tenantId',
  })
  @Column({ nullable: false })
  tenantId!: string;
}
```

- `OptimisticLockSubscriber` - responsible for handling optimistic lock errors. It's important to handle optimistic locks properly for many reasons.
  For example, if you have a frontend app, and some resource where users can collaborate and override each other, it's important to handle optimistic lock errors properly.
  Even if your entity can be changed by one user at a time, it's important to handle optimistic lock errors properly, because it can be changed by another service or by this user in another tab, and he just forgot about it.

### Filters

- `PostgresDbQueryFailedErrorFilter` this filter is responsible for handling low level postgres QueryFailedError, it's mapping codes to the appropriate RFC7807 errors
