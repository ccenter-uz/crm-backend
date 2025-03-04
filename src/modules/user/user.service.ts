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
import getCurrentTime from 'src/common/helpers/get-current-time.helper';

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
      user: { id: user._id, full_name: user.full_name, role: user.role },
    };
    this.logger.debug(`Method: ${methodName} - Response: `, response);

    return response;
  }

  async create(data: UserInterfaces.CreateUserDto): Promise<UserDocument> {
    const methodName: string = this.create.name;
    this.logger.debug(`Method: ${methodName} - Request: `, data);

    const hashedPassword = await hashPassword(data.password);
    const createdUser = new this.userModel({
      ...data,
      password: hashedPassword,
      status: DefaultStatusEnum.Active,
      created_at: getCurrentTime(),
    });

    await createdUser.save();
    this.logger.debug(`Method: ${methodName} - User Created: `, createdUser);

    return createdUser;
  }

  async getById(userId: string): Promise<UserDocument> {
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

    this.logger.debug(`Method: ${methodName} - Response: `, user);

    return user;
  }

  async getAll(
    query: UserInterfaces.UserQuery
  ): Promise<UserInterfaces.UsersResponse> {
    const methodName: string = this.getAll.name;
    this.logger.debug(
      `Method: ${methodName} - Fetching users with filters:`,
      query
    );

    const { full_name, username, role, page = 1, limit = 10 } = query;

    // Build the filter object
    const filter: any = { status: DefaultStatusEnum.Active };

    // Add optional filters if they exist
    if (full_name) {
      filter.full_name = { $regex: full_name, $options: 'i' }; // case-insensitive search
    }

    if (username) {
      filter.username = { $regex: username, $options: 'i' };
    }

    if (role) {
      filter.role = role;
    }

    // Calculate pagination parameters
    const skip = (page - 1) * limit;

    // Count total documents matching the filter
    const totalDocs = await this.userModel.countDocuments(filter);
    const totalPages = Math.ceil(totalDocs / limit);

    // Get paginated results
    const users = await this.userModel
      .find(filter)
      .sort({ created_at: 1 })
      .skip(skip)
      .limit(limit);

    const response: UserInterfaces.UsersResponse = {
      total_docs: totalDocs,
      total_page: totalPages,
      current_page: page,
      data: users,
    };

    this.logger.debug(
      `Method: ${methodName} - Response - Total: ${response.total_docs}, Page: ${page}/${totalPages}`
    );

    return response;
  }

  async update(
    userId: string,
    data: UserInterfaces.UpdateUserDto
  ): Promise<UserDocument> {
    const methodName: string = this.update.name;
    this.logger.debug(`Method: ${methodName} - Request: `, { userId, data });

    const user = await this.getById(userId);

    if (data.password) {
      data.password = await hashPassword(data.password);
    }

    Object.assign(user, data, {
      updated_at: getCurrentTime(),
    });

    await user.save();

    this.logger.debug(`Method: ${methodName} - Response: `, user);

    return user;
  }

  async delete(userId: string): Promise<void> {
    const methodName: string = this.delete.name;
    this.logger.debug(`Method: ${methodName} - Request: `, userId);

    const user = await this.getById(userId);

    user.status = DefaultStatusEnum.InActive;
    user.deleted_at = getCurrentTime();
    await user.save();

    this.logger.debug(`Method: ${methodName} - User Deleted: `, userId);
  }

  async restore(userId: string): Promise<UserDocument> {
    const methodName: string = this.restore.name;
    this.logger.debug(`Method: ${methodName} - Request: `, userId);

    const user = await this.getById(userId);

    user.status = DefaultStatusEnum.Active;
    user.deleted_at = null;
    user.updated_at = getCurrentTime();

    await user.save();

    this.logger.debug(`Method: ${methodName} - User Restored: `, user);

    return user;
  }
}
