import { CurrentUser, IRefreshTokenPayload, RefreshJwtAuthGuard, SkipAuth } from '@aiofc/auth';
import { Controller, Get, UseGuards } from '@nestjs/common';

@Controller('refresh-auth')
@SkipAuth()
export class RefreshTokenAuthController {
  @Get()
  @UseGuards(RefreshJwtAuthGuard)
  async refreshAuthGuard() {
    return 'hello';
  }

  @Get('/user-context')
  @UseGuards(RefreshJwtAuthGuard)
  async refreshAuthGuardContextUserFromPayload(
    @CurrentUser() user: IRefreshTokenPayload,
  ) {
    return user;
  }
}
