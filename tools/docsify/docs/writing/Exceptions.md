# Exceptions Library

该库提供了一组通用异常和拦截器，以便异常遵循相同的结构[RFC7807](https://www.rfc-editor.org/rfc/rfc7807#section-3.1)

It can be used outside aiofc projects

## Why we need it all?

- 有统一的方式来处理异常
- 能够在 swagger 中正确记录异常
- 客户端有统一的异常处理方式
- 在服务器端有一个统一的方法来处理异常，甚至在调用内部服务时将它们代理到客户端
- 有统一的方式来处理日志中的异常
- 有一个统一的方式来理解什么是真正的异常，什么是业务逻辑错误。这可以为客户提供高效、主动的支持。

## Installation

```bash
yarn add @aiofc/exceptions
```

You can also use [@aiofc/bootstrap](https://www.npmjs.com/package/@aiofc/bootstrap) to bootstrap your app with all default interceptors and filters.

这个库也很紧[Nestjs-i18n](https://www.npmjs.com/package/nestjs-i18n)，这使我们可以轻松更改库的默认消息传递，或者如果您同意我们刚刚使用的默认消息传递（*仅提供英语*）


## Usage


### 默认拦截器


- **AnyExceptionFilter** - 将捕获任何异常并返回 http 状态 500
- **HttpExceptionFilter** - 将捕获 AbstractHttpException 实例的任何异常并从异常返回 http 状态
- **ForbiddenExceptionFilter** - 将捕获 NestJS ForbiddenException 并返回 http 状态 403，但使用我们的 **RFC**格式
- **NotFoundExceptionFilter** - 将捕获 NestJS NotFoundException 并返回 http 状态 404，但使用我们的 **RFC**格式

### 可用的例外情况





### 您可以创建自己的异常，它将由默认拦截器处理，并以统一格式返回。请参阅 ErrorResponse 类。


```typescript
import { AbstractHttpException } from '@aiofc/exceptions';

export class YourException extends AbstractHttpException {
  constructor(rootCause?: unknown) {
    super(
      i18nString('exception.YOUR_EXCEPTION.TITLE'),
      i18nString('exception.YOUR_EXCEPTION.GENERAL_DETAIL'),
      HttpStatus.FORBIDDEN,
      undefined,
      rootCause,
    );
  }
}
```

### Override wording

To override the default titles and details, you can take a localisation `exception.json` file from this library and inject it to your project

Load it with nestjs-i18n and substitution will be done automatically

You can also package this file to your localisation library to distribute across your organisation.


```
exception.json file is packaged to this repo and need to referenced and loadded in your app

if you won't load it you will see default keys for i18n
```




