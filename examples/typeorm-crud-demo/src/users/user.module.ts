import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserRepository } from './user.repository';
import { UsersController } from './user.controler';
import { TypeOrmModule } from '@aiofc/nestjs-typeorm';
import { UserProfile } from '@aiofc/entities';

@Module({
  imports: [TypeOrmModule.forFeature([UserProfile])],
  controllers: [UsersController],
  providers: [UserService, UserRepository],
})
export class UsersModule {}
