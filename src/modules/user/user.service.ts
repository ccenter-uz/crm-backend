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

  async validate(username: string, password: string): Promise<any> {
    const methodName: string = this.validate.name;
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

    const user = await this.validate(data.username, data.password);
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
      user: { id: user._id, fullName: user.full_name, role: user.role },
    };
    this.logger.debug(`Method: ${methodName} - Response: `, response);

    return response;
  }

  async create(
    data: UserInterfaces.CreateUserDto
  ): Promise<UserInterfaces.UserResponse> {
    const methodName: string = this.create.name;
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
      fullName: createdUser.full_name,
      role: createdUser.role,
      deletedAt: createdUser.deleted_at
        ? unixTimestampToDate(createdUser.deleted_at)
        : null,
      updatedAt: createdUser.updated_at
        ? unixTimestampToDate(createdUser.updated_at)
        : null,
      createdAt: createdUser.created_at
        ? unixTimestampToDate(createdUser.created_at)
        : null,
    };

    this.logger.debug(`Method: ${methodName} - Response: `, response);

    return response;
  }

  async getById(userId: string): Promise<UserInterfaces.UserResponse> {
    const methodName: string = this.getById.name;
    this.logger.debug(`Method: ${methodName} - Request: `, userId);

    const user = await this.userModel.findOne({
      _id: userId,
      status: DefaultStatusEnum.Active,
    });

    if (!user) {
      this.logger.debug(`Method: ${methodName} - User Not Found`);
      throw new NotFoundException('User not found');
    }

    const response: UserInterfaces.UserResponse = {
      id: user._id.toString(),
      username: user.username,
      fullName: user.full_name,
      role: user.role,
      deletedAt: user.deleted_at ? unixTimestampToDate(user.deleted_at) : null,
      updatedAt: user.updated_at ? unixTimestampToDate(user.updated_at) : null,
      createdAt: user.created_at ? unixTimestampToDate(user.created_at) : null,
    };

    this.logger.debug(`Method: ${methodName} - Response: `, response);

    return response;
  }
  async getAll(): Promise<UserInterfaces.UsersResponse> {
    const methodName: string = this.getAll.name;
    this.logger.debug(`Method: ${methodName} - Fetching all users`);

    const users = await this.userModel
      .find({
        status: DefaultStatusEnum.Active,
      })
      .sort({ created_at: 1 }); // Sort by created_at in ascending order (oldest first)

    const userResponses: UserInterfaces.UserResponse[] = users.map((user) => ({
      id: user._id.toString(),
      username: user.username,
      fullName: user.full_name,
      role: user.role,
      deletedAt: user.deleted_at ? unixTimestampToDate(user.deleted_at) : null,
      updatedAt: user.updated_at ? unixTimestampToDate(user.updated_at) : null,
      createdAt: user.created_at ? unixTimestampToDate(user.created_at) : null,
    }));

    const response: UserInterfaces.UsersResponse = {
      totalDocs: userResponses.length,
      totalPage: 1, // Assuming no pagination is implemented yet
      currentPage: 1, // Assuming no pagination is implemented yet
      data: userResponses,
    };

    this.logger.debug(
      `Method: ${methodName} - Response - Total: ${response.totalDocs}`
    );

    return response;
  }

  async update(
    userId: string,
    data: UserInterfaces.UpdateUserDto
  ): Promise<UserInterfaces.UserResponse> {
    const methodName: string = this.update.name;
    this.logger.debug(`Method: ${methodName} - Request: `, { userId, data });

    const user = await this.userModel.findOne({
      _id: userId,
      status: DefaultStatusEnum.Active,
    });

    if (!user) {
      this.logger.debug(`Method: ${methodName} - User Not Found`);
      throw new NotFoundException('User not found');
    }

    if (data.password) {
      data.password = await hashPassword(data.password);
    }

    Object.assign(
      user,
      { ...data, full_name: data.fullName },
      {
        updated_at: Math.floor(new Date().getTime() / 1000).toString(),
      }
    );

    await user.save();

    const response: UserInterfaces.UserResponse = {
      id: user._id.toString(),
      username: user.username,
      fullName: user.full_name,
      role: user.role,
      deletedAt: user.deleted_at ? unixTimestampToDate(user.deleted_at) : null,
      updatedAt: user.updated_at ? unixTimestampToDate(user.updated_at) : null,
      createdAt: user.created_at ? unixTimestampToDate(user.created_at) : null,
    };

    this.logger.debug(`Method: ${methodName} - Response: `, response);

    return response;
  }

  async delete(userId: string): Promise<void> {
    const methodName: string = this.delete.name;
    this.logger.debug(`Method: ${methodName} - Request: `, userId);

    const user = await this.userModel.findOne({
      _id: userId,
      status: DefaultStatusEnum.Active,
    });

    if (!user) {
      this.logger.debug(`Method: ${methodName} - User Not Found`);
      throw new NotFoundException('User not found');
    }

    user.status = DefaultStatusEnum.InActive;
    user.deleted_at = Math.floor(new Date().getTime() / 1000).toString();
    await user.save();

    this.logger.debug(`Method: ${methodName} - User Deleted: `, userId);
  }

  async restore(userId: string): Promise<UserInterfaces.UserResponse> {
    const methodName: string = this.restore.name;
    this.logger.debug(`Method: ${methodName} - Request: `, userId);

    const user = await this.userModel.findOne({
      _id: userId,
      status: DefaultStatusEnum.InActive,
    });

    if (!user) {
      this.logger.debug(`Method: ${methodName} - User Not Found`);
      throw new NotFoundException('User not found');
    }

    user.status = DefaultStatusEnum.Active;
    user.deleted_at = null;
    user.updated_at = Math.floor(new Date().getTime() / 1000).toString();

    await user.save();

    const response: UserInterfaces.UserResponse = {
      id: user._id.toString(),
      username: user.username,
      fullName: user.full_name,
      role: user.role,
      deletedAt: null,
      updatedAt: user.updated_at ? unixTimestampToDate(user.updated_at) : null,
      createdAt: user.created_at ? unixTimestampToDate(user.created_at) : null,
    };

    this.logger.debug(`Method: ${methodName} - User Restored: `, response);

    return response;
  }
}
