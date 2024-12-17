import {
  I18n,
  I18nContext,
  I18nService,
  I18nValidationException,
} from '@aiofc/i18n';
// import { ClsService, ClsStore } from '@aiofc/nestjs-cls';
import { map } from '@aiofc/validation';
import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { I18nTranslations } from '../../../generated/i18n.generated';
import {
  SignUpByEmailRequest,
  SignUpByEmailResponseDTO,
  SignUpByEmailWithTenantCreationRequest,
} from './vo/sign-up.dto';
import { AbstractSignupService } from '../../services/auth/signup/abstract-signup.service';
import { ApiConflictResponsePaginated } from '@aiofc/common-types';
import { ApproveSignUpRequest } from './vo/approve.dto';
import { AuthService } from '../../services/auth/auth.service';
import { SignInRequest, SignInResponseDTO } from './vo/sign-in.dto';
import { FastifyReply, FastifyRequest } from 'fastify';
import { InitiateSamlLoginRequest } from './vo/saml.dto';
import { SamlService } from '../../services/auth/saml.service';
import { ClsStore } from '../../../common/vo/cls-store';
import { ClsService } from '@aiofc/nestjs-cls';
import { validate } from 'class-validator';
import { decodeBase64StringObjectFromUrl } from '@aiofc/utils';
import {
  CurrentUser,
  IRefreshTokenPayload,
  RefreshJwtAuthGuard,
  SkipAuth,
} from '@aiofc/auth';

@Controller({
  path: 'auth',
})
export class AuthController {
  constructor(
    private readonly clsService: ClsService<ClsStore>,
    private readonly i18: I18nService,
    // private readonly signUpService: SignupService
    private readonly samlService: SamlService,
    private readonly signUpService: AbstractSignupService<SignUpByEmailRequest>,
    private readonly authService: AuthService
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
  @ApiConflictResponsePaginated(
    'Appears when user with such email already exists'
  )
  @HttpCode(HttpStatus.CREATED)
  public async signUp(
    @I18n() i18n: I18nContext<I18nTranslations>,
    @Body() request: SignUpByEmailRequest
  ): Promise<SignUpByEmailResponseDTO> {
    console.log('signUp请求已经响应'); // 打印请求参数
    return this.signUpService.signUp(request).then((response) => {
      const responseDTO = map(response, SignUpByEmailResponseDTO);
      return {
        ...responseDTO,
        message: i18n.t('user.FINISHED_REGISTRATION'),
      };
    });
  }

  @Post('tenant-signup')
  @ApiConflictResponsePaginated(
    'Appears when user with such email already exists'
  )
  @HttpCode(HttpStatus.CREATED)
  public async signUpWithTenantCreation(
    @I18n() i18n: I18nContext<I18nTranslations>,
    @Body() request: SignUpByEmailWithTenantCreationRequest
  ): Promise<SignUpByEmailResponseDTO> {
    // depends on chosen workflow you can respond with tokens here and let user in
    return this.signUpService.signUp(request).then((response) => {
      const responseDTO = map(response, SignUpByEmailResponseDTO);
      return {
        ...responseDTO,
        message: i18n.t('user.FINISHED_REGISTRATION'),
      };
    });
  }

  /**
   @description 根据选择的工作流程,你可以在这里返回令牌并让用户登录,
    或者返回一些消息并让用户去登录
    默认行为是强制用户登录并确保其密码正确
   */
  @Post('approve-signup')
  @HttpCode(HttpStatus.OK)
  public async approveSignup(
    @I18n() i18n: I18nContext,
    @Body() request: ApproveSignUpRequest
  ) {
    await this.authService.approveUserEmail(request.id, request.code);

    return {
      message: this.i18.t('user.SUCCESSFULLY_APPROVED_EMAIL'),
    };
  }

  @Post('signin')
  @HttpCode(HttpStatus.OK)
  public async signIn(
    @I18n() i18n: I18nContext,
    @Body() request: SignInRequest
  ): Promise<SignInResponseDTO> {
    return this.authService
      .signIn(request.email, request.password)
      .then((tokens) => {
        const responseDTO = map(tokens, SignInResponseDTO);
        return {
          ...responseDTO,
          message: this.i18.t('user.SUCCESSFULLY_LOGGED_IN'),
        };
      });
  }

  @Post('sso/saml/login')
  @HttpCode(HttpStatus.OK)
  async samlLogin(
    @Req() req: FastifyRequest,
    @Res() res: FastifyReply,
    @Body() request: InitiateSamlLoginRequest
  ) {
    return this.samlService.login(request, req, res, {
      ...request,
      tenantId: this.clsService.get().tenantId,
    });
  }

  @Post('sso/saml/ac')
  @HttpCode(HttpStatus.OK)
  async samlAcknowledge(@Req() req: FastifyRequest, @Res() res: FastifyReply) {
    const relayState = decodeBase64StringObjectFromUrl(
      (req.body as any)?.RelayState
    );

    this.clsService.set('tenantId', relayState.tenantId as string);

    const initiateRequest = map(relayState, InitiateSamlLoginRequest);

    const validationErrors = await validate(initiateRequest);

    // manual validation is required because data come in base64 encoded string
    if (validationErrors.length > 0) {
      throw new I18nValidationException(validationErrors);
    }

    return this.samlService.login(initiateRequest, req, res);
  }

  @SkipAuth()
  @Post('refresh-access-token')
  @HttpCode(HttpStatus.OK)
  @UseGuards(RefreshJwtAuthGuard)
  public async refreshAccessToken(@CurrentUser() user: IRefreshTokenPayload) {
    const token = await this.authService.refreshAccessToken(user.email);

    return {
      accessToken: token,
    };
  }
}
