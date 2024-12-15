import { I18n, I18nContext, I18nService } from '@aiofc/i18n';
// import { ClsService, ClsStore } from '@aiofc/nestjs-cls';
import { map } from '@aiofc/validation';
import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { I18nTranslations } from '../../../generated/i18n.generated';
import {
  SignUpByEmailRequest,
  SignUpByEmailResponseDTO,
} from './vo/sign-up.dto';
import { AbstractSignupService } from '../../services/auth/signup/abstract-signup.service';

@Controller({
  path: 'auth',
})
export class AuthController {
  constructor(
    // private readonly clsService: ClsService<ClsStore>,
    private readonly i18: I18nService,
    // private readonly signUpService: SignupService
    private readonly signUpService: AbstractSignupService<SignUpByEmailRequest>
  ) {}

  /**
   * 用户注册接口
   *
   * @param i18n - 国际化上下文对象，用于翻译提示消息
   * @param request - 注册请求参数，包含邮箱等用户信息
   * @returns 返回注册响应DTO，包含注册结果和提示消息
   *
   * 处理流程:
   * 1. 调用 signUpService.signUp() 处理注册逻辑
   * 2. 将返回结果映射为 SignUpByEmailResponseDTO
   * 3. 添加国际化的成功提示消息
   */
  @Post('signup')
  @HttpCode(HttpStatus.CREATED)
  public async signUp(
    @I18n() i18n: I18nContext<I18nTranslations>,
    @Body() request: SignUpByEmailRequest
  ): Promise<SignUpByEmailResponseDTO> {
    return this.signUpService.signUp(request).then((response) => {
      const responseDTO = map(response, SignUpByEmailResponseDTO);
      return {
        ...responseDTO,
        message: i18n.t('user.FINISHED_REGISTRATION'),
      };
    });
  }
}
