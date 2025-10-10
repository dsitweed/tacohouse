import { OmitType, PartialType } from '@nestjs/mapped-types';

import { CreateBuildingDto } from './create-building.dto';

export class UpdateBuildingDto extends PartialType(
  OmitType(CreateBuildingDto, ['landlordId'] as const),
) {}
