# @aiofc/config

本库基于[nest-typed-config](https://github.com/Nikaple/nest-typed-config),
主要工作都在父库中完成，这只是一个包装器，以使其更易于使用。我们已经集成了[nest-typed-config](https://github.com/Nikaple/nest-typed-config)的主要源码(在core目录下)，因此，你不需要额外安装它。

在原基础上，我们增加一个`validator.ts`，使这个库可以不需要依赖其他库而独立使用。
定义一个包含 `ValidateNested` 和 `Type` 装饰器的数组，为类的属性提供了验证和类型转换功能。这种组合使用方式在处理复杂对象结构时非常有用，可以确保嵌套对象的验证和类型转换能够正确进行。因此，在使用`yaml`格式定义配置数据时，根配置必须用这两个装饰器进行校验和类型转换，否则有层级的嵌套数据不能正确解析。

```typescript
import { ValidateNestedProperty } from "@aiofc/config";
import { AppConfig } from "./app.config";

export default class RootConfig {
  @ValidateNestedProperty({ classType: AppConfig })
  public readonly app!: AppConfig;
}
```
配置文件：
```yaml
app:
  port: 9000
  prefix: 'api'
```
解析为：
```json
RootConfig {
  app: AppConfig {
    port: 9000,
    prefix: 'api'
    }
}
```

