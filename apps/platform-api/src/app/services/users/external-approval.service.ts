import { ExternalApproval } from '@aiofc/entities';
import { Injectable } from '@nestjs/common';
import { ExternalApprovalsRepository } from '../../repositories/users/external-approval.repository';
import { BaseEntityService } from '@aiofc/service-base';

@Injectable()
export class ExternalApprovalService extends BaseEntityService<
  ExternalApproval,
  'id',
  ExternalApprovalsRepository
> {
  constructor(private readonly usersRepository: ExternalApprovalsRepository) {
    super(usersRepository);
  }
}
