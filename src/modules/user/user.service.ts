import {
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from 'src/models/schemas/user.schema';
import { UserInterfaces } from 'src/types/user';
import * as bcrypt from 'bcryptjs';
import { DefaultStatusEnum } from 'src/types/global';
import * as Config from '../../common/config/app.config';
import { JwtService } from '@nestjs/jwt';
import { UserLogInDto } from 'src/types/user';
import { unixTimestampToDate } from 'src/common/helpers/date.helper';
import { hashPassword } from 'src/common/helpers/hash.helper';

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
        // organizationId: user.organization_id,
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

  async createUser(
    data: UserInterfaces.CreateUserDto
  ): Promise<UserInterfaces.UserResponse> {
    const methodName: string = this.createUser.name;
    this.logger.debug(`Method: ${methodName} - Request: `, data);

    const hashedPassword = await hashPassword(data.password);
    const createdUser = new this.userModel({
      ...data,
      full_name: data.fullName,
      password: hashedPassword,
      status: DefaultStatusEnum.Active,
      created_at: Math.floor(new Date().getTime() / 1000).toString(),
    });

    await createdUser.save();
    this.logger.debug(`Method: ${methodName} - User Created: `, createdUser);

    const response: UserInterfaces.UserResponse = {
      id: createdUser._id.toString(),
      username: createdUser.username,
      full_name: createdUser.full_name,
      role: createdUser.role,
      deleted_at: createdUser.deleted_at
        ? unixTimestampToDate(createdUser.deleted_at)
        : null,
      updated_at: createdUser.updated_at
        ? unixTimestampToDate(createdUser.updated_at)
        : null,
      created_at: createdUser.created_at
        ? unixTimestampToDate(createdUser.created_at)
        : null,
    };

    this.logger.debug(`Method: ${methodName} - Response: `, response);

    return response;
  }

  async getUserById(userId: string): Promise<UserInterfaces.UserResponse> {
    const methodName: string = this.getUserById.name;
    this.logger.debug(`Method: ${methodName} - Request: `, userId);

    const user = await this.userModel.findById(userId);
    if (!user) {
      this.logger.debug(`Method: ${methodName} - User Not Found`);
      throw new NotFoundException('User not found');
    }

    const response: UserInterfaces.UserResponse = {
      id: user._id.toString(),
      username: user.username,
      full_name: user.full_name,
      role: user.role,
      deleted_at: user.deleted_at ? unixTimestampToDate(user.deleted_at) : null,
      updated_at: user.updated_at ? unixTimestampToDate(user.updated_at) : null,
      created_at: user.created_at ? unixTimestampToDate(user.created_at) : null,
    };

    this.logger.debug(`Method: ${methodName} - Response: `, response);

    return response;
  }

  async updateUser(
    userId: string,
    data: UserInterfaces.UpdateUserDto
  ): Promise<UserInterfaces.UserResponse> {
    const methodName: string = this.updateUser.name;
    this.logger.debug(`Method: ${methodName} - Request: `, { userId, data });

    const user = await this.userModel.findById(userId);
    if (!user) {
      this.logger.debug(`Method: ${methodName} - User Not Found`);
      throw new NotFoundException('User not found');
    }

    if (data.password) {
      data.password = await hashPassword(data.password);
    }

    Object.assign(user, data, {
      updated_at: Math.floor(new Date().getTime() / 1000).toString(),
    });
    await user.save();

    const response: UserInterfaces.UserResponse = {
      id: user._id.toString(),
      username: user.username,
      full_name: user.full_name,
      role: user.role,
      deleted_at: user.deleted_at ? unixTimestampToDate(user.deleted_at) : null,
      updated_at: user.updated_at ? unixTimestampToDate(user.updated_at) : null,
      created_at: user.created_at ? unixTimestampToDate(user.created_at) : null,
    };

    this.logger.debug(`Method: ${methodName} - Response: `, response);

    return response;
  }

  async deleteUser(userId: string): Promise<void> {
    const methodName: string = this.deleteUser.name;
    this.logger.debug(`Method: ${methodName} - Request: `, userId);

    const user = await this.userModel.findById(userId);
    if (!user) {
      this.logger.debug(`Method: ${methodName} - User Not Found`);
      throw new NotFoundException('User not found');
    }

    user.status = DefaultStatusEnum.InActive;
    user.deleted_at = Math.floor(new Date().getTime() / 1000).toString();
    await user.save();

    this.logger.debug(`Method: ${methodName} - User Deleted: `, userId);
  }
}
