import { Type } from 'class-transformer'
import { IsInt, IsOptional, IsString, Max, Min, MinLength } from 'class-validator'
import { MAX_MESSAGE_PAGE_SIZE } from '../constants.js'

export class ListMessagesQueryDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  cursor?: string

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(MAX_MESSAGE_PAGE_SIZE)
  limit?: number
}
