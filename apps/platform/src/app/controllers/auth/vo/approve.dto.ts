import { ExternalApproval } from '@aiofc/entities';
import { PickType } from '@nestjs/swagger';

export class ApproveSignUpRequest extends PickType(ExternalApproval, [
  'id',
  'code',
]) {}
