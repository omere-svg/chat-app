import { Type } from 'class-transformer'
import { IsInt, IsOptional, IsString, Max, Min, MinLength } from 'class-validator'

const MAX_PAGE_SIZE = 100

export class ListMessagesQueryDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  cursor?: string

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(MAX_PAGE_SIZE)
  limit?: number
}
