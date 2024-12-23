import { AbstractTenantResolutionService, IAccessTokenPayload } from "@aiofc/auth";

export class NoOpTenantResolutionService extends AbstractTenantResolutionService<IAccessTokenPayload> {
  override async resolveTenantId(): Promise<string | undefined> {
    return undefined;
  }

  override async verifyUserBelongToTenant(): Promise<boolean> {
    return false;
  }
}
