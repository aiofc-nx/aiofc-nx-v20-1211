import { Controller, Get } from '@nestjs/common';
import { Permissions, SkipAuth } from '@aiofc/auth';
import { ClsService } from '@aiofc/nestjs-cls';
import { TenantClsStore } from '@aiofc/persistence-base';

@Controller('skip-auth')
@SkipAuth()
export class SkipAuthController {
  constructor(private readonly clsService: ClsService<TenantClsStore>) {}

  @Get()
  async skipAuth() {
    return 'hello';
  }

  @Get('/cls-store')
  async getClsStore() {
    return this.clsService.get();
  }

  /**
   * This is for sure a mistake
   * */
  @Get('secured')
  @Permissions('allow')
  async withPermission() {
    return 'hello';
  }
}
