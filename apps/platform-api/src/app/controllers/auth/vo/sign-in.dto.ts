import { UserProfile } from '@aiofc/entities';
import { PickType } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class SignInRequest extends PickType(UserProfile, [
  'email',
  'password',
]) {}

export class SignInResponse {
  @Expose()
  accessToken!: string;

  @Expose()
  refreshToken!: string;
}

export class SignInResponseDTO extends SignInResponse {
  @Expose()
  message!: string;
}
