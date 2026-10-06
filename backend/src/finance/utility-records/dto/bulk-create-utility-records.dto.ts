import { Type } from 'class-transformer';
import { ArrayMinSize, IsArray, ValidateNested } from 'class-validator';

import { CreateUtilityRecordDto } from './create-utility-record.dto';

export class BulkCreateUtilityRecordsDto {
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreateUtilityRecordDto)
  records: CreateUtilityRecordDto[];
}
