import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Length, Matches } from 'class-validator';
import { UserInterfaces } from '../interface/user-group.interface';
import { ErrorMessageForPassword } from 'src/types/global/constants';

export class UserLogInDto implements UserInterfaces.LogInRequest {
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

  // @IsOptional()
  // logData?: any;
}
