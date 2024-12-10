import { PinoLogger } from "../core/PinoLogger";
import { storage, Store } from "../core/storage";
/**
 * @description 为类方法添加了日志上下文管理功能，
 * 使得在方法执行时能够自动创建和使用新的日志上下文，
 * 从而实现更细粒度的日志记录和管理。
 * @export
 * @return {*}
 */
export function WithLoggerContext() {
  return function (
    _target: unknown,
    _key: string | symbol,
    descriptor: PropertyDescriptor,
  ) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
    const methodFunc = descriptor.value as Function;
    if (!methodFunc) {
      return descriptor;
    }

    descriptor.value =
      methodFunc.constructor.name === 'AsyncFunction'
        ? async function (...args: unknown[]) {
            return storage.run(new Store(PinoLogger.root.child({})), async () =>
              // eslint-disable-next-line @typescript-eslint/ban-ts-comment
              // @ts-ignore
              methodFunc.apply(this, args),
            );
          }
        : function (...args: unknown[]) {
            return storage.run(new Store(PinoLogger.root.child({})), () =>
              // eslint-disable-next-line @typescript-eslint/ban-ts-comment
              // @ts-ignore
              methodFunc.apply(this, args),
            );
          };

    return descriptor;
  };
}
