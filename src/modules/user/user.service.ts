import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from 'src/models/schemas/user.schema';
import { UserInterfaces, UserLogInDto } from 'src/types/user';
import * as bcrypt from 'bcrypt';
import { DefaultStatusEnum } from 'src/types/global';
import * as Config from '../../common/config/app.config';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class UserService {
  private logger = new Logger(UserService.name);

  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    private readonly jwtService: JwtService
  ) {}

  async validateUser(username: string, password: string): Promise<any> {
    const methodName: string = this.validateUser.name;
    this.logger.debug(`Method: ${methodName} - Validate Method: `, {
      username,
      password,
    });

    const user = await this.userModel.findOne({
      username,
      status: DefaultStatusEnum.Active,
    });

    if (!user) {
      this.logger.debug(`Method: ${methodName} - User Not Found`);
      throw new UnauthorizedException('Invalid username or password');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      this.logger.debug(`Method: ${methodName} - User Not Valid`);
      throw new UnauthorizedException('Invalid username or password');
    }

    this.logger.debug(`Method: ${methodName} - User FindOne: `, user);

    return user;
  }

  async logIn(data: UserLogInDto): Promise<UserInterfaces.LogInResponse> {
    const methodName: string = this.logIn.name;

    this.logger.debug(`Method: ${methodName} - Request: `, data);

    const user = await this.validateUser(data.username, data.password);
    this.logger.debug(`Method: ${methodName} - Validate Response: `, user);

    const accessToken = this.jwtService.sign(
      {
        userId: user.id,
        roleId: user.roleId,
      },
      { expiresIn: Config.JwtConfig.expiresIn }
    );

    const response: UserInterfaces.LogInResponse = {
      accessToken,
      permissions: [],
      user: { id: user._id, name: user.name, role: user.role },
    };
    this.logger.debug(`Method: ${methodName} - Response: `, response);

    return response;
  }
}
