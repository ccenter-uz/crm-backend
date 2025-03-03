import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsNotEmpty,
  IsString,
  Length,
  Matches,
} from 'class-validator';
import { DefaultStatusEnum, ErrorMessageForPassword, UserRoleEnum } from 'src/types/global/constants';
import { UserInterfaces } from '../interface/user-group.interface';

export class CreateUserDto implements UserInterfaces.CreateUserDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  fullName: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  username: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @Length(8, 20)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&\-_\(\)])/, {
    message: ErrorMessageForPassword,
  })
  password: string;

  @ApiProperty({ enum: UserRoleEnum })
  @IsNotEmpty()
  @IsString()
  @IsEnum(UserRoleEnum)
  role: UserRoleEnum;

  @ApiProperty({ enum: DefaultStatusEnum })
  @IsNotEmpty()
  @IsEnum(DefaultStatusEnum)
  status: DefaultStatusEnum;
}
