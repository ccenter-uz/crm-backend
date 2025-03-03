import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsOptional,
  IsString,
  Length,
  Matches,
} from 'class-validator';
import { DefaultStatusEnum, ErrorMessageForPassword, UserRoleEnum } from 'src/types/global/constants';
import { UserInterfaces } from '../interface/user-group.interface';

export class UpdateUserDto implements UserInterfaces.UpdateUserDto {
  @ApiProperty()
  @IsOptional()
  @IsString()
  fullName?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  username?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  @Length(8, 20)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&\-_\(\)])/, {
    message: ErrorMessageForPassword,
  })
  password?: string;

  @ApiProperty({ enum: UserRoleEnum })
  @IsOptional()
  @IsString()
  @IsEnum(UserRoleEnum)
  role?: UserRoleEnum;

  @ApiProperty({ enum: DefaultStatusEnum })
  @IsOptional()
  @IsEnum(DefaultStatusEnum)
  status?: DefaultStatusEnum;
}
