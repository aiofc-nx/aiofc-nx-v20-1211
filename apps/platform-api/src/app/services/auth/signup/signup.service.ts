import { Injectable, Logger } from '@nestjs/common';
import {
  BaseSignUpByEmailRequest,
  SignUpByEmailResponse,
} from '../../../controllers/auth/vo/sign-up.dto';
import { Transactional } from 'typeorm-transactional';
import AbstractAuthUserService from '../abstract-auth-user.service';
import {
  AccessTokenPayload,
  RefreshTokenPayload,
} from '../../../../common/vo/token-payload';
import { AbstractSignupService } from './abstract-signup.service';
import { AbstractTokenBuilderService } from '@aiofc/auth';
import { ConflictEntityCreationException } from '@aiofc/exceptions';
import { hashPassword } from '@aiofc/utils';
import { UserProfile } from '@aiofc/entities';

@Injectable()
export class SignupService extends AbstractSignupService<BaseSignUpByEmailRequest> {
  private readonly logger = new Logger(SignupService.name);

  constructor(
    private readonly userAuthService: AbstractAuthUserService,
    private readonly tokenBuilderService: AbstractTokenBuilderService<
      UserProfile,
      AccessTokenPayload,
      RefreshTokenPayload
    >
  ) {
    super();
  }

  @Transactional()
  async signUp(
    createUserDto: BaseSignUpByEmailRequest
  ): Promise<SignUpByEmailResponse> {
    const existingUser = await this.userAuthService.findUserByEmail(
      createUserDto.email
    );

    if (existingUser) {
      this.logger.warn(
        `User trying to register with same email again: ${createUserDto.email}`,
        {
          userId: existingUser.id,
          ignore: true,
        }
      );

      throw new ConflictEntityCreationException(
        'User',
        'email',
        createUserDto.email
      );
    }
    const hashedPassword = await hashPassword(createUserDto.password);

    this.logger.log(
      `Creating a new user, with email address: ${createUserDto.email}`
    );

    const { user, externalApproval } =
      await this.userAuthService.createUserByEmail({
        ...createUserDto,
        password: hashedPassword,
      });

    return {
      approvalId: externalApproval.id,
      jwtPayload: this.tokenBuilderService.buildTokensPayload(user),
    };
  }
}
