import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { UserService } from 'src/modules/user/user.service';
import { UserSeedData } from 'src/types/seeder';

@Injectable()
export class UserSeedService {
  private logger = new Logger(UserSeedService.name);

  constructor(private readonly userService: UserService) {}

  async seed() {
    this.logger.debug('Starting database seeding...');

    // for (const role of UserSeedData) {
    //   // seeding user
    // }

    this.logger.debug('Database seeding completed.');
  }
}
