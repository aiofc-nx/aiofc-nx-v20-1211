
# Validation Wrapper around class-validator

### We need this wrapper because of few reasons:

- class-validator 是一个不错的库，但它不再受到积极支持，我们考虑分叉它并自己维护它。
- class-validator 有很多替代品，但它是我们使用过的最方便的一种，并且许多其他库也在使用它。因此，为所有事情设置一个验证器是一个好主意。
- class-validator 停止支持动态验证模式，在这个库中，我们根据我们的需求和结构实现了它
- 我们也用[Nestjs-i18n](https://www.npmjs.com/package/@aiofc/i18n)来紧固它，这样我们就可以轻松覆盖默认翻译
- 此外，我们还为日期和布尔值等类型提供了更好的转换器，默认的类验证器转换器无法与这些和其他类型正常工作
- 提供额外有用的装饰器，例如`@Match`，检查一个字段是否与另一个字段匹配，以及类验证器中缺少的其他常见请求的装饰器，或正确的 @IsEmailLocalized 验证器，并且它们已本地化


### Validation rules for methods, can be found [here](https://github.com/mikeerickson/validatorjs/blob/master/src/rules.js)

### Installation

```bash
yarn add @aiofc/validation
```

### Usage

Usage is as simple as with plain [class-validator](https://github.com/typestack/class-validator)

### Dynamic validator usage

- This example will throw the appropriate exception that will be handled by our filter and return RFC7807 error response if value doesn't match validator schema

```typescript
import { IsEnumValidatorDefinition, validateAndThrow } from '@aiofc/validators';

validateAndThrow(
  IsEnumValidatorDefinition,
  'fieldName',
  'fieldValue',
  ['enumValue1', 'enumValue2'],
);
```

- This example will throw exception if value doesn't match constraint

```typescript
import { MatchesRegexpValidatorDefinition, validateAndThrow } from '@aiofc/validators';

const constraint = /^-?(?!0\d)\d+$/;

validateAndThrow(
  MatchesRegexpValidatorDefinition,
  params.key,
  value as string,
  constraint,
  i18nString('validation.INTEGER'),
);

```

-- If you don't need to throw exception immediately you can use `validateAndReturnError` method, that returns `ValidationError` object, that you can use later

```typescript
import { IsEnumValidatorDefinition, validateAndThrow } from '@aiofc/validators';

const error = validateAndReturnError(
  IsEnumValidatorDefinition,
  'fieldName',
  'fieldValue',
  ['enumValue1', 'enumValue2'],
);

console.log(error);

```


