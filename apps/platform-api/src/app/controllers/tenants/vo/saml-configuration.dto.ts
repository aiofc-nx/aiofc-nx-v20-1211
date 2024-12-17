import {
  IsBooleanLocalized,
  IsStringCombinedLocalized,
  IsUrlLocalized,
} from '@aiofc/validation';
import { Expose, Type } from 'class-transformer';
import { ValidateNested } from 'class-validator';

import { IdpMappingDto } from '../../roles/vo/idp-mapping.dto';
import { PickType } from '@nestjs/swagger';
import { SAMLConfiguration } from '@aiofc/entities';

export class SetupSamlConfiguration {
  @IsUrlLocalized()
  @Expose()
  entryPoint!: string;

  @IsStringCombinedLocalized()
  @Expose()
  certificate!: string;

  @Type(/* istanbul ignore next */ () => IdpMappingDto)
  @ValidateNested()
  @Expose()
  fieldsMapping!: IdpMappingDto;

  @IsBooleanLocalized()
  @Expose()
  enabled!: boolean;
}

export class SetupSamlConfigurationResponseDTO extends PickType(
  SAMLConfiguration,
  ['id']
) {
  @Expose()
  message!: string;
}
