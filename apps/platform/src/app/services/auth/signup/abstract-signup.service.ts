import {
  BaseSignUpByEmailRequest,
  SignUpByEmailResponse,
} from '../../../controllers/auth/vo/sign-up.dto';

/**
 * 这个抽象类定义了处理用户注册相关的方法，但是并没有实现这些方法
 * 而是作为Token，指向具体实现这些方法的是TenantSignupService（tenant-signup.service.ts）
 * {
      provide: AbstractSignupService,
      useClass: TenantSignupService,
    }
 *
 * @typeParam T - 继承自BaseSignUpByEmailRequest的注册请求DTO类型
 */
export abstract class AbstractSignupService<
  T extends BaseSignUpByEmailRequest
> {
  /**
   * 抽象的注册方法
   *
   * @param createUserDto - 注册用户的DTO对象，包含注册所需信息
   * @returns Promise<SignUpByEmailResponse> - 返回注册响应的Promise
   */
  public abstract signUp(createUserDto: T): Promise<SignUpByEmailResponse>;
}
