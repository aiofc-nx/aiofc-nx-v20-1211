import { Article } from './articles/article.entity';
import { PermissionCategory } from './roles/permission-category.entity';
import { Permission } from './roles/permission.entity';
import { UserRole } from './roles/user-role.entity';
import { SAMLConfiguration } from './tenants/saml-configuration.entity';
import { Tenant } from './tenants/tenant.entity';
import { ExternalApproval } from './users/external-approval.entity';
import { UserProfile } from './users/user-profile.entity';
import { UserTenantAccount } from './users/user-tenant-account.entity';
export const Entities = [
  Article,
  Permission,
  PermissionCategory,
  UserRole,
  Tenant,
  SAMLConfiguration,
  UserProfile,
  ExternalApproval,
  UserTenantAccount,
];
