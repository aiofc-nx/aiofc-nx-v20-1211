import { HttpStatus, Logger } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { FastifyReply, FastifyRequest } from 'fastify';
import { SamlConfig } from '../../../config/saml.config';
import {
  GeneralInternalServerException,
  GeneralUnauthorizedException,
} from '@aiofc/exceptions';
import { InitiateSamlLoginRequest } from '../../controllers/auth/vo/saml.dto';
import { map } from '@aiofc/validation';
import { AuthErrorCodes } from './vo/auth-error-codes.enum';
import { ErrorCodes } from '../../../common/vo/error-codes.enum';
import { Profile, Strategy } from '@node-saml/passport-saml';
import { AuthService } from '../auth/auth.service';
import {
  decodeBase64StringObjectFromUrl,
  encodeObjectToBase64ForUrl,
} from '@aiofc/utils';

export class SamlStrategy extends PassportStrategy(Strategy, 'saml') {
  private readonly logger = new Logger(SamlStrategy.name);

  constructor(
    private readonly authService: AuthService,
    readonly samlConfig: SamlConfig,
    private request: FastifyRequest,
    private response: FastifyReply,
    readonly entryPoint: string,
    readonly cert: string,
    readonly replyData?: Record<string, unknown>
  ) {
    super({
      issuer: samlConfig.issuer,
      callbackUrl: samlConfig.callbackUrl,
      cert,
      entryPoint,
      wantAssertionsSigned: samlConfig.wantAssertionsSigned,
      additionalParams: {
        ...(replyData
          ? {
              RelayState: encodeObjectToBase64ForUrl(replyData),
            }
          : {}),
      },
    });
  }

  override redirect(url: string, status?: number) {
    this.response.redirect(status || HttpStatus.FOUND, url);
  }

  public override async success(user: Profile, info: unknown) {
    this.logger.log(
      `Successfully logged in user through saml ${user.email}. ${info}`
    );

    const relayState = decodeBase64StringObjectFromUrl(
      (this.request.body as any)?.RelayState
    );

    const configInfo = map(relayState, InitiateSamlLoginRequest);

    if (!configInfo.samlConfigurationId || !configInfo.redirectUrl) {
      this.logger.error(
        `Looks like user is trying to login with SAML, but there is no data in relay state. Relay state: ${JSON.stringify(
          relayState
        )}. Probably someone is messing with us. User: ${
          user.email
        }. It require some attention from support team.`
      );

      const errorResponse = new GeneralUnauthorizedException(
        AuthErrorCodes.MISSING_STATE_DATA,
        new Error(`Missing required state data`)
      ).toErrorResponse(
        this.request.id,
        // said that I need to use it here, but I know that the service is there for sure, we have test for it
        // probably there is more elegant way to do it, so let's leave it for now with TODO comment
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        this.request.i18nService
      );

      this.response.code(errorResponse.status).send(errorResponse);
      return;
    }

    const tokens = await this.authService.signInSaml(
      relayState.tenantId as string,
      user
    );

    const redirectUrl = new URL(relayState.redirectUrl as string);

    redirectUrl.searchParams.append('jwt', tokens.accessToken);
    redirectUrl.searchParams.append('refresh', tokens.refreshToken);

    this.response.redirect(
      HttpStatus.MOVED_PERMANENTLY,
      redirectUrl.toString()
    );
  }

  override fail(challenge: string | number, status?: number) {
    this.logger.error(
      `Saml authentication failed with challenge ${challenge} and status ${status}. In general it shouldn't happen and customer definitely will need a support here`
    );

    const errorResponse = new GeneralUnauthorizedException(
      AuthErrorCodes.SAML_AUTHENTICATION_FAILURE,
      new Error(`Saml authentication failed with challenge ${challenge}`)
    ).toErrorResponse(
      this.request.id,
      // said that I need to use it here, but I know that the service is there for sure, we have test for it
      // probably th ere is more elegant way to do it, so let's leave it for now with TODO comment
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      this.request.i18nService
    );

    this.response.code(errorResponse.status).send(errorResponse);
  }

  override pass() {
    this.logger.error(
      'Passing saml strategy called - this should not happen. If you see this message, please contact customer and start investigation.'
    );
    this.error(new Error('Passing saml strategy called'));
  }

  override error(err: Error) {
    const errorResponse = new GeneralInternalServerException(
      ErrorCodes.INTERNAL_SERVER_ERROR,
      err
    ).toErrorResponse(
      this.request.id,
      // said that I need to use it here, but I know that the service is there for sure, we have test for it
      // probably there is more elegant way to do it, so let's leave it for now with TODO comment
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      this.request.i18nService
    );

    this.response.code(errorResponse.status).send(errorResponse);
  }
}
