import { ExternalApproval } from '@aiofc/entities';
import { Injectable } from '@nestjs/common';
import { BaseEntityService } from '@aiofc/service-base';
import { ExternalApprovalsRepository } from './external-approval.repository';

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
